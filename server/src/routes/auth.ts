import { Router } from "express";
import { db } from "../db";
import { comparePassword, signToken } from "../utils/auth";

const router = Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Ingresá email y contraseña." });
  }

  const user = db.prepare("SELECT * FROM admin_users WHERE email = ?").get(String(email).toLowerCase()) as any;
  if (!user || !comparePassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Email o contraseña incorrectos." });
  }

  const token = signToken({ sub: user.id, email: user.email, name: user.name });
  res.json({ token, admin: { id: user.id, email: user.email, name: user.name } });
});

router.get("/me", (req, res) => {
  // simple echo endpoint used by the admin app to validate a stored token
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No autorizado" });
  res.json({ ok: true });
});

export default router;
