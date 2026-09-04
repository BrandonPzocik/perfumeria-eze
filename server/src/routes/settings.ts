import { Router } from "express";
import { db } from "../db";
import { rowToSettings } from "../utils/mappers";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", (_req, res) => {
  const row = db.prepare(`SELECT * FROM settings WHERE id = 1`).get();
  res.json(rowToSettings(row));
});

router.patch("/", requireAuth, (req, res) => {
  const b = req.body || {};
  const existing = db.prepare(`SELECT * FROM settings WHERE id = 1`).get() as any;

  const merged = {
    whatsapp_number: b.whatsappNumber ?? existing.whatsapp_number,
    whatsapp_number_femenino: b.whatsappNumberFemenino ?? existing.whatsapp_number_femenino,
    whatsapp_number_masculino: b.whatsappNumberMasculino ?? existing.whatsapp_number_masculino,
    whatsapp_message: b.whatsappMessage ?? existing.whatsapp_message,
    store_name: b.storeName ?? existing.store_name,
    store_name_accent: b.storeNameAccent ?? existing.store_name_accent,
    logo_url: b.logoUrl !== undefined ? b.logoUrl : existing.logo_url,
    banner_url: b.bannerUrl !== undefined ? b.bannerUrl : existing.banner_url,
    primary_color: b.primaryColor ?? existing.primary_color,
    accent_color: b.accentColor ?? existing.accent_color,
    instagram_url: b.instagramUrl !== undefined ? b.instagramUrl : existing.instagram_url,
    instagram_url_femenino: b.instagramUrlFemenino !== undefined ? b.instagramUrlFemenino : existing.instagram_url_femenino,
    facebook_url: b.facebookUrl !== undefined ? b.facebookUrl : existing.facebook_url,
    schedule: b.schedule ?? existing.schedule,
    currency: b.currency ?? existing.currency,
    show_currency: b.showCurrency !== undefined ? (b.showCurrency ? 1 : 0) : existing.show_currency,
    dark_mode_default: b.darkModeDefault !== undefined ? (b.darkModeDefault ? 1 : 0) : existing.dark_mode_default,
  };

  db.prepare(
    `UPDATE settings SET
      whatsapp_number=?, whatsapp_number_femenino=?, whatsapp_number_masculino=?, whatsapp_message=?,
      store_name=?, store_name_accent=?,
      logo_url=?, banner_url=?, primary_color=?, accent_color=?,
      instagram_url=?, instagram_url_femenino=?, facebook_url=?, schedule=?, currency=?, show_currency=?, dark_mode_default=?
    WHERE id = 1`
  ).run(
    merged.whatsapp_number, merged.whatsapp_number_femenino, merged.whatsapp_number_masculino, merged.whatsapp_message,
    merged.store_name, merged.store_name_accent,
    merged.logo_url, merged.banner_url, merged.primary_color, merged.accent_color,
    merged.instagram_url, merged.instagram_url_femenino, merged.facebook_url, merged.schedule, merged.currency, merged.show_currency, merged.dark_mode_default
  );

  const row = db.prepare(`SELECT * FROM settings WHERE id = 1`).get();
  res.json(rowToSettings(row));
});

export default router;
