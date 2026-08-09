const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const dbPath = process.env.DB_PATH || "./data/blog.db";
const resolvedPath = path.resolve(__dirname, dbPath);

// Make sure the data directory exists before opening the db file
const dataDir = path.dirname(resolvedPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(resolvedPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    status TEXT NOT NULL CHECK (status IN ('Draft', 'Published')) DEFAULT 'Draft',
    created_date TEXT NOT NULL DEFAULT (datetime('now')),
    published_date TEXT,
    image_url TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
  CREATE INDEX IF NOT EXISTS idx_posts_category ON posts (category);
  CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
`);

// Add image_url to existing databases that predate this column
try {
  db.exec("ALTER TABLE posts ADD COLUMN image_url TEXT");
} catch {
  // Column already exists — safe to ignore
}

module.exports = db;

// Auto-seed on first start only — never re-seeds if posts already exist
const { run: seedDatabase } = require("./seed");
if (db.prepare("SELECT COUNT(*) AS count FROM posts").get().count === 0) {
  console.log("Database is empty — seeding...");
  seedDatabase();
}
