import { Router } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { requireAuth } from "../middleware/requireAuth";
import { UPLOAD_DIR } from "../paths";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.has(ext) || !ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error("Formato de imagen no soportado."));
    }
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
