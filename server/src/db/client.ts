import Database from "better-sqlite3";
import { createClient, type Client } from "@libsql/client";
import { DB_PATH, ensureDirs } from "../paths";

type RunResult = { changes: number };

function argsOf(params: unknown[]): any[] {
  return params.map((v) => (v === undefined ? null : v));
}

function normalizeValue(v: unknown) {
  return typeof v === "bigint" ? Number(v) : v;
}

function normalizeRow(row: Record<string, unknown> | undefined | null) {
  if (!row) return undefined;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    if (/^\d+$/.test(key)) continue;
    out[key] = normalizeValue(row[key]);
  }
  return out;
}

let local: Database.Database | null = null;
let turso: Client | null = null;
let ready = false;

export function usesTurso() {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

export async function initDb() {
  if (ready) return;
  if (usesTurso()) {
    turso = createClient({
      url: process.env.TURSO_DATABASE_URL as string,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  } else {
    ensureDirs();
    local = new Database(DB_PATH);
    local.pragma("journal_mode = WAL");
    local.pragma("foreign_keys = ON");
  }
  ready = true;
}

async function execSql(sql: string) {
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  if (turso) {
    for (const statement of statements) {
      await turso.execute(statement);
    }
    return;
  }
  local!.exec(sql);
}

function prepare(sql: string) {
  return {
    get: async (...params: unknown[]) => {
      if (turso) {
        const rs = await turso.execute({ sql, args: argsOf(params) } as any);
        return normalizeRow(rs.rows[0] as Record<string, unknown> | undefined) as any;
      }
      return local!.prepare(sql).get(...params) as any;
    },
    all: async (...params: unknown[]) => {
      if (turso) {
        const rs = await turso.execute({ sql, args: argsOf(params) } as any);
        return rs.rows.map((row) => normalizeRow(row as Record<string, unknown>)) as any[];
      }
      return local!.prepare(sql).all(...params) as any[];
    },
    run: async (...params: unknown[]): Promise<RunResult> => {
      if (turso) {
        const rs = await turso.execute({ sql, args: argsOf(params) } as any);
        return { changes: Number(rs.rowsAffected || 0) };
      }
      const info = local!.prepare(sql).run(...params);
      return { changes: info.changes };
    },
  };
}

export const db = {
  exec: execSql,
  prepare,
};
