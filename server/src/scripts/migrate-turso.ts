import "dotenv/config";
import fs from "fs";
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import { DB_PATH } from "../paths";
import { initDb, migrate } from "../db";

const TABLES = ["admin_users", "perfumes", "variants", "images", "settings", "import_batches"];

function quoteIdent(name: string) {
  return `"${name.replace(/"/g, '""')}"`;
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("Falta TURSO_DATABASE_URL en server/.env");
  if (!fs.existsSync(DB_PATH)) throw new Error(`No encontré ${DB_PATH}. No se tocó nada.`);

  await initDb();
  await migrate();

  const local = new Database(DB_PATH, { fileMustExist: true, readonly: true });
  const turso = createClient({ url, authToken: token });

  const remoteCount = Number(
    ((await turso.execute("SELECT COUNT(*) as c FROM perfumes")).rows[0] as any)?.c || 0
  );
  if (remoteCount > 0 && process.env.FORCE_TURSO_MIGRATE !== "1") {
    throw new Error(
      `Turso ya tiene ${remoteCount} perfumes. No se copió nada. Si querés pisar, corré FORCE_TURSO_MIGRATE=1 npm run migrate:turso`
    );
  }

  for (const table of TABLES) {
    const exists = local.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
    if (!exists) {
      console.warn(`⚠ Tabla ${table} no está en la base local, se salta.`);
      continue;
    }
    const cols = (local.prepare(`PRAGMA table_info(${quoteIdent(table)})`).all() as { name: string }[]).map((c) => c.name);
    const quoted = cols.map(quoteIdent).join(", ");
    const placeholders = cols.map(() => "?").join(", ");
    const rows = local.prepare(`SELECT ${quoted} FROM ${quoteIdent(table)}`).all() as Record<string, unknown>[];
    let copied = 0;
    for (const row of rows) {
      const args = cols.map((c) => (row[c] === undefined ? null : row[c]));
      await turso.execute({
        sql: `INSERT OR REPLACE INTO ${quoteIdent(table)} (${quoted}) VALUES (${placeholders})`,
        args,
      } as any);
      copied += 1;
    }
    console.log(`✔ ${table}: ${copied} filas`);
  }

  console.log("\nListo. El catálogo local (server/data.db) sigue intacto.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
