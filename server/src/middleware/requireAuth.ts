import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";

export interface AuthedRequest extends Request {
  admin?: { sub: string; email: string; name: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado. Iniciá sesión nuevamente." });
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyToken(token);
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Sesión inválida o expirada. Iniciá sesión nuevamente." });
  }
}
