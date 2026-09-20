import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../db";
import { rowToPerfume } from "../utils/mappers";
import { requireAuth } from "../middleware/requireAuth";
import { listVariants, upsertVariants } from "../db/variants";

const router = Router();
const toAdminPerfume = (row: any) => rowToPerfume(row, { privateFields: true });

const CATALOG_ORDER = `ORDER BY sort_order ASC, created_at DESC`;

async function nextSortOrder() {
  const row = (await db.prepare(`SELECT COALESCE(MAX(sort_order), -1) as m FROM perfumes`).get()) as { m?: number } | undefined;
  return Number(row?.m ?? -1) + 1;
}

/* ------------------------------------------------------------------ */
/* PÚBLICO                                                             */
/* ------------------------------------------------------------------ */

// GET /api/perfumes  -> catálogo público (solo visibles)
router.get("/", async (_req, res) => {
  const rows = (await db.prepare(`SELECT * FROM perfumes WHERE visible = 1 ${CATALOG_ORDER}`).all()) as any[];
  const perfumes: any[] = [];
  for (const row of rows) perfumes.push(await rowToPerfume(row));
  res.json(perfumes);
});

// GET /api/perfumes/:id -> ficha pública + contador de vistas
router.get("/:id", async (req, res) => {
  const id = String(req.params.id);
  const row = (await db.prepare(`SELECT * FROM perfumes WHERE id = ?`).get(id)) as any;
  if (!row || !row.visible) return res.status(404).json({ error: "Perfume no encontrado" });
  await db.prepare(`UPDATE perfumes SET views = views + 1 WHERE id = ?`).run(id);
  row.views += 1;
  res.json(await rowToPerfume(row));
});

// POST /api/perfumes/:id/event  -> registra clic en "agregar al carrito", "comprar" o "compartir"
router.post("/:id/event", async (req, res) => {
  const { type } = req.body || {};
  const columns: Record<string, string> = {
    cart: "cart_adds",
    whatsapp: "whatsapp_clicks",
    share: "shares",
  };
  const col = columns[type];
  if (!col) return res.status(400).json({ error: "Tipo de evento inválido" });
  await db.prepare(`UPDATE perfumes SET ${col} = ${col} + 1 WHERE id = ?`).run(String(req.params.id));
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* ADMIN (requiere token)                                              */
/* ------------------------------------------------------------------ */

// GET /api/perfumes/admin/all -> incluye ocultos, para el panel
router.get("/admin/all", requireAuth, async (_req, res) => {
  const rows = (await db.prepare(`SELECT * FROM perfumes ${CATALOG_ORDER}`).all()) as any[];
  const perfumes: any[] = [];
  for (const row of rows) perfumes.push(await toAdminPerfume(row));
  res.json(perfumes);
});

async function upsertImages(perfumeId: string, images: { url: string; isMain?: boolean }[] | undefined) {
  if (!images) return;
  await db.prepare(`DELETE FROM images WHERE perfume_id = ?`).run(perfumeId);
  for (const [index, img] of images.entries()) {
    await db.prepare(`INSERT INTO images (id, perfume_id, url, "order", is_main) VALUES (?, ?, ?, ?, ?)`).run(
      randomUUID(),
      perfumeId,
      img.url,
      index,
      img.isMain || index === 0 ? 1 : 0
    );
  }
}

router.post("/admin/reorder", requireAuth, async (req, res) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Mandá la lista de SKUs en el orden que querés mostrar." });
  }
  for (let i = 0; i < ids.length; i++) {
    await db.prepare(`UPDATE perfumes SET sort_order = ? WHERE id = ?`).run(i, String(ids[i]));
  }
  res.json({ ok: true });
});

