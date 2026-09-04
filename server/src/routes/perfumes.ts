import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../db";
import { rowToPerfume } from "../utils/mappers";
import { requireAuth } from "../middleware/requireAuth";
import { listVariants, upsertVariants } from "../db/variants";

const router = Router();
const toAdminPerfume = (row: any) => rowToPerfume(row, { privateFields: true });

/* ------------------------------------------------------------------ */
/* PÚBLICO                                                             */
/* ------------------------------------------------------------------ */

// GET /api/perfumes  -> catálogo público (solo visibles)
router.get("/", (req, res) => {
  const rows = db.prepare(`SELECT * FROM perfumes WHERE visible = 1 ORDER BY created_at DESC`).all() as any[];
  res.json(rows.map((row) => rowToPerfume(row)));
});

// GET /api/perfumes/:id -> ficha pública + contador de vistas
router.get("/:id", (req, res) => {
  const id = String(req.params.id);
  const row = db.prepare(`SELECT * FROM perfumes WHERE id = ?`).get(id) as any;
  if (!row || !row.visible) return res.status(404).json({ error: "Perfume no encontrado" });
  db.prepare(`UPDATE perfumes SET views = views + 1 WHERE id = ?`).run(id);
  row.views += 1;
  res.json(rowToPerfume(row));
});

// POST /api/perfumes/:id/event  -> registra clic en "agregar al carrito", "comprar" o "compartir"
router.post("/:id/event", (req, res) => {
  const { type } = req.body || {};
  const columns: Record<string, string> = {
    cart: "cart_adds",
    whatsapp: "whatsapp_clicks",
    share: "shares",
  };
  const col = columns[type];
  if (!col) return res.status(400).json({ error: "Tipo de evento inválido" });
  db.prepare(`UPDATE perfumes SET ${col} = ${col} + 1 WHERE id = ?`).run(String(req.params.id));
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* ADMIN (requiere token)                                              */
/* ------------------------------------------------------------------ */

// GET /api/perfumes/admin/all -> incluye ocultos, para el panel
router.get("/admin/all", requireAuth, (_req, res) => {
  const rows = db.prepare(`SELECT * FROM perfumes ORDER BY created_at DESC`).all() as any[];
  res.json(rows.map(toAdminPerfume));
});

function upsertImages(perfumeId: string, images: { url: string; isMain?: boolean }[] | undefined) {
  if (!images) return;
  db.prepare(`DELETE FROM images WHERE perfume_id = ?`).run(perfumeId);
  images.forEach((img, index) => {
    db.prepare(`INSERT INTO images (id, perfume_id, url, "order", is_main) VALUES (?, ?, ?, ?, ?)`).run(
      randomUUID(),
      perfumeId,
      img.url,
      index,
      img.isMain || index === 0 ? 1 : 0
    );
  });
}

// POST /api/perfumes/admin -> crear
router.post("/admin", requireAuth, (req, res) => {
  const b = req.body || {};
  if (!b.id || !b.name || !b.brand) {
    return res.status(400).json({ error: "SKU, nombre y marca son obligatorios." });
  }
  const exists = db.prepare(`SELECT id FROM perfumes WHERE id = ?`).get(b.id);
  if (exists) return res.status(409).json({ error: `Ya existe un perfume con SKU "${b.id}".` });

  db.prepare(
    `INSERT INTO perfumes (
      id, internal_code, name, brand, gender, family, type, size, description,
      price, old_price, cost, stock, min_stock,
      notes_salida, notes_corazon, notes_fondo, intensidad, duracion,
      visible, destacado, oferta, nuevo, mas_vendido, kind
    ) VALUES (?,?,?,?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?)
  `).run(
    b.id, b.internalCode || null, b.name, b.brand, b.gender || "Unisex", b.family || "Amaderada",
    b.type || "EDP", b.size || "100ml", b.description || "",
    Number(b.price) || 0, b.oldPrice ? Number(b.oldPrice) : null, b.cost ? Number(b.cost) : null,
    Number(b.stock) || 0, Number(b.minStock) || 3,
    JSON.stringify(b.notas?.salida || []), JSON.stringify(b.notas?.corazon || []), JSON.stringify(b.notas?.fondo || []),
    Number(b.intensidad) || 3, b.duracion || "",
    b.visible === false ? 0 : 1, b.destacado ? 1 : 0, b.oferta ? 1 : 0, b.nuevo ? 1 : 0, b.masVendido ? 1 : 0,
    "bottle"
  );

  upsertImages(b.id, b.images);
  upsertVariants(b.id, b.variants);

  const row = db.prepare(`SELECT * FROM perfumes WHERE id = ?`).get(b.id);
  res.status(201).json(toAdminPerfume(row));
});

// PATCH /api/perfumes/admin/:id -> editar (parcial)
router.patch("/admin/:id", requireAuth, (req, res) => {
  const id = String(req.params.id);
  const existing = db.prepare(`SELECT * FROM perfumes WHERE id = ?`).get(id) as any;
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

  db.prepare(
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

  if (b.images) upsertImages(id, b.images);
  if (Array.isArray(b.variants)) upsertVariants(id, b.variants);

  const row = db.prepare(`SELECT * FROM perfumes WHERE id = ?`).get(id);
  res.json(toAdminPerfume(row));
});

// DELETE /api/perfumes/admin/:id
router.delete("/admin/:id", requireAuth, (req, res) => {
  const result = db.prepare(`DELETE FROM perfumes WHERE id = ?`).run(String(req.params.id));
  if (result.changes === 0) return res.status(404).json({ error: "Perfume no encontrado" });
  res.json({ ok: true });
});

// POST /api/perfumes/admin/:id/duplicate
router.post("/admin/:id/duplicate", requireAuth, (req, res) => {
  const existing = db.prepare(`SELECT * FROM perfumes WHERE id = ?`).get(String(req.params.id)) as any;
  if (!existing) return res.status(404).json({ error: "Perfume no encontrado" });

  let newId = `${existing.id}-COPIA`;
  let n = 1;
  while (db.prepare(`SELECT id FROM perfumes WHERE id = ?`).get(newId)) {
    n += 1;
    newId = `${existing.id}-COPIA-${n}`;
  }

  db.prepare(
    `INSERT INTO perfumes (
      id, internal_code, name, brand, gender, family, type, size, description,
      price, old_price, cost, stock, min_stock,
      notes_salida, notes_corazon, notes_fondo, intensidad, duracion,
      visible, destacado, oferta, nuevo, mas_vendido, kind
    ) VALUES (?,?,?,?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?,?)`
  ).run(
    newId, existing.internal_code, `${existing.name} (copia)`, existing.brand, existing.gender, existing.family,
    existing.type, existing.size, existing.description,
    existing.price, existing.old_price, existing.cost, existing.stock, existing.min_stock,
    existing.notes_salida, existing.notes_corazon, existing.notes_fondo, existing.intensidad, existing.duracion,
    0, 0, existing.oferta, existing.nuevo, existing.mas_vendido, existing.kind || "bottle"
  );

  const images = db.prepare(`SELECT url, is_main FROM images WHERE perfume_id = ? ORDER BY "order" ASC`).all(existing.id) as any[];
  upsertImages(newId, images.map((i) => ({ url: i.url, isMain: !!i.is_main })));
  upsertVariants(newId, listVariants(existing.id));

  const row = db.prepare(`SELECT * FROM perfumes WHERE id = ?`).get(newId);
  res.status(201).json(toAdminPerfume(row));
});

export default router;
