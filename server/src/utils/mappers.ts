import { db } from "../db";
import { listVariants } from "../db/variants";

export function rowToPerfume(row: any, opts: { privateFields?: boolean } = {}) {
  const images = db
    .prepare(`SELECT id, url, "order", is_main as isMain FROM images WHERE perfume_id = ? ORDER BY "order" ASC`)
    .all(row.id) as any[];

  const tags: string[] = [];
  if (row.nuevo) tags.push("nuevo");
  if (row.oferta) tags.push("oferta");
  if (row.destacado) tags.push("destacado");
  if (row.mas_vendido) tags.push("mas-vendido");

  const perfume: Record<string, unknown> = {
    id: row.id,
    name: row.name,
    brand: row.brand,
    gender: row.gender,
    family: row.family,
    type: row.type,
    size: row.size,
    description: row.description || "",

    price: row.price,
    oldPrice: row.old_price ?? undefined,

    stock: row.stock,

    notas: {
      salida: JSON.parse(row.notes_salida || "[]"),
      corazon: JSON.parse(row.notes_corazon || "[]"),
      fondo: JSON.parse(row.notes_fondo || "[]"),
    },
    intensidad: row.intensidad,
    duracion: row.duracion,

    visible: !!row.visible,
    destacado: !!row.destacado,
    oferta: !!row.oferta,
    nuevo: !!row.nuevo,
    masVendido: !!row.mas_vendido,
    tags,

    images: images.map((i) => ({ id: i.id, url: i.url, isMain: !!i.isMain })),
    kind: row.kind || "bottle",
    variants: listVariants(row.id).map((v) => ({
      id: v.id,
      size: v.size,
      price: v.price,
      stock: v.stock,
    })),
  };

  if (opts.privateFields) {
    perfume.internalCode = row.internal_code || "";
    perfume.cost = row.cost ?? undefined;
    perfume.minStock = row.min_stock;
    perfume.views = row.views;
    perfume.cartAdds = row.cart_adds;
    perfume.whatsappClicks = row.whatsapp_clicks;
    perfume.shares = row.shares;
    perfume.createdAt = row.created_at;
    perfume.updatedAt = row.updated_at;
  }

  return perfume;
}

export function rowToSettings(row: any) {
  return {
    whatsappNumber: row.whatsapp_number,
    whatsappNumberFemenino: row.whatsapp_number_femenino || "",
    whatsappNumberMasculino: row.whatsapp_number_masculino || "",
    whatsappMessage: row.whatsapp_message,
    storeName: row.store_name,
    storeNameAccent: row.store_name_accent,
    logoUrl: row.logo_url || null,
    bannerUrl: row.banner_url || null,
    primaryColor: row.primary_color,
    accentColor: row.accent_color,
    instagramUrl: row.instagram_url || null,
    instagramUrlFemenino: row.instagram_url_femenino || "",
    facebookUrl: row.facebook_url || null,
    schedule: row.schedule,
    currency: row.currency,
    showCurrency: !!row.show_currency,
    darkModeDefault: !!row.dark_mode_default,
  };
}
