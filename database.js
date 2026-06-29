const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database (this will create leads.db if it doesn't exist)
const dbPath = path.join(__dirname, 'leads.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Leads table
    db.run(`CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT,
      whatsapp TEXT,
      email TEXT,
      company TEXT,
      message TEXT,
      details TEXT,
      status TEXT DEFAULT 'novo',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      } else {
        console.log('Leads table ready.');
      }
    });

    // Create Notes table (Kanban)
    db.run(`DROP TABLE IF EXISTS notes`, (err) => {
      db.run(`CREATE TABLE notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'todo',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('Error creating notes table', err.message);
        } else {
          console.log('Notes table ready with status column.');
        }
      });
    });
  }
});

module.exports = db;
