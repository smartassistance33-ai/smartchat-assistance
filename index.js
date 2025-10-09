import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();
const PORT = 3001;

// Serve static HTML file
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(✅ Smart Chat Assistant running at http://localhost:${PORT});
});