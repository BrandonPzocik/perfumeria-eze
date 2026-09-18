import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { initDb, migrate, usesTurso } from "./db";
import { seed } from "./db/seed";
import { UPLOAD_DIR, WEB_DIST } from "./paths";
import { cloudinaryEnabled, initCloudinary } from "./storage/cloudinary";

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

function corsOrigin(): cors.CorsOptions["origin"] {
  const extra = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  if (process.env.NODE_ENV !== "production") return true;
  return (origin, cb) => {
    if (!origin) return cb(null, true);
    const normalized = origin.replace(/\/$/, "");
    if (extra.includes(normalized)) return cb(null, true);
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized)) return cb(null, true);
    cb(null, false);
  };
}

async function main() {
  assertProductionConfig();
  await initDb();
  await migrate();
  await seed();
  initCloudinary();

  const app = express();
  const PORT = Number(process.env.PORT) || 3001;

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use(
    cors({
      origin: corsOrigin(),
    })
  );
  app.use(express.json({ limit: "5mb" }));

  app.use("/uploads", express.static(UPLOAD_DIR));

  app.get("/api/health", (_req, res) =>
    res.json({
      ok: true,
      service: "maison-ambar-api",
      storage: {
        database: usesTurso() ? "turso" : "sqlite-local",
        images: cloudinaryEnabled() ? "cloudinary" : "disk",
      },
    })
  );

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
    console.log(`   Salud: http://localhost:${PORT}/api/health`);
    console.log(`   Base: ${usesTurso() ? "Turso" : "SQLite local"} · Fotos: ${cloudinaryEnabled() ? "Cloudinary" : "disco local"}\n`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
