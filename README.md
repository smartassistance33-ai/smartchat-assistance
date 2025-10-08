# SmartChat Assistant (Simplified)

Welcome to the SmartChat Assistant! This is a lightweight, cloud-ready Node.js and Express application designed to serve as a simple webhook forwarder to an n8n service.

## Overview

This project provides a clean and minimal backend that:
- Receives a message via a `POST` request.
- Forwards the message to a configurable n8n webhook.
- Is built with modern, error-tolerant JavaScript.
- Is configured securely through environment variables.

---

## Installation

To get the project running locally, follow these steps:

1.  **Clone the Repository**
    ```bash
    git clone <your-repository-url>
    cd smartchat-assistant
    ```

2.  **Install Dependencies**
    Using npm, install the required packages from `package.json`.
    ```bash
    npm install
    ```

---

## Environment Setup

This project uses a `.env.template` file for configuration.

1.  **Create your `.env` file** by copying the template.
    ```bash
    cp .env.template .env
    ```

2.  **Edit the `.env` file** and add your credentials:

    ```env
    # The full URL for your n8n webhook endpoint
    N8N_URL=YOUR_N8N_WEBHOOK_URL

    # The port the server will run on (defaults to 3000)
    PORT=3000
    ```

3.  **Replace `YOUR_N8N_WEBHOOK_URL`** with your actual n8n webhook URL.

**Note:** The `.env` file is included in `.gitignore` and should never be committed to version control.

---

## How to Start the Application

You can run the server in two modes:

1.  **Development Mode (`nodemon`)**
    This command starts the server and automatically restarts it when you save a file.
    ```bash
    npm run dev
    ```

2.  **Production Mode (`node`)**
    This command runs the application directly, which is suitable for a production environment.
    ```bash
    npm start
    ```

The server will be available at `http://localhost:3000` (or your configured port).

---

## API Endpoint Documentation

-   `GET /`
    -   **Description**: A simple endpoint to confirm that the API is running.
    -   **Response**: A plain text message: `✅ SmartChat Assistance API is running successfully!`

-   `POST /message`
    -   **Description**: Receives a message and forwards it to your configured n8n webhook.
    -   **Request Body**:
        ```json
        {
          "userId": "some_user_id",
          "message": "Hello, world!"
        }
        ```
    -   **Response**: `200 OK` with the result from the n8n webhook, or an appropriate error message if the request fails.