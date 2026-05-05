const Database = require('better-sqlite3');
const path     = require('path');

const db = new Database(path.join(__dirname, 'expenses.db'));

// ─── Create tables ────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    name          TEXT    NOT NULL,
    created_at    TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT    NOT NULL,
    icon    TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    amount      REAL    NOT NULL,
    date        TEXT    NOT NULL,
    notes       TEXT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    created_at  TEXT    DEFAULT (datetime('now'))
  );
`);

// ─── Seed default user + categories (first run only) ─────────
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (userCount === 0) {
  // Placeholder password hash — will be replaced when auth is added
  db.prepare(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
  ).run('demo@example.com', 'placeholder_hash', 'Demo User');

  const seedCategories = [
    { name: 'Food',      icon: '🍜' },
    { name: 'Transport', icon: '🚗' },
    { name: 'Bills',     icon: '💡' },
    { name: 'Other',     icon: '📦' },
  ];

  const insertCat = db.prepare(
    'INSERT INTO categories (name, icon, user_id) VALUES (?, ?, 1)'
  );
  seedCategories.forEach(c => insertCat.run(c.name, c.icon));

  // Seed sample expenses
  const insertExp = db.prepare(
    'INSERT INTO expenses (title, amount, date, user_id, category_id) VALUES (?, ?, ?, 1, ?)'
  );
  insertExp.run('Grocery run',    45.50, '2024-01-10', 1); // Food
  insertExp.run('Grab to work',   12.00, '2024-01-11', 2); // Transport
  insertExp.run('Netflix',        18.00, '2024-01-11', 3); // Bills
  insertExp.run('Lunch with Bob', 22.00, '2024-01-12', 1); // Food
}

module.exports = db;