import { randomUUID } from "crypto";
import { db } from "../db";
import { hashPassword } from "../utils/auth";

const SAMPLE_PERFUMES = [
  { id: "SKU-001", name: "Nuit de Santal", brand: "Noir & Cie", gender: "Unisex", family: "Amaderada", type: "EDP", size: "100ml", price: 128000, oldPrice: 152000, stock: 14, tags: { oferta: 1, destacado: 1 }, notas: { salida: ["Bergamota", "Pimienta rosa"], corazon: ["Sándalo", "Iris"], fondo: ["Ámbar", "Almizcle"] }, intensidad: 4, duracion: "8-10h" },
  { id: "SKU-002", name: "Fleur Rare", brand: "Villeret", gender: "Femenino", family: "Floral", type: "EDP", size: "90ml", price: 145000, stock: 20, tags: { nuevo: 1, destacado: 1 }, notas: { salida: ["Pera", "Neroli"], corazon: ["Jazmín", "Peonía"], fondo: ["Almizcle blanco", "Madera de cachemira"] }, intensidad: 3, duracion: "6-8h" },
  { id: "SKU-003", name: "Citrus Privé", brand: "Rive Rare", gender: "Masculino", family: "Cítrica", type: "EDT", size: "100ml", price: 92000, stock: 20, tags: { masVendido: 1 }, notas: { salida: ["Limón de Sicilia", "Mandarina"], corazon: ["Té verde", "Romero"], fondo: ["Vetiver", "Cedro"] }, intensidad: 2, duracion: "4-6h" },
  { id: "SKU-004", name: "Oud Impérial", brand: "Casa Ámbar", gender: "Unisex", family: "Oriental", type: "Parfum", size: "75ml", price: 210000, stock: 3, tags: { destacado: 1 }, notas: { salida: ["Azafrán", "Cardamomo"], corazon: ["Rosa turca", "Oud"], fondo: ["Cuero", "Vainilla"] }, intensidad: 5, duracion: "10-12h" },
  { id: "SKU-005", name: "Onde Marine", brand: "Osmé", gender: "Masculino", family: "Acuática", type: "EDT", size: "100ml", price: 84000, oldPrice: 98000, stock: 20, tags: { masVendido: 1, oferta: 1 }, notas: { salida: ["Sal marina", "Toronja"], corazon: ["Salvia", "Geranio"], fondo: ["Ambroxan", "Almizcle"] }, intensidad: 2, duracion: "5-7h" },
  { id: "SKU-006", name: "Épices d'Automne", brand: "Marbella Parfums", gender: "Unisex", family: "Especiada", type: "EDP", size: "100ml", price: 132000, stock: 20, tags: { nuevo: 1 }, notas: { salida: ["Canela", "Naranja sanguina"], corazon: ["Clavo de olor", "Nuez moscada"], fondo: ["Haba tonka", "Benjuí"] }, intensidad: 4, duracion: "7-9h" },
  { id: "SKU-007", name: "Iris Silencieux", brand: "Villeret", gender: "Femenino", family: "Floral", type: "Parfum", size: "50ml", price: 168000, stock: 0, tags: { destacado: 1 }, notas: { salida: ["Violeta"], corazon: ["Iris pallida", "Ylang ylang"], fondo: ["Sándalo", "Cachemira"] }, intensidad: 3, duracion: "8-10h" },
  { id: "SKU-008", name: "Cèdre Sauvage", brand: "Noir & Cie", gender: "Masculino", family: "Amaderada", type: "EDT", size: "100ml", price: 96000, stock: 20, tags: {}, notas: { salida: ["Enebro", "Pomelo"], corazon: ["Lavanda", "Salvia"], fondo: ["Cedro de Virginia", "Musgo de roble"] }, intensidad: 3, duracion: "6-8h" },
  { id: "SKU-009", name: "Ambre Doré", brand: "Casa Ámbar", gender: "Unisex", family: "Oriental", type: "EDP", size: "100ml", price: 118000, stock: 20, tags: { masVendido: 1 }, notas: { salida: ["Mandarina", "Cardamomo"], corazon: ["Canela", "Flor de ámbar"], fondo: ["Ámbar gris", "Vainilla de Madagascar"] }, intensidad: 4, duracion: "8-10h" },
  { id: "SKU-010", name: "Néroli Solaire", brand: "Rive Rare", gender: "Femenino", family: "Cítrica", type: "EDT", size: "90ml", price: 88000, oldPrice: 101000, stock: 20, tags: { nuevo: 1, oferta: 1 }, notas: { salida: ["Bergamota", "Neroli"], corazon: ["Flor de azahar", "Jazmín"], fondo: ["Almizcle", "Madera blanca"] }, intensidad: 2, duracion: "4-6h" },
  { id: "SKU-011", name: "Vétiver Brut", brand: "Osmé", gender: "Masculino", family: "Amaderada", type: "EDP", size: "100ml", price: 134000, stock: 6, tags: { destacado: 1 }, notas: { salida: ["Pimienta negra", "Pomelo"], corazon: ["Vetiver de Haití", "Salvia"], fondo: ["Pachulí", "Cedro"] }, intensidad: 4, duracion: "8-10h" },
  { id: "SKU-012", name: "Rose Nocturne", brand: "Marbella Parfums", gender: "Femenino", family: "Especiada", type: "Parfum", size: "75ml", price: 176000, stock: 20, tags: { masVendido: 1, destacado: 1 }, notas: { salida: ["Pimienta rosa"], corazon: ["Rosa de Damasco", "Clavo"], fondo: ["Pachulí", "Ámbar"] }, intensidad: 5, duracion: "10-12h" },
];