// POST /api/perfumes/admin -> crear
router.post("/admin", requireAuth, async (req, res) => {
  const b = req.body || {};
  if (!b.id || !b.name || !b.brand) {
    return res.status(400).json({ error: "SKU, nombre y marca son obligatorios." });
  }
  const exists = await db.prepare(`SELECT id FROM perfumes WHERE id = ?`).get(b.id);
  if (exists) return res.status(409).json({ error: `Ya existe un perfume con SKU "${b.id}".` });

  const sortOrder = await nextSortOrder();

  await db.prepare(
    `INSERT INTO perfumes (
      id, internal_code, name, brand, gender, family, type, size, description,
      price, old_price, cost, stock, min_stock,
      notes_salida, notes_corazon, notes_fondo, intensidad, duracion,
      visible, destacado, oferta, nuevo, mas_vendido, kind, sort_order
    ) VALUES (?,?,?,?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?)
  `
  ).run(
    b.id, b.internalCode || null, b.name, b.brand, b.gender || "Unisex", b.family || "Amaderada",
    b.type || "EDP", b.size || "100ml", b.description || "",
    Number(b.price) || 0, b.oldPrice ? Number(b.oldPrice) : null, b.cost ? Number(b.cost) : null,
    Number(b.stock) || 0, Number(b.minStock) || 3,
    JSON.stringify(b.notas?.salida || []), JSON.stringify(b.notas?.corazon || []), JSON.stringify(b.notas?.fondo || []),
    Number(b.intensidad) || 3, b.duracion || "",
    b.visible === false ? 0 : 1, b.destacado ? 1 : 0, b.oferta ? 1 : 0, b.nuevo ? 1 : 0, b.masVendido ? 1 : 0,
    "bottle", sortOrder
  );

  await upsertImages(b.id, b.images);
  await upsertVariants(b.id, b.variants);

  const row = await db.prepare(`SELECT * FROM perfumes WHERE id = ?`).get(b.id);
  res.status(201).json(await toAdminPerfume(row));
});

// PATCH /api/perfumes/admin/:id -> editar (parcial)
router.patch("/admin/:id", requireAuth, async (req, res) => {
  const id = String(req.params.id);
  const existing = (await db.prepare(`SELECT * FROM perfumes WHERE id = ?`).get(id)) as any;
  if (!existing) return res.status(404).json({ error: "Perfume no encontrado" });

  const b = req.body || {};
  const merged = {
    internal_code: b.internalCode ?? existing.internal_code,
    name: b.name ?? existing.name,
    brand: b.brand ?? existing.brand,
    gender: b.gender ?? existing.gender,
    family: b.family ?? existing.family,
    type: b.type ?? existing.type,
    size: b.size ?? existing.size,
    description: b.description ?? existing.description,
    price: b.price !== undefined ? Number(b.price) : existing.price,
    old_price: b.oldPrice !== undefined ? (b.oldPrice === null ? null : Number(b.oldPrice)) : existing.old_price,
    cost: b.cost !== undefined ? (b.cost === null ? null : Number(b.cost)) : existing.cost,
    stock: b.stock !== undefined ? Number(b.stock) : existing.stock,
    min_stock: b.minStock !== undefined ? Number(b.minStock) : existing.min_stock,
    notes_salida: b.notas?.salida ? JSON.stringify(b.notas.salida) : existing.notes_salida,
    notes_corazon: b.notas?.corazon ? JSON.stringify(b.notas.corazon) : existing.notes_corazon,
    notes_fondo: b.notas?.fondo ? JSON.stringify(b.notas.fondo) : existing.notes_fondo,
    intensidad: b.intensidad !== undefined ? Number(b.intensidad) : existing.intensidad,
    duracion: b.duracion ?? existing.duracion,
    visible: b.visible !== undefined ? (b.visible ? 1 : 0) : existing.visible,
    destacado: b.destacado !== undefined ? (b.destacado ? 1 : 0) : existing.destacado,
    oferta: b.oferta !== undefined ? (b.oferta ? 1 : 0) : existing.oferta,
    nuevo: b.nuevo !== undefined ? (b.nuevo ? 1 : 0) : existing.nuevo,
    mas_vendido: b.masVendido !== undefined ? (b.masVendido ? 1 : 0) : existing.mas_vendido,
    kind: "bottle",
  };

  await db.prepare(
    `UPDATE perfumes SET
      internal_code=?, name=?, brand=?, gender=?, family=?, type=?, size=?, description=?,
      price=?, old_price=?, cost=?, stock=?, min_stock=?,
      notes_salida=?, notes_corazon=?, notes_fondo=?, intensidad=?, duracion=?,
      visible=?, destacado=?, oferta=?, nuevo=?, mas_vendido=?, kind=?,
      updated_at = datetime('now')
    WHERE id = ?`
  ).run(
    merged.internal_code, merged.name, merged.brand, merged.gender, merged.family, merged.type, merged.size, merged.description,
    merged.price, merged.old_price, merged.cost, merged.stock, merged.min_stock,
    merged.notes_salida, merged.notes_corazon, merged.notes_fondo, merged.intensidad, merged.duracion,
    merged.visible, merged.destacado, merged.oferta, merged.nuevo, merged.mas_vendido, merged.kind,
    id
  );

  if (b.images) await upsertImages(id, b.images);
  if (Array.isArray(b.variants)) await upsertVariants(id, b.variants);

  const row = await db.prepare(`SELECT * FROM perfumes WHERE id = ?`).get(id);
  res.json(await toAdminPerfume(row));
});

