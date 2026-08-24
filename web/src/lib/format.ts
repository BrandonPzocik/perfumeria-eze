import type { CartLine, Perfume } from "../types";

export function formatCurrency(value: number, currency = "ARS"): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

export function buildWhatsAppOrderMessage(
  lines: CartLine[],
  products: Perfume[],
  currency = "ARS",
  _intro = "Hola! Quiero realizar el siguiente pedido:",
  customerName = "",
  customerAddress = ""
): string {
  const items = lines
    .map((l) => ({ line: l, product: products.find((p) => p.id === l.id) }))
    .filter((x): x is { line: CartLine; product: Perfume } => Boolean(x.product));

  const body = items
    .map(({ line, product }) => `  • *${product.name}* × ${line.qty}`)
    .join("\n");
  const total = items.reduce((sum, { line, product }) => sum + product.price * line.qty, 0);

  return [
    "🛍️ *NUEVO PEDIDO*",
    "━━━━━━━━━━━━━━━━",
    "",
    "Hola! Quiero realizar el siguiente pedido 👇",
    "",
    "*📦 Productos:*",
    body,
    "",
    `*💰 Total:* ${formatCurrency(total, currency)}`,
    "",
    "*📋 Datos de envío:*",
    `👤 *Nombre:* ${customerName}`,
    `📍 *Dirección:* ${customerAddress}`,
    "",
    "¡Gracias! Quedo atento/a a tu respuesta. 🙌",
  ].join("\n");
}

export function buildWhatsAppSingleProductMessage(product: Perfume, currency = "ARS"): string {
  return [
    "🔍 *CONSULTA DE PERFUME*",
    "━━━━━━━━━━━━━━━━",
    "",
    "Hola! Quiero consultar por:",
    "",
    `*${product.name}*`,
    `_${product.brand} · ${product.type} · ${product.size}_`,
    `*Precio:* ${formatCurrency(product.price, currency)}`,
    "",
    "*📋 Mis datos:*",
    "👤 *Nombre:*",
    "📍 *Dirección:*",
    "",
    "¡Gracias! 🙌",
  ].join("\n");
}

export function buildWhatsAppLink(message: string, number: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
