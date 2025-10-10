import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function setupDatabase() {
  try {
    console.log('🚀 Starting Supabase database setup...\n');

    // Note: The Supabase JS client doesn't support DDL operations directly.
    // You need to run the SQL commands in your Supabase SQL Editor.
    
    console.log('📋 INSTRUCTIONS:');
    console.log('1. Go to your Supabase Dashboard → SQL Editor');
    console.log('2. Copy and paste the SQL below');
    console.log('3. Click "Run" to create tables\n');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('SQL TO RUN IN SUPABASE SQL EDITOR:');
    console.log('═══════════════════════════════════════════════════════\n');

    const setupSQL = `
-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS auto_replies CASCADE;
DROP TABLE IF EXISTS tools CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- Create leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tools table
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auto_replies table
CREATE TABLE auto_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT UNIQUE NOT NULL,
  reply TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT,
  receiver TEXT,
  content TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data into leads
INSERT INTO leads (name, phone, message) VALUES 
  ('John Doe', '+1234567890', 'Interested in your services'),
  ('Jane Smith', '+0987654321', 'Need more information');

-- Insert sample data into tools
INSERT INTO tools (name, description, status) VALUES 
  ('WhatsApp Integration', 'Connect to WhatsApp Business API', 'active'),
  ('Email Automation', 'Automated email responses', 'active');

-- Insert sample data into auto_replies
INSERT INTO auto_replies (keyword, reply) VALUES 
  ('hello', 'Hi there! How can I help you today?'),
  ('pricing', 'Our pricing starts at $99/month. Would you like to know more?');

-- Insert sample data into messages
INSERT INTO messages (sender, receiver, content) VALUES 
  ('+1234567890', '+0987654321', 'Hello, how are you?'),
  ('+0987654321', '+1234567890', 'I am doing great, thanks!');
`;

    console.log(setupSQL);
    console.log('\n═══════════════════════════════════════════════════════\n');

    // Now let's verify the connection and try to insert sample data
    console.log('🔄 Attempting to verify database connection...\n');

    // Check if tables exist and insert sample data
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('count');

    if (leadsError) {
      console.log('⚠️  Tables not created yet. Please run the SQL above in Supabase SQL Editor first.\n');
      console.log('After running the SQL, you can run this script again to verify.\n');
      return;
    }

    console.log('✅ Tables verified! Checking data...\n');

    // Check each table
    const tables = ['leads', 'tools', 'auto_replies', 'messages'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(5);
      
      if (!error) {
        console.log(`✅ Table "${table}": ${data.length} rows found`);
      }
    }

    console.log('\n🎉 Database setup verification completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupDatabase();
