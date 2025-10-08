// index.js

// --- Section 1: Imports and Environment Configuration ---

// Import necessary modules
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Load environment variables from .env file
dotenv.config();

// --- Section 2: Environment Variable Validation & Constants ---

// Validate and retrieve environment variables
const {
  PORT = 3000,
  SUPABASE_URL,
  SUPABASE_KEY,
  N8N_WEBHOOK_URL,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY || !N8N_WEBHOOK_URL) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// --- Section 3: Supabase Client Initialization ---

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Section 4: Express App and Middleware Setup ---

// Initialize Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Custom request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// --- Section 5: Helper Functions ---

/**
 * Validates that a string is non-empty.
 * @param {string} str The string to validate.
 * @param {string} fieldName The name of the field for error messages.
 * @returns {string} The validated string.
 * @throws {Error} If the string is invalid.
 */
const validateString = (str, fieldName) => {
  if (typeof str !== 'string' || str.trim() === '') {
    throw new Error(`${fieldName} must be a non-empty string.`);
  }
  return str.trim();
};

/**
 * Saves a lead to the Supabase 'leads' table.
 * @param {object} lead The lead object to save.
 * @returns {Promise<object>} The saved lead data.
 */
const saveLeadToSupabase = async (lead) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error saving lead to Supabase:', error.message);
    throw new Error('Failed to save lead to Supabase.');
  }
};

/**
 * Fetches all leads from the Supabase 'leads' table.
 * @returns {Promise<Array<object>>} A list of all leads.
 */
const getLeadsFromSupabase = async () => {
  try {
    const { data, error } = await supabase.from('leads').select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching leads from Supabase:', error.message);
    throw new Error('Failed to fetch leads from Supabase.');
  }
};

/**
 * Sends a WhatsApp message via an n8n webhook.
 * @param {string} phone The recipient's phone number.
 * @param {string} message The message to send.
 * @returns {Promise<object>} The JSON response from the n8n webhook.
 */
const sendWhatsAppViaN8N = async (phone, message) => {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending WhatsApp message via n8n:', error.message);
    throw new Error('Failed to send WhatsApp message.');
  }
};


// --- Section 6: API Endpoints ---

/**
 * GET /
 * Serves a friendly HTML page with links and a form to test the /call endpoint.
 */
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SmartChat Assistant</title>
      <style>
        body { font-family: sans-serif; padding: 2em; line-height: 1.6; }
        h1, h2 { color: #333; }
        a { color: #007bff; }
        form { margin-top: 2em; padding: 1em; border: 1px solid #ccc; border-radius: 5px; }
        label, input, select, button { display: block; margin-bottom: 1em; width: 100%; max-width: 400px; }
        input, select { padding: 8px; }
        button { background-color: #007bff; color: white; border: none; padding: 10px; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>SmartChat Assistant</h1>
      <p>Welcome! The server is running correctly.</p>
      <h2>Available Links:</h2>
      <ul>
        <li><a href="/mcp">GET /mcp</a> - View available tools</li>
        <li><a href="/health">GET /health</a> - Check server status</li>
      </ul>
      <h2>Test POST /call</h2>
      <form id="call-form">
        <label for="tool_name">Tool:</label>
        <select id="tool_name" name="tool_name">
          <option value="setup_auto_reply">setup_auto_reply</option>
          <option value="view_leads">view_leads</option>
          <option value="send_message">send_message</option>
        </select>
        <label for="parameters">Parameters (JSON):</label>
        <input type="text" id="parameters" name="parameters" value='{"phone": "1234567890", "message": "Hello!"}'>
        <button type="submit">Execute</button>
      </form>
      <pre id="response"></pre>
      <script>
        document.getElementById('call-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const tool_name = e.target.tool_name.value;
          const parameters = JSON.parse(e.target.parameters.value);
          const responseElement = document.getElementById('response');
          responseElement.textContent = 'Loading...';
          try {
            const res = await fetch('/call', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tool_name, parameters }),
            });
            const data = await res.json();
            responseElement.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            responseElement.textContent = 'Error: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `);
});

/**
 * GET /health
 * Returns the server status.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /manifest
 * Returns the OpenAI Apps SDK manifest.
 */
app.get('/manifest', (req, res) => {
  res.status(200).json({
    "schema_version": "v1",
    "name_for_model": "SmartChatAssistant",
    "name_for_human": "SmartChat Assistant",
    "description_for_model": "An assistant that can manage leads, send messages, and set up auto-replies.",
    "description_for_human": "Manage your customer interactions seamlessly.",
    "auth": { "type": "none" },
    "api": { "type": "openapi", "url": "/openapi.yaml" }, // Note: openapi.yaml not implemented, placeholder.
    "logo_url": "https://example.com/logo.png",
    "contact_email": "support@example.com",
    "legal_info_url": "https://example.com/legal"
  });
});

/**
 * GET /mcp (Machine-Readable Capability Profile)
 * Returns a list of available tools.
 */
app.get('/mcp', (req, res) => {
  res.status(200).json({
    tools: [
      { name: 'setup_auto_reply', description: 'Saves an auto-reply message to the database.', parameters: '{ "message": "string", "reply_to": "string" }' },
      { name: 'view_leads', description: 'Fetches all leads from the database.', parameters: '{}' },
      { name: 'send_message', description: 'Sends a WhatsApp message via n8n.', parameters: '{ "phone": "string", "message": "string" }' },
    ],
  });
});

/**
 * GET /lead/:id
 * Fetches a specific lead from Supabase by its ID.
 */
app.get('/lead/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single(); // .single() returns one object instead of an array

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: `Lead with id ${id} not found.` });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching lead:', error.message);
    res.status(500).json({ error: 'Failed to fetch lead.' });
  }
});

/**
 * POST /call
 * Executes a specific tool based on the request body.
 */
app.post('/call', async (req, res) => {
  try {
    const { tool_name, parameters } = req.body;

    if (!tool_name) {
      return res.status(400).json({ error: 'tool_name is required.' });
    }

    let result;

    switch (tool_name) {
      case 'setup_auto_reply': {
        const message = validateString(parameters.message, 'message');
        const reply_to = validateString(parameters.reply_to, 'reply_to');

        const { data, error } = await supabase
          .from('auto_replies')
          .insert([{ message, reply_to }])
          .select();

        if (error) throw error;
        result = { success: true, data: data[0] };
        break;
      }

      case 'view_leads': {
        const leads = await getLeadsFromSupabase();
        result = { success: true, data: leads };
        break;
      }

      case 'send_message': {
        const phone = validateString(parameters.phone, 'phone');
        const message = validateString(parameters.message, 'message');
        const n8nResponse = await sendWhatsAppViaN8N(phone, message);
        result = { success: true, data: n8nResponse };
        break;
      }

      default:
        return res.status(400).json({ error: `Tool '${tool_name}' is not a valid tool.` });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(`Error executing tool:`, error.message);
    res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
});


// --- Section 7: Server Initialization ---

// Start the server
app.listen(PORT, () => {
  console.log(`SmartChat Assistant is running on http://localhost:${PORT}`);
});