const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database("./requestDB.sqlite", (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log("Connected to the SQLite database.");
        db.run(`CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            location TEXT NOT NULL,
            status TEXT DEFAULT 'Pending'
        )`);
    }
});

// Root Test Endpoint
app.get("/", (req, res) => {
    res.send("Request Service Running on Port 3001");
});

// 1. CREATE API: POST /requests
app.post("/requests", (req, res) => {
    const { title, location } = req.body;
    if (!title || !location) return res.status(400).json({ error: "Title and location are required." });

    const sql = `INSERT INTO requests (title, location, status) VALUES (?, ?, 'Pending')`;
    db.run(sql, [title, location], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Request created successfully", requestId: this.lastID });
    });
});

// 2. VIEW API: GET /requests
app.get("/requests", (req, res) => {
    const sql = `SELECT * FROM requests`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ requests: rows });
    });
});

// 3. UPDATE API: PUT /requests/:id
app.put("/requests/:id", (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const validStatuses = ["Pending", "In Progress", "Resolved", "Under Maintenance"];
    
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status." });

    const sql = `UPDATE requests SET status = ? WHERE id = ?`;
    db.run(sql, [status, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Request not found." });
        res.json({ message: `Request ${id} updated to ${status}` });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Request Service is running on http://localhost:${PORT}`);
});