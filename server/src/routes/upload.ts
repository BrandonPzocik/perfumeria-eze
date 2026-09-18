import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/requireAuth";
import { isAllowedImage, persistMulterFile } from "../storage/persistImage";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!isAllowedImage(file)) {
      return cb(new Error("Formato de imagen no soportado."));
    }
    cb(null, true);
  },
});

const router = Router();

router.post("/", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo." });
    const url = await persistMulterFile(req.file);
    res.status(201).json({ url });
  } catch (err) {
    next(err);
  }
});

router.post("/multiple", requireAuth, upload.array("files", 10), async (req, res, next) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const urls: string[] = [];
    for (const file of files) {
      urls.push(await persistMulterFile(file));
    }
    res.status(201).json({ urls });
  } catch (err) {
    next(err);
  }
});

export default router;