export function seed() {
  const isProd = process.env.NODE_ENV === "production";
  const adminCount = (db.prepare(`SELECT COUNT(*) as c FROM admin_users`).get() as any).c;
  if (adminCount === 0) {
    const email = (process.env.ADMIN_EMAIL || (isProd ? "" : "admin@maisonambar.com")).toLowerCase();
    const password = process.env.ADMIN_PASSWORD || (isProd ? "" : "admin1234");
    if (!email || !password) {
      throw new Error("Definí ADMIN_EMAIL y ADMIN_PASSWORD en las variables de entorno antes del primer arranque.");
    }
    db.prepare(`INSERT INTO admin_users (id, email, password_hash, name) VALUES (?,?,?,?)`).run(
      randomUUID(),
      email,
      hashPassword(password),
      "Administrador"
    );
    console.log(isProd ? `✔ Usuario admin creado -> ${email}` : `✔ Usuario admin creado -> ${email} / ${password}`);
  }

  const perfumeCount = (db.prepare(`SELECT COUNT(*) as c FROM perfumes`).get() as any).c;
  if (perfumeCount === 0 && !isProd) {
    const insert = db.prepare(
      `INSERT INTO perfumes (
        id, name, brand, gender, family, type, size, price, old_price, stock,
        notes_salida, notes_corazon, notes_fondo, intensidad, duracion,
        visible, destacado, oferta, nuevo, mas_vendido
      ) VALUES (?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?)`
    );
    for (const p of SAMPLE_PERFUMES) {
      insert.run(
        p.id, p.name, p.brand, p.gender, p.family, p.type, p.size, p.price, (p as any).oldPrice || null, p.stock,
        JSON.stringify(p.notas.salida), JSON.stringify(p.notas.corazon), JSON.stringify(p.notas.fondo), p.intensidad, p.duracion,
        1, (p.tags as any).destacado || 0, (p.tags as any).oferta || 0, (p.tags as any).nuevo || 0, (p.tags as any).masVendido || 0
      );
    }
    console.log(`✔ Catálogo de ejemplo cargado (${SAMPLE_PERFUMES.length} perfumes)`);
  }
}
