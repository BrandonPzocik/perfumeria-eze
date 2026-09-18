import "dotenv/config";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { DB_PATH, UPLOAD_DIR } from "../paths";
import { cloudinaryEnabled, uploadFileToCloudinary } from "../storage/cloudinary";

function localPathFromUrl(url: string) {
  if (!url || url.startsWith("http")) return null;
  const filename = url.replace(/^\/uploads\//, "").replace(/^uploads\//, "");
  if (!filename || filename.includes("..") || filename.includes("/")) return null;
  return path.join(UPLOAD_DIR, filename);
}

function collectUrls(local: Database.Database) {
  const urls = new Set<string>();
  const images = local.prepare(`SELECT url FROM images`).all() as { url: string }[];
  for (const row of images) if (row.url) urls.add(row.url);
  const settings = local.prepare(`SELECT logo_url, banner_url FROM settings WHERE id = 1`).get() as
    | { logo_url?: string; banner_url?: string }
    | undefined;
  if (settings?.logo_url) urls.add(settings.logo_url);
  if (settings?.banner_url) urls.add(settings.banner_url);
  return [...urls];
}

async function main() {
  if (!cloudinaryEnabled()) {
    throw new Error("Faltan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en server/.env");
  }
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`No encontré ${DB_PATH}. No se tocó nada.`);
  }

  const local = new Database(DB_PATH, { fileMustExist: true, readonly: false });
  let urls: string[] = [];
  try {
    urls = collectUrls(local);
  } catch {
    throw new Error("No pude leer las fotos de la base local. No se tocó nada.");
  }
  let uploaded = 0;
  let skipped = 0;
  let missing = 0;

  for (const url of urls) {
    if (url.startsWith("http")) {
      skipped += 1;
      continue;
    }
    const filepath = localPathFromUrl(url);
    if (!filepath || !fs.existsSync(filepath)) {
      console.warn(`⚠ No está el archivo local de ${url} — se deja como está.`);
      missing += 1;
      continue;
    }
    const cloudUrl = await uploadFileToCloudinary(filepath);
    local.prepare(`UPDATE images SET url = ? WHERE url = ?`).run(cloudUrl, url);
    local.prepare(`UPDATE settings SET logo_url = ? WHERE logo_url = ?`).run(cloudUrl, url);
    local.prepare(`UPDATE settings SET banner_url = ? WHERE banner_url = ?`).run(cloudUrl, url);
    uploaded += 1;
    console.log(`✔ ${path.basename(filepath)} → Cloudinary`);
  }

  console.log(`\nListo. Subidas: ${uploaded}. Ya eran URL: ${skipped}. Archivo faltante: ${missing}.`);
  console.log("Las fotos originales siguen en server/uploads. No se borró nada.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
