import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { migrate } from "./db";
import { seed } from "./db/seed";
import { UPLOAD_DIR, WEB_DIST } from "./paths";

import authRoutes from "./routes/auth";
import perfumeRoutes from "./routes/perfumes";
import settingsRoutes from "./routes/settings";
import uploadRoutes from "./routes/upload";
import importRoutes from "./routes/import";
import statsRoutes from "./routes/stats";
import { securityHeaders } from "./middleware/securityHeaders";

function assertProductionConfig() {
  if (process.env.NODE_ENV !== "production") return;
  const secret = process.env.JWT_SECRET || "";
  if (!secret || /cambia-esta-clave|dev-secret-change-me/i.test(secret)) {
    throw new Error("Definí JWT_SECRET con una clave larga y aleatoria en las variables de entorno de Render.");
  }
}

assertProductionConfig();
migrate();
seed();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(securityHeaders);
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? false : true,
  })
);
app.use(express.json({ limit: "5mb" }));

app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "maison-ambar-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/perfumes", perfumeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/import", importRoutes);
app.use("/api/stats", statsRoutes);

const indexHtml = path.join(WEB_DIST, "index.html");
if (fs.existsSync(indexHtml)) {
  app.use(express.static(WEB_DIST));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    res.sendFile(indexHtml);
  });
}

app.use((req, res) => {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.path}` });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (err.name === "MulterError") {
    return res.status(400).json({ error: "Archivo inválido o demasiado grande." });
  }
  const status = Number(err.status) || 500;
  const publicMessage = status < 500 ? err.message || "Solicitud inválida" : "Error interno del servidor";
  res.status(status).json({ error: publicMessage });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🌸 API MAISON Ámbar corriendo en http://localhost:${PORT}`);
  console.log(`   Salud: http://localhost:${PORT}/api/health\n`);
});
