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
  SUPABASE_URL,
  SUPABASE_KEY,
  N8N_WEBHOOK_URL,
  PORT = 3000,
} = process.env;

// Ensure required variables are set
if (!SUPABASE_URL || !SUPABASE_KEY || !N8N_WEBHOOK_URL) {
  console.error('Error: Missing required environment variables. Please check your .env file.');
  process.exit(1); // Exit with a failure code
}

// --- Section 3: Supabase Client Initialization ---

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Section 4: Express App and Middleware Setup ---

// Initialize Express app
const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Custom request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  // Log body only if it's not empty
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// --- Section 5: Helper Functions ---

/**
 * Validates that a string is non-empty and of type string.
 * @param {any} str The string to validate.
 * @param {string} fieldName The name of the field for clear error messages.
 * @returns {string} The validated, trimmed string.
 * @throws {Error} If the validation fails.
 */
const validateString = (str, fieldName) => {
  if (typeof str !== 'string' || str.trim() === '') {
    throw new Error(`Validation Error: ${fieldName} must be a non-empty string.`);
  }
  return str.trim();
};

/**
 * Saves a lead to the Supabase 'leads' table.
 * @param {object} lead The lead object to save.
 * @returns {Promise<object>} The data of the saved lead.
 */
const saveLeadToSupabase = async (lead) => {
  try {
    const { data, error } = await supabase.from('leads').insert([lead]).select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error saving lead to Supabase:', error.message);
    throw new Error('Failed to save lead to Supabase.');
  }
};

/**
 * Fetches all leads from the Supabase 'leads' table.
 * @returns {Promise<Array<object>>} An array of lead objects.
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
 * Sends a WhatsApp message using an n8n webhook.
 * @param {string} phone The recipient's phone number.
 * @param {string} message The message content.
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
      const errorBody = await response.text();
      throw new Error(`n8n webhook failed with status ${response.status}: ${errorBody}`);
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
 * Serves a friendly HTML dashboard.
 */
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>SmartChat Assistant</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1, h2 { color: #333; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        form { margin-top: 2em; padding: 1.5em; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; max-width: 500px; }
        label, input, select, button { display: block; width: 100%; margin-bottom: 1em; box-sizing: border-box; }
        input, select { padding: 10px; border-radius: 4px; border: 1px solid #ccc; }
        button { background-color: #007bff; color: white; border: none; padding: 12px; cursor: pointer; border-radius: 4px; font-size: 16px; }
        button:hover { background-color: #0056b3; }
        pre { background-color: #eee; padding: 1em; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; }
      </style>
    </head>
    <body>
      <h1>SmartChat Assistant</h1>
      <p>Welcome! The server is up and running.</p>
      <h2>Available Links:</h2>
      <ul>
        <li><a href="/mcp">GET /mcp</a> - See available tools.</li>
        <li><a href="/health">GET /health</a> - Check server status.</li>
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
        <input type="text" id="parameters" name="parameters" value='{"phone": "1234567890", "message": "Hello from SmartChat!"}'>
        <button type="submit">Execute Tool</button>
      </form>
      <pre id="response">API response will appear here...</pre>
      <script>
        document.getElementById('call-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const tool_name = e.target.tool_name.value;
          const parameters = JSON.parse(e.target.parameters.value);
          const responseElement = document.getElementById('response');
          responseElement.textContent = 'Executing...';
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
 * Returns the operational status of the server.
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: "SmartChat Assistant is running" });
});

/**
 * GET /manifest
 * Returns a JSON manifest for OpenAI Apps integration.
 */
app.get('/manifest', (req, res) => {
  res.status(200).json({
    schema_version: "v1",
    name_for_model: "SmartChatAssistant",
    name_for_human: "SmartChat Assistant",
    description_for_model: "An assistant to manage leads, send messages, and set up auto-replies.",
    description_for_human: "Manage your customer interactions seamlessly.",
    auth: { type: "none" },
    api: { type: "openapi", url: "/openapi.yaml" }, // Note: openapi.yaml is a placeholder.
    logo_url: "https://example.com/logo.png",
    contact_email: "support@example.com",
    legal_info_url: "https://example.com/legal"
  });
});

/**
 * GET /mcp (Machine-Readable Capability Profile)
 * Returns a list of available tools and their descriptions.
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
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: `Lead with ID ${id} not found.` });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching lead:', error.message);
    res.status(500).json({ error: 'Failed to fetch lead.' });
  }
});

/**
 * POST /call
 * Executes a specific tool based on the provided tool_name.
 */
app.post('/call', async (req, res) => {
  try {
    const { tool_name, parameters = {} } = req.body;

    validateString(tool_name, 'tool_name');

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
        result = { success: true, message: "Auto-reply saved.", data: data[0] };
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
        result = { success: true, message: "Message sent via n8n.", data: n8nResponse };
        break;
      }

      default:
        return res.status(400).json({ error: `Tool '${tool_name}' is not a valid tool.` });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error executing tool:', error.message);
    res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
});

// --- Section 7: Server Initialization ---

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`SmartChat Assistant is running on http://localhost:${PORT}`);
});