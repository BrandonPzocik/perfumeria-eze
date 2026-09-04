import type { NextFunction, Request, Response } from "express";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = clientIp(req);
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (bucket && now < bucket.resetAt && bucket.count >= MAX_ATTEMPTS) {
    const minutes = Math.max(1, Math.ceil((bucket.resetAt - now) / 60_000));
    return res.status(429).json({
      error: `Demasiados intentos. Probá de nuevo en ${minutes} minuto${minutes === 1 ? "" : "s"}.`,
    });
  }

  if (bucket && now >= bucket.resetAt) buckets.delete(ip);
  next();
}

export function recordLoginFailure(req: Request) {
  const ip = clientIp(req);
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

export function clearLoginFailures(req: Request) {
  buckets.delete(clientIp(req));
}
