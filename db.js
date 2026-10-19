import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'preview_system.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      client TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS advances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      version_name TEXT NOT NULL,
      notes TEXT,
      folder_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      advance_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      relative_path TEXT NOT NULL,
      title TEXT,
      file_size INTEGER,
      FOREIGN KEY (advance_id) REFERENCES advances(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      advance_id INTEGER NOT NULL,
      page_file TEXT NOT NULL,
      viewport_mode TEXT DEFAULT 'both',
      pos_x REAL,
      pos_y REAL,
      author TEXT NOT NULL,
      role TEXT DEFAULT 'Cliente',
      category TEXT DEFAULT 'General',
      content TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (advance_id) REFERENCES advances(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS brand_guides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER UNIQUE NOT NULL,
      brand_name TEXT,
      tagline TEXT,
      primary_color TEXT DEFAULT '#2563EB',
      secondary_color TEXT DEFAULT '#0F172A',
      accent_color TEXT DEFAULT '#F59E0B',
      background_color TEXT DEFAULT '#F8FAFC',
      text_color TEXT DEFAULT '#1E293B',
      colors_json TEXT,
      font_primary TEXT DEFAULT 'Inter, sans-serif',
      font_secondary TEXT DEFAULT 'Montserrat, sans-serif',
      typography_json TEXT,
      logo_url TEXT,
      guidelines_text TEXT,
      dos_and_donts_json TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'client',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project_shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      code TEXT UNIQUE NOT NULL,
      title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // Migrate projects table to add custom_domain column if missing
  try {
    db.exec(`ALTER TABLE projects ADD COLUMN custom_domain TEXT;`);
  } catch (e) {
    // Column already exists
  }

  // Migrate projects table to add previous_url column if missing
  try {
    db.exec(`ALTER TABLE projects ADD COLUMN previous_url TEXT;`);
  } catch (e) {
    // Column already exists
  }

  // Migrate brand_guides to add google_fonts_json if missing
  try {
    db.exec(`ALTER TABLE brand_guides ADD COLUMN google_fonts_json TEXT;`);
  } catch (e) {
    // Column already exists
  }

  // Migrate comments to add snapshot_image and element_info columns
  try {
    db.exec(`ALTER TABLE comments ADD COLUMN snapshot_image TEXT;`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE comments ADD COLUMN element_info TEXT;`);
  } catch (e) {}

  // Create default admin user if none exists
  try {
    const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
    if (!adminExists) {
      db.prepare(`
        INSERT INTO users (username, password, name, role)
        VALUES ('admin', 'admin123', 'Administrador', 'admin')
      `).run();
      db.prepare(`
        INSERT INTO users (username, password, name, role)
        VALUES ('cliente', 'cliente123', 'Cliente Revisor', 'client')
      `).run();
      console.log('Default users created: admin/admin123 and cliente/cliente123');
    }
  } catch (e) {
    console.error('Error seeding default users:', e);
  }

  console.log('Database initialized successfully at:', dbPath);
}

export default db;
