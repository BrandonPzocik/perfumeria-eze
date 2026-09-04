import "dotenv/config";
import path from "path";
import fs from "fs";

const SERVER_ROOT = path.join(__dirname, "..");

export const DB_PATH = process.env.DATABASE_FILE || path.join(SERVER_ROOT, "data.db");
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(SERVER_ROOT, "uploads");
export const WEB_DIST = process.env.WEB_DIST || path.join(SERVER_ROOT, "..", "web", "dist");

export function ensureDirs() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
