-- ============================================
-- Supabase Database Setup Script
-- ============================================
-- Copy and paste this entire script into your
-- Supabase SQL Editor and click "Run"
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS auto_replies CASCADE;
DROP TABLE IF EXISTS tools CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- ============================================
-- Create Tables
-- ============================================

-- 🧩 Create leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🧠 Create tools table
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🤖 Create auto_replies table
CREATE TABLE auto_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT UNIQUE NOT NULL,
  reply TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📲 Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT,
  receiver TEXT,
  content TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Insert Sample Data
-- ============================================

-- Sample leads
INSERT INTO leads (name, phone, message) VALUES 
  ('John Doe', '+1234567890', 'Interested in your services'),
  ('Jane Smith', '+0987654321', 'Need more information');

-- Sample tools
INSERT INTO tools (name, description, status) VALUES 
  ('WhatsApp Integration', 'Connect to WhatsApp Business API', 'active'),
  ('Email Automation', 'Automated email responses', 'active');

-- Sample auto_replies
INSERT INTO auto_replies (keyword, reply) VALUES 
  ('hello', 'Hi there! How can I help you today?'),
  ('pricing', 'Our pricing starts at $99/month. Would you like to know more?');

-- Sample messages
INSERT INTO messages (sender, receiver, content) VALUES 
  ('+1234567890', '+0987654321', 'Hello, how are you?'),
  ('+0987654321', '+1234567890', 'I am doing great, thanks!');

-- ============================================
-- Verification Query (optional)
-- ============================================
-- Run these to verify tables were created:

SELECT 'leads' as table_name, COUNT(*) as row_count FROM leads
UNION ALL
SELECT 'tools', COUNT(*) FROM tools
UNION ALL
SELECT 'auto_replies', COUNT(*) FROM auto_replies
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;
