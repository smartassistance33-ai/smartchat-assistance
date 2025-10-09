import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const supabase = createClient(
  process.env.SUPABASE_URL || "https://your-supabase-url.supabase.co",
  process.env.SUPABASE_ANON_KEY || "your-supabase-anon-key"
);

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>SmartChat Assistant</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 2em; background: #f8f9fa; }
        h1 { color: #2c3e50; }
        .links { margin-bottom: 1em; }
        form { background: #fff; border: 1px solid #ddd; padding: 1em; border-radius: 10px; max-width: 400px; }
        label { display: block; margin-top: 1em; }
        input, select, textarea { width: 100%; padding: 0.5em; margin-top: 0.3em; border: 1px solid #ccc; border-radius: 5px; }
        button { margin-top: 1em; padding: 0.6em 1.2em; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .result { margin-top: 1em; background: #eef; padding: 1em; border-radius: 8px; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <h1>🤖 SmartChat Assistant</h1>
      <div class="links">
        <p>
          <a href="/mcp" target="_blank">View /mcp</a> |
          <a href="/health" target="_blank">View /health</a> |
          <a href="/test-db" target="_blank">Test Database</a>
        </p>
      </div>

      <form id="callForm">
        <label for="tool">Select Tool:</label>
        <select id="tool" name="tool" required>
          <option value="view_leads">View Leads</option>
          <option value="setup_auto_reply">Setup Auto Reply</option>
          <option value="send_message">Send Message</option>
        </select>

        <div id="argsFields"></div>

        <button type="submit">Run Tool</button>
      </form>

      <div class="result" id="result"></div>

      <script>
        const argsFields = document.getElementById('argsFields');
        const toolSelect = document.getElementById('tool');
        const resultDiv = document.getElementById('result');

        function renderArgsFields(tool) {
          let html = '';
          if (tool === 'setup_auto_reply') {
            html += '<label>Keyword:<input name="keyword" required></label>';
            html += '<label>Reply:<input name="reply" required></label>';
          } else if (tool === 'send_message') {
            html += '<label>Phone:<input name="phone" required></label>';
            html += '<label>Message:<textarea name="message" required></textarea></label>';
          }
          argsFields.innerHTML = html;
        }

        toolSelect.addEventListener('change', e => renderArgsFields(e.target.value));
        renderArgsFields(toolSelect.value);

        document.getElementById('callForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          const tool = toolSelect.value;
          const formData = new FormData(this);
          const args = {};
          formData.forEach((v, k) => { if (k !== 'tool') args[k] = v; });

          resultDiv.textContent = 'Processing...';

          try {
            const res = await fetch('/call', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tool, args })
            });
            const data = await res.json();
            resultDiv.textContent = JSON.stringify(data, null, 2);
          } catch (err) {
            resultDiv.textContent = 'Error: ' + err.message;
          }
        });
      </script>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*');

    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: 'Make sure the "tools" table exists in your Supabase database and SUPABASE_URL and SUPABASE_ANON_KEY are properly configured.'
      });
    }

    res.json({ 
      success: true, 
      message: 'Successfully connected to Supabase!',
      rowCount: data?.length || 0,
      data 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

app.get('/mcp', (req, res) => {
  res.json({
    tools: [
      {
        name: 'view_leads',
        description: 'View all leads from the database',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'setup_auto_reply',
        description: 'Setup an automatic reply for a keyword',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: { type: 'string', description: 'The keyword to trigger the auto-reply' },
            reply: { type: 'string', description: 'The automatic reply message' }
          },
          required: ['keyword', 'reply']
        }
      },
      {
        name: 'send_message',
        description: 'Send a message via webhook',
        inputSchema: {
          type: 'object',
          properties: {
            phone: { type: 'string', description: 'Phone number to send message to' },
            message: { type: 'string', description: 'Message content' }
          },
          required: ['phone', 'message']
        }
      }
    ]
  });
});

app.post('/call', async (req, res) => {
  const { tool, args } = req.body;

  try {
    if (tool === 'view_leads') {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data });
    }

    if (tool === 'setup_auto_reply') {
      const { keyword, reply } = args;
      const { data, error } = await supabase
        .from('auto_replies')
        .insert([{ keyword, reply }])
        .select();

      if (error) throw error;
      return res.json({ success: true, data });
    }

    if (tool === 'send_message') {
      const { phone, message } = args;
      const webhookUrl = process.env.N8N_WEBHOOK_URL;

      if (!webhookUrl || webhookUrl.includes('your-n8n-instance')) {
        return res.json({ 
          success: false, 
          error: 'N8N_WEBHOOK_URL not configured. Please set up your webhook URL.' 
        });
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
      });

      const result = await response.json();
      return res.json({ success: true, data: result });
    }

    res.status(400).json({ success: false, error: 'Unknown tool' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`✅ Smart Chat Assistant running at http://${HOST}:${PORT}`);
});
