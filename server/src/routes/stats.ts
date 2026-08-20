import { Router } from "express";
import { db } from "../db";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/dashboard", requireAuth, (_req, res) => {
  const totalPerfumes = (db.prepare(`SELECT COUNT(*) as c FROM perfumes`).get() as any).c;
  const published = (db.prepare(`SELECT COUNT(*) as c FROM perfumes WHERE visible = 1`).get() as any).c;
  const hidden = totalPerfumes - published;
  const stockTotal = (db.prepare(`SELECT COALESCE(SUM(stock),0) as s FROM perfumes`).get() as any).s;
  const lowStock = (db.prepare(`SELECT COUNT(*) as c FROM perfumes WHERE stock > 0 AND stock <= min_stock`).get() as any).c;
  const outOfStock = (db.prepare(`SELECT COUNT(*) as c FROM perfumes WHERE stock = 0`).get() as any).c;
  const featured = (db.prepare(`SELECT COUNT(*) as c FROM perfumes WHERE destacado = 1`).get() as any).c;
  const brands = (db.prepare(`SELECT COUNT(DISTINCT brand) as c FROM perfumes`).get() as any).c;
  const families = (db.prepare(`SELECT COUNT(DISTINCT family) as c FROM perfumes`).get() as any).c;

  const mostViewed = db.prepare(`SELECT id, name, brand, views FROM perfumes ORDER BY views DESC LIMIT 6`).all();
  const mostAddedToCart = db.prepare(`SELECT id, name, brand, cart_adds as cartAdds FROM perfumes ORDER BY cart_adds DESC LIMIT 6`).all();
  const mostWhatsapp = db.prepare(`SELECT id, name, brand, whatsapp_clicks as whatsappClicks FROM perfumes ORDER BY whatsapp_clicks DESC LIMIT 6`).all();

  const byFamily = db.prepare(`SELECT family, COUNT(*) as count FROM perfumes GROUP BY family ORDER BY count DESC`).all();
  const byBrand = db.prepare(`SELECT brand, COUNT(*) as count FROM perfumes GROUP BY brand ORDER BY count DESC`).all();

  res.json({
    totals: {
      totalPerfumes, published, hidden, stockTotal, lowStock, outOfStock, featured, brands, families,
    },
    mostViewed,
    mostAddedToCart,
    mostWhatsapp,
    byFamily,
    byBrand,
  });
});

export default router;
