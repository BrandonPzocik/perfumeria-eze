import { Router } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { db } from "../db";
import { requireAuth } from "../middleware/requireAuth";
import { UPLOAD_DIR } from "../paths";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// Encabezados esperados en español -> nuestro campo interno
const HEADER_GUESSES: Record<string, string> = {
  sku: "id",
  "código": "id",
  "codigo": "id",
  "código interno": "internalCode",
  "codigo interno": "internalCode",
  nombre: "name",
  perfume: "name",
  marca: "brand",
  género: "gender",
  genero: "gender",
  "familia olfativa": "family",
  familia: "family",
  tipo: "type",
  tamaño: "size",
  tamano: "size",
  precio: "price",
  "precio oferta": "oldPrice",
  costo: "cost",
  stock: "stock",
  "stock mínimo": "minStock",
  "stock minimo": "minStock",
  descripción: "description",
  descripcion: "description",
  intensidad: "intensidad",
  "duración": "duracion",
  duracion: "duracion",
  "notas salida": "notasSalida",
  "notas corazón": "notasCorazon",
  "notas corazon": "notasCorazon",
  "notas fondo": "notasFondo",
  foto: "imageUrl",
  imagen: "imageUrl",
  "imagen url": "imageUrl",
  visible: "visible",
  destacado: "destacado",
  oferta: "oferta",
  nuevo: "nuevo",
  "más vendido": "masVendido",
  "mas vendido": "masVendido",
};

function guessMapping(headers: string[]) {
  const mapping: Record<string, string | null> = {};
  headers.forEach((h) => {
    const key = h.trim().toLowerCase();
    mapping[h] = HEADER_GUESSES[key] || null;
  });
  return mapping;
}

// POST /api/import/preview  (multipart, campo "file") -> headers + filas + mapping sugerido
router.post("/preview", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Subí un archivo XLSX o CSV." });

  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, any>[];

    if (rows.length === 0) {
      return res.status(400).json({ error: "El archivo no tiene filas de datos." });
    }

    const headers = Object.keys(rows[0]);
    const mapping = guessMapping(headers);

    res.json({
      fileName: req.file.originalname,
      headers,
      mapping,
      totalRows: rows.length,
      preview: rows.slice(0, 20),
      rows, // se reenvían al commit ya que este server no guarda estado entre requests
    });
  } catch (err: any) {
    res.status(400).json({ error: `No se pudo leer el archivo: ${err.message}` });
  }
});

interface CommitRow {
  [field: string]: any;
}

