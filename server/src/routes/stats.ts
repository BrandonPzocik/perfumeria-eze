import { Router } from "express";
import { db } from "../db";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

async function count(sql: string) {
  return Number(((await db.prepare(sql).get()) as any)?.c || 0);
}

router.get("/dashboard", requireAuth, async (_req, res) => {
  const totalPerfumes = await count(`SELECT COUNT(*) as c FROM perfumes`);
  const published = await count(`SELECT COUNT(*) as c FROM perfumes WHERE visible = 1`);
  const hidden = totalPerfumes - published;
  const stockTotal = Number(((await db.prepare(`SELECT COALESCE(SUM(stock),0) as s FROM perfumes`).get()) as any)?.s || 0);
  const lowStock = await count(`SELECT COUNT(*) as c FROM perfumes WHERE stock > 0 AND stock <= min_stock`);
  const outOfStock = await count(`SELECT COUNT(*) as c FROM perfumes WHERE stock = 0`);
  const featured = await count(`SELECT COUNT(*) as c FROM perfumes WHERE destacado = 1`);
  const brands = await count(`SELECT COUNT(DISTINCT brand) as c FROM perfumes`);
  const families = await count(`SELECT COUNT(DISTINCT family) as c FROM perfumes`);

  const mostViewed = await db.prepare(`SELECT id, name, brand, views FROM perfumes ORDER BY views DESC LIMIT 6`).all();
  const mostAddedToCart = await db.prepare(`SELECT id, name, brand, cart_adds as cartAdds FROM perfumes ORDER BY cart_adds DESC LIMIT 6`).all();
  const mostWhatsapp = await db.prepare(`SELECT id, name, brand, whatsapp_clicks as whatsappClicks FROM perfumes ORDER BY whatsapp_clicks DESC LIMIT 6`).all();

  const byFamily = await db.prepare(`SELECT family, COUNT(*) as count FROM perfumes GROUP BY family ORDER BY count DESC`).all();
  const byBrand = await db.prepare(`SELECT brand, COUNT(*) as count FROM perfumes GROUP BY brand ORDER BY count DESC`).all();

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
