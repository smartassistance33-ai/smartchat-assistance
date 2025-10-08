
const express = require('express');
const app = express();
// ------------------------
// Root HTML Page
// ------------------------
app.get('/', (req, res) => {
	res.send(`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>SmartChat Assistant</title>
			<style>
				body { font-family: Arial, sans-serif; margin: 2em; }
				h1 { color: #2c3e50; }
				.links { margin-bottom: 1em; }
				form { border: 1px solid #ccc; padding: 1em; border-radius: 8px; max-width: 400px; }
				label { display: block; margin-top: 1em; }
				input, select, textarea { width: 100%; padding: 0.5em; margin-top: 0.2em; }
				button { margin-top: 1em; padding: 0.5em 1em; }
				.result { margin-top: 1em; background: #f4f4f4; padding: 1em; border-radius: 8px; }
			</style>
		</head>
		<body>
			<h1>SmartChat Assistant</h1>
			<div class="links">
				<p>
					<a href="/mcp" target="_blank">View /mcp</a> |
					<a href="/health" target="_blank">View /health</a>
				</p>
			</div>
			<form id="callForm">
				<label for="tool">Tool:</label>
				<select id="tool" name="tool" required>
					<option value="view_leads">View Leads</option>
					<option value="setup_auto_reply">Setup Auto Reply</option>
					<option value="send_message">Send Message</option>
				</select>

				<div id="argsFields"></div>

				<button type="submit">Call Tool</button>
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

				toolSelect.addEventListener('change', e => {
					renderArgsFields(e.target.value);
				});
				renderArgsFields(toolSelect.value);

				document.getElementById('callForm').addEventListener('submit', async function(e) {
					e.preventDefault();
					const tool = toolSelect.value;
					const formData = new FormData(this);
					let args = {};
					formData.forEach((v, k) => { if (k !== 'tool') args[k] = v; });
					const body = { tool, args };
					resultDiv.textContent = 'Loading...';
					try {
						const res = await fetch('/call', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(body)
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

require('dotenv').config();
const cors = require('cors');
const fetch = require('node-fetch'); // Needed for n8n fetch calls
const { createClient } = require('@supabase/supabase-js');

app.use(cors());
app.use(express.json());

// ------------------------
// Environment & Clients
// ------------------------
const PORT = process.env.PORT || 3001;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

// ------------------------
// Helper Functions
// ------------------------
function validateString(str, fieldName) {
	if (!str || typeof str !== 'string') throw new Error(`${fieldName} is required`);
}

async function saveLeadToSupabase(lead) {
	const { data, error } = await supabase.from('leads').insert([lead]);
	if (error) throw error;
	return data;
}

async function getLeadsFromSupabase() {
	const { data, error } = await supabase.from('leads').select('*');
	if (error) throw error;
	return data;
}

async function sendWhatsAppViaN8N(phone, message) {
	try {
		const response = await fetch(N8N_WEBHOOK_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ phone, message })
		});
		return await response.json();
	} catch (err) {
		return { error: err.message };
	}
}

// ------------------------
// Middleware - Logging
// ------------------------
app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, req.body);
	next();
});

// ------------------------
// Endpoints
// ------------------------
app.get('/mcp', (req, res) => {
	res.json({
		name: "SmartChat Assistant",
		description: "Cloud MCP server demo",
		tools: [
			{ id: "setup_auto_reply", name: "Setup Auto Reply", description: "Configure keyword replies" },
			{ id: "view_leads", name: "View Leads", description: "Return saved leads" },
			{ id: "send_message", name: "Send Message", description: "Send WhatsApp message via n8n" }
		]
	});
});

app.get('/lead/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
		if (error || !data) return res.json({ error: "Lead not found" });
		res.json(data);
	} catch (err) {
		res.json({ error: err.message });
	}
});

app.post('/call', async (req, res) => {
	const { tool, args } = req.body || {};
	try {
		if (tool === 'view_leads') {
			const leads = await getLeadsFromSupabase();
			return res.json({ status: 'ok', leads });
		}
		if (tool === 'setup_auto_reply') {
			validateString(args.keyword, 'keyword');
			validateString(args.reply, 'reply');
			const lead = await saveLeadToSupabase({ ...args, created_at: new Date() });
			return res.json({ status: 'ok', lead });
		}
		if (tool === 'send_message') {
			validateString(args.phone, 'phone');
			validateString(args.message, 'message');
			const result = await sendWhatsAppViaN8N(args.phone, args.message);
			return res.json({ status: 'ok', result });
		}
		res.json({ error: 'Unknown tool' });
	} catch (err) {
		res.json({ error: err.message });
	}
});

app.get('/manifest', (req, res) => {
	res.json({
		name: "SmartChat Assistant",
		description: "Cloud MCP server demo",
		logo_url: "https://example.com/logo.png",
		tools: [
			{ id: "setup_auto_reply", name: "Setup Auto Reply", description: "Configure keyword replies" },
			{ id: "view_leads", name: "View Leads", description: "Return saved leads" },
			{ id: "send_message", name: "Send Message", description: "Send WhatsApp message via n8n" }
		]
	});
});

app.get('/health', (req, res) => {
	res.json({ status: "ok", uptime: process.uptime() });
});

// ------------------------
// Start Server
// ------------------------
app.listen(PORT, () => {
	console.log(`✅ SmartChat Assistant running at http://localhost:${PORT}`);
});
