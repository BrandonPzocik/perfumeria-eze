import { randomUUID } from "crypto";
import { db } from "./index";
import { listVariants, upsertVariants } from "./variants";

const DECANT_CATALOG: {
  name: string;
  prices: { "2ml": number; "5ml": number; "10ml": number };
}[] = [
  { name: "Khamrah Qahwa", prices: { "2ml": 5000, "5ml": 8000, "10ml": 16000 } },
  { name: "Khamrah", prices: { "2ml": 5000, "5ml": 8000, "10ml": 16000 } },
  { name: "Shaheen Gold", prices: { "2ml": 5000, "5ml": 7000, "10ml": 15000 } },
  { name: "Honor y Glory", prices: { "2ml": 4000, "5ml": 6500, "10ml": 14000 } },
  { name: "Fakhar Men", prices: { "2ml": 4000, "5ml": 7000, "10ml": 16000 } },
  { name: "9 PM", prices: { "2ml": 4000, "5ml": 9000, "10ml": 17000 } },
  { name: "Toscano Leather", prices: { "2ml": 5000, "5ml": 6000, "10ml": 13000 } },
  { name: "Mandarin Sky", prices: { "2ml": 5000, "5ml": 8000, "10ml": 16000 } },
  { name: "Amber Oud Gold Edition", prices: { "2ml": 6000, "5ml": 10000, "10ml": 19000 } },
  { name: "Club De Nuit Iconic", prices: { "2ml": 5000, "5ml": 9500, "10ml": 19000 } },
  { name: "Radio Vintage", prices: { "2ml": 4000, "5ml": 8000, "10ml": 16000 } },
  { name: "Liquid Brun", prices: { "2ml": 5000, "5ml": 9500, "10ml": 19000 } },
  { name: "Phantom My Hero", prices: { "2ml": 5000, "5ml": 7000, "10ml": 16000 } },
  { name: "His Confession", prices: { "2ml": 5000, "5ml": 9000, "10ml": 17000 } },
  { name: "Maahir Legacy", prices: { "2ml": 4000, "5ml": 7500, "10ml": 15000 } },
  { name: "Viking Dubai", prices: { "2ml": 6000, "5ml": 10000, "10ml": 19000 } },
  { name: "Hayaati Al Maleky", prices: { "2ml": 4000, "5ml": 7000, "10ml": 13000 } },
  { name: "Rave Now", prices: { "2ml": 4000, "5ml": 7000, "10ml": 13000 } },
  { name: "Aether", prices: { "2ml": 5000, "5ml": 9000, "10ml": 18000 } },
  { name: "Atlas", prices: { "2ml": 6000, "5ml": 13000, "10ml": 22000 } },
  { name: "Sehr", prices: { "2ml": 5000, "5ml": 9000, "10ml": 18000 } },
  { name: "Hawas Malibu", prices: { "2ml": 5000, "5ml": 10000, "10ml": 19000 } },
  { name: "Hawas Ice", prices: { "2ml": 5000, "5ml": 10000, "10ml": 19000 } },
  { name: "Vulcan Feu", prices: { "2ml": 4000, "5ml": 9000, "10ml": 18000 } },
  { name: "Scandal Absolu", prices: { "2ml": 9000, "5ml": 17000, "10ml": 29000 } },
  { name: "Le Male Le Parfum", prices: { "2ml": 9000, "5ml": 17000, "10ml": 29000 } },
  { name: "Boos Insense Night", prices: { "2ml": 4000, "5ml": 8000, "10ml": 15000 } },
  { name: "K", prices: { "2ml": 9000, "5ml": 17000, "10ml": 28000 } },
];

function normalizeName(name: string) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function namesMatch(a: string, b: string) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const shorter = na.length < nb.length ? na : nb;
  const longer = na.length < nb.length ? nb : na;
  if (shorter.split(" ").filter(Boolean).length < 2) return false;
  return longer.includes(shorter);
}

async function attachDecants(perfumeId: string, prices: { "2ml": number; "5ml": number; "10ml": number }) {
  await upsertVariants(perfumeId, [
    { id: randomUUID(), size: "2ml", price: prices["2ml"], stock: 20 },
    { id: randomUUID(), size: "5ml", price: prices["5ml"], stock: 20 },
    { id: randomUUID(), size: "10ml", price: prices["10ml"], stock: 20 },
  ]);
}

async function mergeStandaloneDecants() {
  const decants = (await db.prepare(`SELECT id, name FROM perfumes WHERE kind = 'decant'`).all()) as { id: string; name: string }[];
  if (decants.length === 0) return 0;

  const bottles = (await db.prepare(`SELECT id, name FROM perfumes WHERE kind != 'decant'`).all()) as { id: string; name: string }[];
  let merged = 0;

  for (const d of decants) {
    const match = bottles.find((b) => namesMatch(b.name, d.name));
    const variants = await listVariants(d.id);
    if (match && variants.length && (await listVariants(match.id)).length === 0) {
      await upsertVariants(
        match.id,
        variants.map((v) => ({ size: v.size, price: v.price, stock: v.stock }))
      );
      merged += 1;
    }
    await db.prepare(`DELETE FROM perfumes WHERE id = ?`).run(d.id);
  }
  return merged;
}

async function removeLeftoverDecantSkus() {
  const leftovers = (await db.prepare(`SELECT id FROM perfumes WHERE id LIKE 'DEC-%'`).all()) as { id: string }[];
  if (leftovers.length === 0) return 0;
  for (const row of leftovers) {
    await db.prepare(`DELETE FROM perfumes WHERE id = ?`).run(row.id);
  }
  return leftovers.length;
}

export async function seedDecants() {
  const hadStandalone =
    Number(((await db.prepare(`SELECT COUNT(*) as c FROM perfumes WHERE kind = 'decant'`).get()) as { c: number })?.c || 0) > 0 ||
    Number(((await db.prepare(`SELECT COUNT(*) as c FROM perfumes WHERE id LIKE 'DEC-%'`).get()) as { c: number })?.c || 0) > 0;
  const variantCount = Number(((await db.prepare(`SELECT COUNT(*) as c FROM variants`).get()) as { c: number })?.c || 0);

  const merged = await mergeStandaloneDecants();
  const removed = await removeLeftoverDecantSkus();
  if (merged > 0) {
    console.log(`✔ Decants unificados en la ficha del perfume (${merged} fichas)`);
  }
  if (removed > 0) {
    console.log(`✔ Fichas sueltas de decant eliminadas (${removed})`);
  }

  await db.prepare(`UPDATE perfumes SET kind = 'bottle' WHERE kind != 'bottle'`).run();

  if (!hadStandalone && variantCount > 0) return;

  const bottles = (await db.prepare(`SELECT id, name FROM perfumes`).all()) as { id: string; name: string }[];
  let attached = 0;
  for (const p of DECANT_CATALOG) {
    const match = bottles.find((b) => namesMatch(b.name, p.name));
    if (!match) continue;
    if ((await listVariants(match.id)).length > 0) continue;
    await attachDecants(match.id, p.prices);
    attached += 1;
  }
  if (attached > 0) {
    console.log(`✔ Precios de decant cargados en ${attached} perfumes`);
  }
}
