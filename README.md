# SmartChat Assistant

Welcome to the SmartChat Assistant! This is a complete, cloud-ready Node.js and Express application that serves as a backend for a multi-channel smart assistant. It provides a set of tools to manage leads, send messages, and configure auto-replies, all exposed through a secure and well-documented API.

## Overview

This project is designed to be easily deployable to any modern cloud environment that supports Node.js. It uses Supabase for its database backend and can integrate with n8n for workflow automation, such as sending WhatsApp messages.

### Core Features
- **Modern JavaScript**: Built with ES6+ syntax for clean and maintainable code.
- **Environment-Based Configuration**: All sensitive keys and settings are managed through a `.env` file for maximum security and portability.
- **Complete API**: Provides endpoints for health checks, tool discovery (MCP), and executing specific business logic.
- **Robust Error Handling**: Implements `try/catch` blocks for all asynchronous operations to prevent crashes and provide clear error feedback.
- **Request Logging**: Includes a middleware that logs every incoming request for easy debugging and monitoring.

---

## Installation

To get the project running locally, follow these steps:

1.  **Clone the Repository**
    ```bash
    git clone <your-repository-url>
    cd smartchat-assistant
    ```

2.  **Install Dependencies**
    Using npm, install all the required packages listed in `package.json`.
    ```bash
    npm install
    ```

---

## Environment Setup

Before running the application, you need to set up your environment variables.

1.  **Create a `.env` file** in the root of the project directory.
2.  **Copy the contents** of the provided `.env.template` or add the following keys:

    ```env
    # Supabase Credentials
    # Find these in your Supabase project's API settings
    SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY

    # n8n Webhook URL for sending WhatsApp messages
    N8N_WEBHOOK_URL=YOUR_N8N_WEBHOOK_URL

    # Server Port (optional, defaults to 3000)
    PORT=3000
    ```

3.  **Replace the placeholder values** (`YOUR_...`) with your actual credentials from Supabase and n8n.

**Note:** The `.env` file contains sensitive information and should **never** be committed to version control. A `.gitignore` file is included to prevent this.

---

## How to Start the Application

You can run the server in two modes:

1.  **Development Mode**
    This command uses `nodemon` to start the server. It will automatically watch for file changes and restart the server, which is ideal for development.
    ```bash
    npm run dev
    ```

2.  **Production Mode**
    This command runs the application directly with `node`, which is optimized for production use.
    ```bash
    npm start
    ```

Once started, the application will be available at `http://localhost:3000` (or the port you specified in your `.env` file).

---

## API Endpoint Documentation

Here are the available API endpoints:

-   `GET /`
    -   **Description**: Serves a user-friendly HTML dashboard with a title, links to other endpoints, and a simple form to test the `/call` endpoint.

-   `GET /health`
    -   **Description**: A simple health check endpoint to confirm the server is running.
    -   **Response**: `200 OK` with JSON `{ "status": "SmartChat Assistant is running" }`.

-   `GET /mcp`
    -   **Description**: Returns a Machine-Readable Capability Profile (MCP) listing the available tools.
    -   **Response**: `200 OK` with a JSON object containing a list of tools, their descriptions, and expected parameters.

-   `GET /lead/:id`
    -   **Description**: Fetches a single lead from the Supabase `leads` table by its unique ID.
    -   **Response**: `200 OK` with the lead object, or `404 Not Found` if the ID does not exist.

-   `GET /manifest`
    -   **Description**: Provides a JSON manifest file for integration with services like the OpenAI Apps SDK.

-   `POST /call`
    -   **Description**: The main endpoint for executing a tool. The tool to be executed is specified in the request body.
    -   **Request Body**:
        ```json
        {
          "tool_name": "name_of_the_tool",
          "parameters": { ... }
        }
        ```
    -   **Available Tools**:
        -   `setup_auto_reply`: Saves an auto-reply rule to the `auto_replies` table in Supabase.
        -   `view_leads`: Fetches and returns all entries from the `leads` table.
        -   `send_message`: Sends a WhatsApp message via the configured n8n webhook.
    -   **Response**: `200 OK` with a success message and any relevant data, or an appropriate error (`400` for bad requests, `500` for server errors).