function splitNotes(value: any): string[] {
  if (!value) return [];
  return String(value)
    .split(/[,;/]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function downloadImage(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const contentType = resp.headers.get("content-type") || "";
    const ext = contentType.includes("png") ? ".png" : contentType.includes("webp") ? ".webp" : ".jpg";
    const buffer = Buffer.from(await resp.arrayBuffer());
    const fileName = `${randomUUID()}${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, fileName), buffer);
    return `/uploads/${fileName}`;
  } catch {
    return null;
  }
}

// POST /api/import/commit  { fileName, mapping, rows } -> crea/actualiza por SKU
router.post("/commit", requireAuth, async (req, res) => {
  const { fileName, mapping, rows } = req.body as { fileName: string; mapping: Record<string, string | null>; rows: CommitRow[] };

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "No hay filas para importar." });
  }

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const mapped: CommitRow = {};
    Object.entries(mapping).forEach(([header, field]) => {
      if (field) mapped[field] = raw[header];
    });

    const id = String(mapped.id || "").trim();
    const name = String(mapped.name || "").trim();
    const brand = String(mapped.brand || "").trim();

    if (!id || !name || !brand) {
      errors.push(`Fila ${i + 2}: faltan SKU, nombre o marca.`);
      continue;
    }

    let imageUrl: string | null = null;
    if (mapped.imageUrl && String(mapped.imageUrl).startsWith("http")) {
      imageUrl = await downloadImage(String(mapped.imageUrl));
    }

    const existing = db.prepare(`SELECT id FROM perfumes WHERE id = ?`).get(id);

    const fields = {
      internal_code: mapped.internalCode || null,
      name,
      brand,
      gender: mapped.gender || "Unisex",
      family: mapped.family || "Amaderada",
      type: mapped.type || "EDP",
      size: String(mapped.size || "100ml"),
      description: mapped.description || "",
      price: Number(mapped.price) || 0,
      old_price: mapped.oldPrice ? Number(mapped.oldPrice) : null,
      cost: mapped.cost ? Number(mapped.cost) : null,
      stock: Number(mapped.stock) || 0,
      min_stock: Number(mapped.minStock) || 3,
      notes_salida: JSON.stringify(splitNotes(mapped.notasSalida)),
      notes_corazon: JSON.stringify(splitNotes(mapped.notasCorazon)),
      notes_fondo: JSON.stringify(splitNotes(mapped.notasFondo)),
      intensidad: Number(mapped.intensidad) || 3,
      duracion: mapped.duracion || "",
      visible: mapped.visible === false || mapped.visible === "no" ? 0 : 1,
      destacado: mapped.destacado ? 1 : 0,
      oferta: mapped.oferta ? 1 : 0,
      nuevo: mapped.nuevo ? 1 : 0,
      mas_vendido: mapped.masVendido ? 1 : 0,
    };

    try {
      if (existing) {
        db.prepare(
          `UPDATE perfumes SET internal_code=?, name=?, brand=?, gender=?, family=?, type=?, size=?, description=?,
            price=?, old_price=?, cost=?, stock=?, min_stock=?, notes_salida=?, notes_corazon=?, notes_fondo=?,
            intensidad=?, duracion=?, visible=?, destacado=?, oferta=?, nuevo=?, mas_vendido=?, updated_at=datetime('now')
          WHERE id=?`
        ).run(
          fields.internal_code, fields.name, fields.brand, fields.gender, fields.family, fields.type, fields.size, fields.description,
          fields.price, fields.old_price, fields.cost, fields.stock, fields.min_stock,
          fields.notes_salida, fields.notes_corazon, fields.notes_fondo, fields.intensidad, fields.duracion,
          fields.visible, fields.destacado, fields.oferta, fields.nuevo, fields.mas_vendido,
          id
        );
        updated++;
      } else {
        db.prepare(
          `INSERT INTO perfumes (id, internal_code, name, brand, gender, family, type, size, description,
            price, old_price, cost, stock, min_stock, notes_salida, notes_corazon, notes_fondo,
            intensidad, duracion, visible, destacado, oferta, nuevo, mas_vendido)
          VALUES (?,?,?,?,?,?,?,?,?, ?,?,?,?,?, ?,?,?, ?,?,?,?,?,?,?)`
        ).run(
          id, fields.internal_code, fields.name, fields.brand, fields.gender, fields.family, fields.type, fields.size, fields.description,
          fields.price, fields.old_price, fields.cost, fields.stock, fields.min_stock,
          fields.notes_salida, fields.notes_corazon, fields.notes_fondo,
          fields.intensidad, fields.duracion, fields.visible, fields.destacado, fields.oferta, fields.nuevo, fields.mas_vendido
        );
        created++;
      }

      if (imageUrl) {
        db.prepare(`DELETE FROM images WHERE perfume_id = ?`).run(id);
        db.prepare(`INSERT INTO images (id, perfume_id, url, "order", is_main) VALUES (?, ?, ?, 0, 1)`).run(randomUUID(), id, imageUrl);
      }
    } catch (err: any) {
      errors.push(`Fila ${i + 2} (${id}): ${err.message}`);
    }
  }

  db.prepare(
    `INSERT INTO import_batches (id, file_name, created_count, updated_count, error_count, errors) VALUES (?,?,?,?,?,?)`
  ).run(randomUUID(), fileName || "importacion.xlsx", created, updated, errors.length, JSON.stringify(errors));

  res.json({ created, updated, errors });
});

// GET /api/import/history
router.get("/history", requireAuth, (_req, res) => {
  const rows = db.prepare(`SELECT * FROM import_batches ORDER BY created_at DESC LIMIT 30`).all() as any[];
  res.json(
    rows.map((r) => ({
      id: r.id,
      fileName: r.file_name,
      created: r.created_count,
      updated: r.updated_count,
      errors: JSON.parse(r.errors || "[]"),
      createdAt: r.created_at,
    }))
  );
});

// GET /api/import/export -> exporta todo el catálogo a XLSX
router.get("/export", requireAuth, (_req, res) => {
  const rows = db.prepare(`SELECT * FROM perfumes ORDER BY created_at DESC`).all() as any[];
  const data = rows.map((r) => ({
    SKU: r.id,
    "Código interno": r.internal_code || "",
    Nombre: r.name,
    Marca: r.brand,
    Género: r.gender,
    "Familia olfativa": r.family,
    Tipo: r.type,
    Tamaño: r.size,
    Precio: r.price,
    "Precio oferta": r.old_price || "",
    Costo: r.cost || "",
    Stock: r.stock,
    "Stock mínimo": r.min_stock,
    "Notas salida": JSON.parse(r.notes_salida || "[]").join(", "),
    "Notas corazón": JSON.parse(r.notes_corazon || "[]").join(", "),
    "Notas fondo": JSON.parse(r.notes_fondo || "[]").join(", "),
    Intensidad: r.intensidad,
    Duración: r.duracion,
    Visible: r.visible ? "si" : "no",
    Destacado: r.destacado ? "si" : "no",
    Oferta: r.oferta ? "si" : "no",
    Nuevo: r.nuevo ? "si" : "no",
    "Más vendido": r.mas_vendido ? "si" : "no",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Perfumes");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Disposition", 'attachment; filename="catalogo-perfumes.xlsx"');
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
});

export default router;
