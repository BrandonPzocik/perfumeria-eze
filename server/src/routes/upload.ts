import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import convert from "heic-convert";
import { requireAuth } from "../middleware/requireAuth";
import { UPLOAD_DIR } from "../paths";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || guessExt(file.mimetype);
    cb(null, `${randomUUID()}${ext}`);
  },
});

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

function guessExt(mime: string) {
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

function isAllowedImage(file: Express.Multer.File) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = String(file.mimetype || "").toLowerCase();
  if (ALLOWED_EXT.has(ext)) return true;
  if (mime.startsWith("image/")) return true;
  return false;
}

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!isAllowedImage(file)) {
      return cb(new Error("Formato de imagen no soportado."));
    }
    cb(null, true);
  },
});

async function normalizeUpload(file: Express.Multer.File) {
  const ext = path.extname(file.filename).toLowerCase();
  const mime = String(file.mimetype || "").toLowerCase();
  const isHeic = [".heic", ".heif"].includes(ext) || mime.includes("heic") || mime.includes("heif");
  if (!isHeic) return file;

  try {
    const input = fs.readFileSync(file.path);
    const output = await convert({ buffer: input, format: "JPEG", quality: 0.9 });
    const newName = `${path.basename(file.filename, ext)}.jpg`;
    const newPath = path.join(path.dirname(file.path), newName);
    fs.writeFileSync(newPath, Buffer.from(output));
    fs.unlinkSync(file.path);
    file.filename = newName;
    file.path = newPath;
  } catch {
    /* si no se pudo convertir, dejamos el archivo original */
  }
  return file;
}

const router = Router();

router.post("/", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo." });
    const file = await normalizeUpload(req.file);
    res.status(201).json({ url: `/uploads/${file.filename}` });
  } catch (err) {
    next(err);
  }
});

router.post("/multiple", requireAuth, upload.array("files", 10), async (req, res, next) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const normalized: Express.Multer.File[] = [];
    for (const file of files) {
      normalized.push(await normalizeUpload(file));
    }
    res.status(201).json({ urls: normalized.map((f) => `/uploads/${f.filename}`) });
  } catch (err) {
    next(err);
  }
});

export default router;
