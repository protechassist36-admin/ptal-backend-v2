import express from "express";
import cors from "cors";
import subjectsRouter from "./routes/subjects";

const app = express();
const port = 8000;

if (!process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL is not set in .env file');
}

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods:[ 'GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.use(express.json());

// ✅ FIX 1: correct variable name
app.use("/api/subjects", subjectsRouter);

// ✅ FIX 2: use res.send (not res.render)
app.get("/", (_req, res) => {
  res.send("Hello to the PTAL API 🚀");
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
