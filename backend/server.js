const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// -------------------- DATABASE --------------------
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error connecting to DB:", err);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

// Create users table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

// -------------------- REGISTER --------------------
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  db.run(
    `INSERT INTO users (username, password) VALUES (?, ?)`,
    [username, password],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "User already exists or database error" });
      }
      return res.status(200).json({ message: "User registered successfully" });
    }
  );
});

// -------------------- LOGIN --------------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, row) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Database error" });
      }

      if (!row) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: row.id, username: row.username },
        "supersecretkey"
      );

      return res.json({ token });
    }
  );
});

// -------------------- START SERVER --------------------
app.listen(5000, () => {
  console.log("✅ Server running at http://localhost:5000");
});
