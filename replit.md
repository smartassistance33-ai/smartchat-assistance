# Smart Chat Assistant

## Overview
A Node.js/Express web application with Supabase database integration for smart chat assistance. The project uses ES modules and includes dependencies for Supabase database operations and N8N webhook functionality.

## Recent Changes (October 9, 2025)
- Fixed syntax errors in index.js (corrected template literal quotes and __dirname variable)
- Configured for Replit environment (port 5000, host 0.0.0.0)
- Added "type": "module" to package.json for ES module support
- Created .gitignore for Node.js project
- Set up Server workflow with nodemon for development
- Configured autoscale deployment with node index.js
- **Updated Supabase connection to use SUPABASE_ANON_KEY** (correct key for client-side access)
- **Added /test-db endpoint** to test Supabase connection and fetch data from "tools" table
- Updated UI with "Test Database" link for easy database testing

## Project Structure
```
.
├── index.js              # Main Express server file
├── public/
│   └── index.html        # Static HTML frontend
├── package.json          # Node.js dependencies and scripts
├── .env                  # Environment variables (Supabase, N8N webhook)
└── README.md             # Project documentation
```

## Dependencies
- **express**: Web server framework
- **@supabase/supabase-js**: Supabase client library
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **node-fetch**: Fetch API for Node.js
- **nodemon**: Development auto-reload (dev dependency)

## Development
- Run with: `npm run dev` (uses nodemon for auto-reload)
- Server runs on port 5000 (configurable via PORT env variable)
- Host: 0.0.0.0 (for Replit compatibility)

## Deployment
- Type: Autoscale
- Command: node index.js
- Port: 5000
