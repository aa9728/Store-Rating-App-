const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in the db directory
const dbPath = path.join(__dirname, 'store_rating.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

module.exports = db; 