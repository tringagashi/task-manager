const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// INIT APP
const app = express();
app.use(cors());
app.use(express.json());

// CONNECT DATABASE
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

// =====================
// CREATE TABLES
// =====================
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    user_id INTEGER
)`);

// =====================
// ROOT ROUTE
// =====================
app.get("/", (req, res) => {
  res.send("✅ API is running successfully");
});

// =====================
// AUTHENTICATION MIDDLEWARE
// =====================
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ error: "Access denied ❌" });

  jwt.verify(token, "secret123", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token ❌" });

    req.user = user; // user.id është brenda token-it
    next();
  });
}

// =====================
// AUTH ROUTES
// =====================

// REGISTER
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword],
    function (err) {
      if (err) {
        return res.status(400).json({ error: "❌ Email already exists" });
      }
      res.json({ message: "✅ User registered successfully" });
    }
  );
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: "❌ User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: "❌ Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, "secret123", {
      expiresIn: "7d",
    });

    res.json({
      message: "✅ Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
});

// =====================
// TASKS ROUTES (PROTECTED)
// =====================

// GET TASKS for logged user
app.get("/tasks", authenticateToken, (req, res) => {
  db.all(
    "SELECT * FROM tasks WHERE user_id = ?",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ADD TASK
app.post("/tasks", authenticateToken, (req, res) => {
  const { title, description } = req.body;

  db.run(
    "INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)",
    [title, description, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        id: this.lastID,
        title,
        description,
        user_id: req.user.id
      });
    }
  );
});

// UPDATE TASK STATUS
app.put("/tasks/:id", authenticateToken, (req, res) => {
  const { status } = req.body;

  db.run(
    "UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?",
    [status, req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ updated: this.changes });
    }
  );
});

// DELETE TASK
app.delete("/tasks/:id", authenticateToken, (req, res) => {
  db.run(
    "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ deleted: this.changes });
    }
  );
});

// =====================
// START SERVER
// =====================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
