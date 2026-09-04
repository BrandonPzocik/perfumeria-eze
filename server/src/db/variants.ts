import { randomUUID } from "crypto";
import { db } from "./index";

export interface VariantInput {
  id?: string;
  size: string;
  price: number;
  stock?: number;
}

export function listVariants(perfumeId: string) {
  return db
    .prepare(`SELECT id, size, price, stock, "order" FROM variants WHERE perfume_id = ? ORDER BY "order" ASC`)
    .all(perfumeId) as { id: string; size: string; price: number; stock: number; order: number }[];
}

export function upsertVariants(perfumeId: string, variants: VariantInput[] | undefined) {
  if (!variants) return;
  db.prepare(`DELETE FROM variants WHERE perfume_id = ?`).run(perfumeId);
  variants.forEach((v, index) => {
    const size = String(v.size || "").trim();
    if (!size || !(Number(v.price) > 0)) return;
    db.prepare(`INSERT INTO variants (id, perfume_id, size, price, stock, "order") VALUES (?, ?, ?, ?, ?, ?)`).run(
      v.id || randomUUID(),
      perfumeId,
      size,
      Number(v.price) || 0,
      Number(v.stock) || 0,
      index
    );
  });
}
