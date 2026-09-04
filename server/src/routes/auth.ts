import { Router } from "express";
import { db } from "../db";
import { comparePassword, hashPassword, signToken } from "../utils/auth";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { clearLoginFailures, loginRateLimit, recordLoginFailure } from "../middleware/rateLimit";

const router = Router();
const DUMMY_HASH = hashPassword("invalid-login-placeholder");

router.post("/login", loginRateLimit, (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res.status(400).json({ error: "Ingresá email y contraseña." });
  }
  if (email.length > 254 || password.length > 200) {
    recordLoginFailure(req);
    return res.status(401).json({ error: "Email o contraseña incorrectos." });
  }

  const user = db.prepare("SELECT * FROM admin_users WHERE email = ?").get(email) as any;
  const hash = user?.password_hash || DUMMY_HASH;
  const valid = comparePassword(password, hash);

  if (!user || !valid) {
    recordLoginFailure(req);
    return res.status(401).json({ error: "Email o contraseña incorrectos." });
  }

  clearLoginFailures(req);
  const token = signToken({ sub: user.id, email: user.email, name: user.name });
  res.json({ token, admin: { id: user.id, email: user.email, name: user.name } });
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  const admin = req.admin!;
  res.json({ ok: true, admin: { id: admin.sub, email: admin.email, name: admin.name } });
});

export default router;
