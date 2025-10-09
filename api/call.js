import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Initialize Supabase client using environment variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- Helper Functions ---

const validateString = (str, fieldName) => {
  if (!str || typeof str !== 'string' || str.trim() === '') {
    throw new Error(`${fieldName} is required and must be a non-empty string.`);
  }
  return str.trim();
};

const getLeadsFromSupabase = async () => {
  const { data, error } = await supabase.from('leads').select('*');
  if (error) throw new Error(`Supabase error (getLeads): ${error.message}`);
  return data;
};

const saveLeadToSupabase = async (leadData) => {
  const { data, error } = await supabase.from('leads').insert([leadData]).select();
  if (error) throw new Error(`Supabase error (saveLead): ${error.message}`);
  return data[0];
};

const sendWhatsAppViaN8N = async (phone, message) => {
  const response = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message }),
  });
  if (!response.ok) {
    throw new Error(`n8n webhook failed with status: ${response.status}`);
  }
  return response.json();
};

// --- Main Serverless Function Handler ---

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { tool, args } = req.body;
    validateString(tool, 'tool');

    let result;

    switch (tool) {
      case 'view_leads':
        result = await getLeadsFromSupabase();
        break;

      case 'setup_auto_reply': {
        const keyword = validateString(args.keyword, 'keyword');
        const reply = validateString(args.reply, 'reply');
        result = await saveLeadToSupabase({ keyword, reply, created_at: new Date() });
        break;
      }

      case 'send_message': {
        const phone = validateString(args.phone, 'phone');
        const message = validateString(args.message, 'message');
        result = await sendWhatsAppViaN8N(phone, message);
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown tool: '${tool}'` });
    }

    res.status(200).json({ status: 'ok', data: result });
  } catch (error) {
    console.error('Error in /api/call:', error.message);
    res.status(500).json({ error: error.message });
  }
}