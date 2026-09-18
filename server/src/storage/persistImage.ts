import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import convert from "heic-convert";
import { UPLOAD_DIR, ensureDirs } from "../paths";
import { cloudinaryEnabled, uploadToCloudinary } from "./cloudinary";

const ALLOWED_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".heic",
  ".heif",
  ".avif",
  ".bmp",
  ".tif",
  ".tiff",
  ".jfif",
  ".pjpeg",
  ".pjp",
]);

export function guessExt(mime: string) {
  const m = String(mime || "").toLowerCase();
  if (m.includes("png")) return ".png";
  if (m.includes("webp")) return ".webp";
  if (m.includes("gif")) return ".gif";
  if (m.includes("svg")) return ".svg";
  if (m.includes("heic") || m.includes("heif")) return ".heic";
  if (m.includes("avif")) return ".avif";
  if (m.includes("bmp")) return ".bmp";
  return ".jpg";
}

export function isAllowedImage(file: Express.Multer.File) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = String(file.mimetype || "").toLowerCase();
  if (ALLOWED_EXT.has(ext)) return true;
  if (mime.startsWith("image/")) return true;
  return false;
}

async function toJpegIfHeic(buffer: Buffer, originalName: string, mime: string) {
  const ext = path.extname(originalName).toLowerCase();
  const m = String(mime || "").toLowerCase();
  const isHeic = [".heic", ".heif"].includes(ext) || m.includes("heic") || m.includes("heif");
  if (!isHeic) return { buffer, filename: originalName };
  try {
    const output = await convert({ buffer, format: "JPEG", quality: 0.9 });
    return {
      buffer: Buffer.from(output),
      filename: originalName.replace(/\.[^.]+$/, ".jpg"),
    };
  } catch {
    return { buffer, filename: originalName };
  }
}

export async function persistImageBuffer(
  buffer: Buffer,
  originalName: string,
  mime?: string
): Promise<string> {
  const normalized = await toJpegIfHeic(buffer, originalName, mime || "");
  if (cloudinaryEnabled()) {
    return uploadToCloudinary(normalized.buffer, normalized.filename);
  }
  ensureDirs();
  const ext = path.extname(normalized.filename).toLowerCase() || guessExt(mime || "");
  const name = `${randomUUID()}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), normalized.buffer);
  return `/uploads/${name}`;
}

export async function persistMulterFile(file: Express.Multer.File): Promise<string> {
  return persistImageBuffer(file.buffer, file.originalname, file.mimetype);
}
