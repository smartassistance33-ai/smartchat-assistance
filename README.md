# SmartChat Assistant

This is a full cloud-ready Express.js application designed to serve as a backend for a "SmartChat Assistant". It provides several API endpoints to manage leads, send messages, and configure automated replies.

## Features

- **Express Server**: A robust and minimalist web framework for Node.js.
- **Supabase Integration**: Connects to a Supabase backend for database operations (leads, auto-replies).
- **n8n Webhook Integration**: Sends WhatsApp messages via an n8n workflow.
- **RESTful API**: A clear and well-defined API for interacting with the assistant's tools.
- **Environment-based Configuration**: Securely manages credentials and settings using a `.env` file.
- **Request Logging**: Middleware to log all incoming requests for easier debugging.
- **Cloud-Ready**: Designed to be deployed on any modern cloud platform that supports Node.js (e.g., Codespaces, Heroku, AWS, Vercel).

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18.0.0 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A Supabase account and project.
- An n8n instance with a webhook configured for sending WhatsApp messages.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd smartchat-assistant
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create the environment file:**
    Create a file named `.env` in the root of the project directory and add the following environment variables.

    ```env
    # Server Configuration
    PORT=3000

    # Supabase Credentials
    # Get these from your Supabase project settings > API
    SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY

    # n8n Webhook URL
    # The URL of your n8n webhook for sending WhatsApp messages
    N8N_WEBHOOK_URL=YOUR_N8N_WEBHOOK_URL
    ```

    **IMPORTANT:** Replace the placeholder values (`YOUR_...`) with your actual credentials. Do not commit the `.env` file to version control.

## Running the Application

-   **Development Mode**:
    This command uses `nodemon` to automatically restart the server whenever you make changes to the code.
    ```bash
    npm run dev
    ```

-   **Production Mode**:
    This command runs the application using `node`.
    ```bash
    npm start
    ```

After starting, the server will be running at `http://localhost:3000`.

## API Endpoints

-   `GET /`: Displays a simple HTML page with links to other endpoints and a form to test the `/call` endpoint.
-   `GET /health`: Returns a JSON object indicating the server is running.
-   `GET /manifest`: Returns a JSON manifest file for OpenAI Apps integration.
-   `GET /mcp`: Returns a machine-readable list of available tools.
-   `GET /lead/:id`: Fetches a single lead by its unique ID from Supabase.
-   `POST /call`: The main endpoint for executing tools.
    -   **Body**: `{ "tool_name": "...", "parameters": { ... } }`
    -   **Available Tools**:
        -   `setup_auto_reply`: Saves an auto-reply message. Requires `message` and `reply_to` in parameters.
        -   `view_leads`: Fetches all leads.
        -   `send_message`: Sends a message. Requires `phone` and `message` in parameters.