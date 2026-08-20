import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { requireAuth } from "../middleware/requireAuth";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.has(ext)) return cb(new Error("Formato de imagen no soportado."));
    cb(null, true);
  },
});

const router = Router();

// POST /api/upload  (multipart/form-data, campo "file") -> { url }
router.post("/", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo." });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// POST /api/upload/multiple  (campo "files", hasta 10) -> { urls: [] }
router.post("/multiple", requireAuth, upload.array("files", 10), (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];
  res.status(201).json({ urls: files.map((f) => `/uploads/${f.filename}`) });
});

export default router;
