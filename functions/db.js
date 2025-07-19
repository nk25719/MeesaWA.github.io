// functions/db.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "mqtt-messages.db");
const db = new sqlite3.Database(dbPath, err => {
  if (err) return console.error("❌ Failed to open DB:", err.message);
  console.log("✅ Connected to SQLite DB at", dbPath);
});

db.run(
  `CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    username TEXT,
    room TEXT,
    message TEXT,
    timestamp TEXT
  )`,
  err => {
    if (err) console.error("❌ Failed to create table:", err.message);
    else console.log("✅ Table 'messages' ready");
  }
);

function saveMessage({ id, username, room, message, timestamp }) {
  db.run(
    `INSERT INTO messages (id, username, room, message, timestamp) VALUES (?, ?, ?, ?, ?)`,
    [id, username, room, message, timestamp],
    function (err) {
      if (err) {
        console.error("❌ DB save error:", err.message);
      } else {
        console.log("✅ Message saved to DB:", { id, username, room, message });
      }
    }
  );
}

module.exports = { saveMessage };
