import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DATABASE_FILE || path.join(__dirname, "..", "..", "data.db");

// Aseguramos que exista la carpeta contenedora si DATABASE_FILE trae subcarpetas
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS perfumes (
      id TEXT PRIMARY KEY,
      internal_code TEXT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      gender TEXT NOT NULL DEFAULT 'Unisex',
      family TEXT NOT NULL DEFAULT 'Amaderada',
      type TEXT NOT NULL DEFAULT 'EDP',
      size TEXT NOT NULL DEFAULT '100ml',
      description TEXT DEFAULT '',

      price REAL NOT NULL DEFAULT 0,
      old_price REAL,
      cost REAL,

      stock INTEGER NOT NULL DEFAULT 0,
      min_stock INTEGER NOT NULL DEFAULT 3,

      notes_salida TEXT NOT NULL DEFAULT '[]',
      notes_corazon TEXT NOT NULL DEFAULT '[]',
      notes_fondo TEXT NOT NULL DEFAULT '[]',
      intensidad INTEGER NOT NULL DEFAULT 3,
      duracion TEXT NOT NULL DEFAULT '',

      visible INTEGER NOT NULL DEFAULT 1,
      destacado INTEGER NOT NULL DEFAULT 0,
      oferta INTEGER NOT NULL DEFAULT 0,
      nuevo INTEGER NOT NULL DEFAULT 0,
      mas_vendido INTEGER NOT NULL DEFAULT 0,

      views INTEGER NOT NULL DEFAULT 0,
      cart_adds INTEGER NOT NULL DEFAULT 0,
      whatsapp_clicks INTEGER NOT NULL DEFAULT 0,
      shares INTEGER NOT NULL DEFAULT 0,

      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      perfume_id TEXT NOT NULL REFERENCES perfumes(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      is_main INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      whatsapp_number TEXT NOT NULL DEFAULT '5491100000000',
      whatsapp_message TEXT NOT NULL DEFAULT 'Hola! Quiero realizar el siguiente pedido:',
      store_name TEXT NOT NULL DEFAULT 'Perfumería',
      store_name_accent TEXT NOT NULL DEFAULT 'Árabe',
      logo_url TEXT DEFAULT '/uploads/brand-logo.jpeg',
      banner_url TEXT,
      primary_color TEXT NOT NULL DEFAULT '#6E1E39',
      accent_color TEXT NOT NULL DEFAULT '#B79358',
      instagram_url TEXT,
      facebook_url TEXT,
      schedule TEXT NOT NULL DEFAULT 'Lun a Sáb · 10 a 20h',
      currency TEXT NOT NULL DEFAULT 'ARS',
      show_currency INTEGER NOT NULL DEFAULT 1,
      dark_mode_default INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS import_batches (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      created_count INTEGER NOT NULL DEFAULT 0,
      updated_count INTEGER NOT NULL DEFAULT 0,
      error_count INTEGER NOT NULL DEFAULT 0,
      errors TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const settingsRow = db.prepare("SELECT id FROM settings WHERE id = 1").get();
  if (!settingsRow) {
    db.prepare("INSERT INTO settings (id) VALUES (1)").run();
  }
}
