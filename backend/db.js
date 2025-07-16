const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mqtt-messages.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    username TEXT,
    room TEXT,
    message TEXT,
    timestamp TEXT
  )`);
});

function saveMessage({ id, username, room, message, timestamp }) {
  db.run(
    `INSERT OR IGNORE INTO messages (id, username, room, message, timestamp) VALUES (?, ?, ?, ?, ?)`,
    [id, username, room, message, timestamp],
    (err) => {
      if (err) console.error('❌ DB Insert Error:', err.message);
    }
  );
}

module.exports = { saveMessage };
