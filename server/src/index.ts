import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { migrate } from "./db";
import { seed } from "./db/seed";

import authRoutes from "./routes/auth";
import perfumeRoutes from "./routes/perfumes";
import settingsRoutes from "./routes/settings";
import uploadRoutes from "./routes/upload";
import importRoutes from "./routes/import";
import statsRoutes from "./routes/stats";

migrate();
seed();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "maison-ambar-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/perfumes", perfumeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/import", importRoutes);
app.use("/api/stats", statsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.path}` });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`\n🌸 API MAISON Ámbar corriendo en http://localhost:${PORT}`);
  console.log(`   Salud: http://localhost:${PORT}/api/health\n`);
});
