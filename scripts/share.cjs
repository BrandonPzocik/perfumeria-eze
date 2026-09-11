#!/usr/bin/env node
/**
 * Publica el catálogo en un link HTTPS temporal (Cloudflare Tunnel).
 * El cliente entra desde el celular; tu computadora tiene que quedar prendida.
 * Ctrl+C corta el link.
 */
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");

const ROOT = path.join(__dirname, "..");
const PORT = process.env.SHARE_PORT || "3080";
const LOCAL_BIN = path.join(__dirname, "bin", "cloudflared");

function hasCommand(cmd) {
  const r = spawnSync("which", [cmd], { encoding: "utf8" });
  return r.status === 0;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { "User-Agent": "perfume-catalog-share" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          try {
            fs.unlinkSync(dest);
          } catch {
            /* ignore */
          }
          return download(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          try {
            fs.unlinkSync(dest);
          } catch {
            /* ignore */
          }
          return reject(new Error(`No se pudo bajar cloudflared (${res.statusCode})`));
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        file.close();
        try {
          fs.unlinkSync(dest);
        } catch {
          /* ignore */
        }
        reject(err);
      });
  });
}

async function ensureCloudflared() {
  if (hasCommand("cloudflared")) return "cloudflared";
  if (fs.existsSync(LOCAL_BIN)) return LOCAL_BIN;

  const arch = os.arch() === "arm64" ? "arm64" : "amd64";
  const url = `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-${arch}.tgz`;
  const binDir = path.dirname(LOCAL_BIN);
  fs.mkdirSync(binDir, { recursive: true });
  const tgz = path.join(binDir, "cloudflared.tgz");

  console.log("Descargando cloudflared (una sola vez)…\n");
  await download(url, tgz);
  const extract = spawnSync("tar", ["-xzf", tgz, "-C", binDir], { encoding: "utf8" });
  try {
    fs.unlinkSync(tgz);
  } catch {
    /* ignore */
  }
  if (extract.status !== 0) {
    throw new Error(extract.stderr || "No se pudo descomprimir cloudflared.");
  }

  const extracted = fs.existsSync(path.join(binDir, "cloudflared"))
    ? path.join(binDir, "cloudflared")
    : fs.readdirSync(binDir)
        .map((f) => path.join(binDir, f))
        .find((f) => path.basename(f).startsWith("cloudflared"));
  if (!extracted) throw new Error("No encontré el binario de cloudflared en el .tgz.");
  if (extracted !== LOCAL_BIN) fs.renameSync(extracted, LOCAL_BIN);
  fs.chmodSync(LOCAL_BIN, 0o755);
  return LOCAL_BIN;
}

async function main() {
  let cloudflared;
  try {
    cloudflared = await ensureCloudflared();
  } catch (err) {
    console.error(err.message || err);
    console.error("\nInstalalo a mano: brew install cloudflared");
    process.exit(1);
  }

  console.log("\nCompilando catálogo + API (una vez)…\n");
  const build = spawnSync("npm", ["run", "build"], { cwd: ROOT, stdio: "inherit" });
  if (build.status !== 0) {
    console.error("Falló el build. Revisá el error de arriba.");
    process.exit(1);
  }

  console.log(`\nLevantando el sitio en http://localhost:${PORT}`);
  console.log("Dejá ESTA terminal abierta. El link aparece abajo (trycloudflare.com).");
  console.log("Ctrl+C para cortar cuando el cliente ya no lo necesite.\n");

  const children = [];

  function shutdown() {
    for (const child of children) {
      try {
        child.kill("SIGTERM");
      } catch {
        /* ya salió */
      }
    }
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  const server = spawn("npm", ["start", "--prefix", "./server"], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, PORT, NODE_ENV: process.env.NODE_ENV || "development" },
  });
  children.push(server);

  server.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`El servidor salió con código ${code}. ¿El puerto ${PORT} está ocupado?`);
    }
    shutdown();
  });

  setTimeout(() => {
    const tunnel = spawn(cloudflared, ["tunnel", "--url", `http://127.0.0.1:${PORT}`], {
      cwd: ROOT,
      stdio: "inherit",
    });
    children.push(tunnel);
    tunnel.on("exit", shutdown);
  }, 1500);
}

main();
