import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'preview_system.db');

// Multi-environment SQLite Adapter:
// 1. Try native node:sqlite (Node 22+)
// 2. Universal WebAssembly SQLite (sql.js) - 100% compatible with Node 18/20 on CloudLinux/cPanel (zero GLIBC or compilation requirements)
let db;

try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(dbPath);
  console.log('[DB] Conectado usando SQLite nativo (node:sqlite)');
} catch (nativeErr) {
  console.log('[DB] Inicializando WebAssembly SQLite (sql.js) para compatibilidad universal...');
  const initSqlJs = (await import('sql.js')).default;
  const SQL = await initSqlJs();
  
  let fileBuffer = fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : null;
  const sqlDb = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();

  function saveToDisk() {
    try {
      const data = sqlDb.export();
      fs.writeFileSync(dbPath, Buffer.from(data));
    } catch (e) {
      console.error('[DB] Error guardando a disco:', e);
    }
  }

  db = {
    exec(sql) {
      sqlDb.exec(sql);
      saveToDisk();
    },
    prepare(sql) {
      return {
        get(...params) {
          const flatParams = (params.length === 1 && Array.isArray(params[0])) ? params[0] : params;
          const stmt = sqlDb.prepare(sql);
          if (flatParams.length > 0) stmt.bind(flatParams);
          let row = undefined;
          if (stmt.step()) {
            row = stmt.getAsObject();
          }
          stmt.free();
          return row;
        },
        all(...params) {
          const flatParams = (params.length === 1 && Array.isArray(params[0])) ? params[0] : params;
          const stmt = sqlDb.prepare(sql);
          if (flatParams.length > 0) stmt.bind(flatParams);
          const rows = [];
          while (stmt.step()) {
            rows.push(stmt.getAsObject());
          }
          stmt.free();
          return rows;
        },
        run(...params) {
          const flatParams = (params.length === 1 && Array.isArray(params[0])) ? params[0] : params;
          sqlDb.run(sql, flatParams);
          const res = sqlDb.exec('SELECT last_insert_rowid() as id, changes() as chg');
          const lastInsertRowid = res[0]?.values[0][0] || 0;
          const changes = res[0]?.values[0][1] || 0;
          saveToDisk();
          return { lastInsertRowid, changes };
        }
      };
    }
  };
  console.log('[DB] Conectado exitosamente con sql.js (WebAssembly) en:', dbPath);
}

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
