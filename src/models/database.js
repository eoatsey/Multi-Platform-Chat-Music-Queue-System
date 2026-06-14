const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('../config');
let db;

function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        last_active DATE
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS queue_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        track_title TEXT,
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS rate_limits (
        user_id INTEGER,
        window_start DATETIME,
        count INTEGER DEFAULT 0,
        PRIMARY KEY (user_id, window_start)
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS moderation_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        content TEXT,
        action TEXT,
        reason TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      resolve();
    });
  });
}

module.exports = { initDatabase, getDb: () => db };