// DELETE /api/perfumes/admin/:id
router.delete("/admin/:id", requireAuth, async (req, res) => {
  const result = await db.prepare(`DELETE FROM perfumes WHERE id = ?`).run(String(req.params.id));
  if (result.changes === 0) return res.status(404).json({ error: "Perfume no encontrado" });
  res.json({ ok: true });
});

// POST /api/perfumes/admin/:id/duplicate
router.post("/admin/:id/duplicate", requireAuth, async (req, res) => {
  const existing = (await db.prepare(`SELECT * FROM perfumes WHERE id = ?`).get(String(req.params.id))) as any;
  if (!existing) return res.status(404).json({ error: "Perfume no encontrado" });

  let newId = `${existing.id}-COPIA`;
  let n = 1;
  while (await db.prepare(`SELECT id FROM perfumes WHERE id = ?`).get(newId)) {
    n += 1;
    newId = `${existing.id}-COPIA-${n}`;
  }

  await db.prepare(
    `INSERT INTO perfumes (
      id, internal_code, name, brand, gender, family, type, size, description,
      price, old_price, cost, stock, min_stock,
      notes_salida, notes_corazon, notes_fondo, intensidad, duracion,
      visible, destacado, oferta, nuevo, mas_vendido, kind, sort_order
    ) VALUES (?,?,?,?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?,?,?)`
  ).run(
    newId, existing.internal_code, `${existing.name} (copia)`, existing.brand, existing.gender, existing.family,
    existing.type, existing.size, existing.description,
    existing.price, existing.old_price, existing.cost, existing.stock, existing.min_stock,
    existing.notes_salida, existing.notes_corazon, existing.notes_fondo, existing.intensidad, existing.duracion,
    0, 0, existing.oferta, existing.nuevo, existing.mas_vendido, existing.kind || "bottle",
    await nextSortOrder()
  );

  const images = (await db.prepare(`SELECT url, is_main FROM images WHERE perfume_id = ? ORDER BY "order" ASC`).all(existing.id)) as any[];
  await upsertImages(newId, images.map((i) => ({ url: i.url, isMain: !!i.is_main })));
  await upsertVariants(
    newId,
    (await listVariants(existing.id)).map((v) => ({ size: v.size, price: v.price, stock: v.stock }))
  );

  const row = await db.prepare(`SELECT * FROM perfumes WHERE id = ?`).get(newId);
  res.status(201).json(await toAdminPerfume(row));
});

export default router;
