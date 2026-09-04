import Database from "better-sqlite3";
import { DB_PATH, ensureDirs } from "../paths";

ensureDirs();

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

    CREATE TABLE IF NOT EXISTS variants (
      id TEXT PRIMARY KEY,
      perfume_id TEXT NOT NULL REFERENCES perfumes(id) ON DELETE CASCADE,
      size TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      "order" INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      whatsapp_number TEXT NOT NULL DEFAULT '5491100000000',
      whatsapp_number_femenino TEXT NOT NULL DEFAULT '',
      whatsapp_number_masculino TEXT NOT NULL DEFAULT '',
      whatsapp_message TEXT NOT NULL DEFAULT 'Hola! Quiero realizar el siguiente pedido:',
      store_name TEXT NOT NULL DEFAULT 'Perfumería',
      store_name_accent TEXT NOT NULL DEFAULT 'Árabe',
      logo_url TEXT DEFAULT '/uploads/brand-logo.jpeg',
      banner_url TEXT,
      primary_color TEXT NOT NULL DEFAULT '#3D3229',
      accent_color TEXT NOT NULL DEFAULT '#A68B5B',
      instagram_url TEXT,
      instagram_url_femenino TEXT NOT NULL DEFAULT '',
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

  const columns = db.prepare(`PRAGMA table_info(settings)`).all() as { name: string }[];
  const colNames = new Set(columns.map((c) => c.name));
  if (!colNames.has("whatsapp_number_femenino")) {
    db.exec(`ALTER TABLE settings ADD COLUMN whatsapp_number_femenino TEXT NOT NULL DEFAULT ''`);
  }
  if (!colNames.has("whatsapp_number_masculino")) {
    db.exec(`ALTER TABLE settings ADD COLUMN whatsapp_number_masculino TEXT NOT NULL DEFAULT ''`);
  }
  if (!colNames.has("instagram_url_femenino")) {
    db.exec(`ALTER TABLE settings ADD COLUMN instagram_url_femenino TEXT NOT NULL DEFAULT ''`);
  }

  const instagramFemenino = db.prepare(`SELECT instagram_url_femenino FROM settings WHERE id = 1`).get() as
    | { instagram_url_femenino?: string }
    | undefined;
  if (!String(instagramFemenino?.instagram_url_femenino || "").trim()) {
    db.prepare(`UPDATE settings SET instagram_url_femenino = ? WHERE id = 1`).run("https://www.instagram.com/noura.scents/");
  }

  const perfumeCols = db.prepare(`PRAGMA table_info(perfumes)`).all() as { name: string }[];
  const perfumeColNames = new Set(perfumeCols.map((c) => c.name));
  if (!perfumeColNames.has("kind")) {
    db.exec(`ALTER TABLE perfumes ADD COLUMN kind TEXT NOT NULL DEFAULT 'bottle'`);
  }

  const colors = db.prepare(`SELECT primary_color FROM settings WHERE id = 1`).get() as { primary_color?: string } | undefined;
  const current = String(colors?.primary_color || "").toLowerCase();
  if (current === "#1e40af" || current === "#6e1e39") {
    db.prepare(`UPDATE settings SET primary_color = '#3D3229', accent_color = '#A68B5B' WHERE id = 1`).run();
  }
}
