// Minimal POC Node.js backend with a login endpoint
// Any name/password > 4 chars returns a non-expiring JWT

const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-poc-secret"; // POC-only secret

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Login endpoint
app.post("/login", (req, res) => {
  const { name, password } = req.body || {};

  if (typeof name !== "string" || typeof password !== "string") {
    return res.status(400).json({
      error: "Invalid payload. Expected JSON with name and password.",
    });
  }

  if (name.length <= 4 || password.length <= 4) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Issue JWT without expiration (no `exp` claim set)
  const token = jwt.sign(
    { sub: name }, // minimal claim set; includes iat by default
    JWT_SECRET
  );

  return res.json({ token });
});

// Simple JWT auth middleware (expects Authorization: Bearer <token>)
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET); // no exp in token; signature check only
    req.user = payload; // attach for potential future use
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Protected endpoint
app.get("/auth-check", authenticate, (req, res) => {
  return res.json({ message: "you are authenticated!" });
});

// In-memory tasks store (POC only)
/**
 * Task shape (mirrors frontend type):
 * { id: string, title: string, completed: boolean }
 */
const tasks = [
  { id: "t1", title: "Buy milk", completed: false },
  { id: "t2", title: "Write docs", completed: true },
  { id: "t3", title: "Fix bug #123", completed: false },
  { id: "t4", title: "Plan sprint", completed: true },
];

function generateId() {
  // Simple unique-ish ID for POC
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Create a task
app.post("/tasks", authenticate, (req, res) => {
  const { title } = req.body || {};
  if (typeof title !== "string" || title.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid payload. Expected non-empty title." });
  }
  const task = { id: generateId(), title: title.trim(), completed: false };
  tasks.push(task);
  return res.status(201).json(task);
});

// List tasks
app.get("/tasks", authenticate, (req, res) => {
  return res.json(tasks);
});

// Set task as complete or not
app.patch("/tasks/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { completed } = req.body || {};
  if (typeof completed !== "boolean") {
    return res
      .status(400)
      .json({ error: "Invalid payload. Expected { completed: boolean }." });
  }
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  task.completed = completed;
  return res.json(task);
});

// Delete a task
app.delete("/tasks/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  tasks.splice(idx, 1);
  return res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`POC backend running on http://localhost:${PORT}`);
});
