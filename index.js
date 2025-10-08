import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const N8N_URL = process.env.N8N_URL;

if (!N8N_URL) {
  console.error("❌ Missing required environment variable: N8N_URL.");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.send("✅ SmartChat Assistance API is running successfully!");
});

app.post("/message", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: "Missing userId or message." });
    }

    // Example call to n8n
    const response = await fetch(`${N8N_URL}/webhook/smartchat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n webhook failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));