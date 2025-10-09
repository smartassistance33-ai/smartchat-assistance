export default function handler(req, res) {
  res.status(200).json({
    name: 'SmartChat Assistant',
    description: 'A serverless assistant for managing leads and messages.',
    tools: [
      { id: 'view_leads', name: 'View Leads', description: 'Return all saved leads from the database.' },
      { id: 'setup_auto_reply', name: 'Setup Auto Reply', description: 'Configure a keyword-based auto-reply.' },
      { id: 'send_message', name: 'Send Message', description: 'Send a WhatsApp message via an n8n webhook.' },
    ],
  });
}