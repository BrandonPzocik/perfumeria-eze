import type { CartLine, Perfume, PerfumeVariant, StoreSettings } from "../types";
import { lineDisplayName, lineUnitPrice } from "./product";

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
    .map(({ line, product }) => `  • *${lineDisplayName(line, product)}* × ${line.qty}`)
    .join("\n");
  const total = items.reduce((sum, { line, product }) => sum + lineUnitPrice(line, product) * line.qty, 0);

  return [
    "*NUEVO PEDIDO*",
    "━━━━━━━━━━━━━━━━",
    "",
    "Hola! Quiero realizar el siguiente pedido 👇",
    "",
    "* Productos:*",
    body,
    "",
    `*Total:* ${formatCurrency(total, currency)}`,
    "",
    "* Datos de envío:*",
    `*Nombre:* ${customerName}`,
    `*Ciudad:* ${customerAddress}`,
    "",
    "¡Gracias! Quedo atento a tu respuesta. ",
  ].join("\n");
}

export function buildWhatsAppSingleProductMessage(
  product: Perfume,
  currency = "ARS",
  variant?: PerfumeVariant
): string {
  const sizeLabel = variant ? `Decant ${variant.size}` : product.size;
  const price = variant?.price ?? product.price;
  return [
    "*CONSULTA DE PERFUME*",
    "━━━━━━━━━━━━━━━━",
    "",
    "Hola! Quiero consultar por:",
    "",
    `*${product.name}*`,
    `_${product.brand} · ${product.type} · ${sizeLabel}_`,
    `*Precio:* ${formatCurrency(price, currency)}`,
    "",
    "¡Gracias!",
  ].join("\n");
}

export function buildWhatsAppLink(message: string, number: string): string {
  return `https://wa.me/${digits(number)}?text=${encodeURIComponent(message)}`;
}

function digits(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

type WhatsAppSettings = Pick<StoreSettings, "whatsappNumber" | "whatsappNumberFemenino" | "whatsappNumberMasculino">;

export function resolveWhatsAppNumber(gender: string | undefined, settings: WhatsAppSettings): string {
  const general = digits(settings.whatsappNumber);
  const femenino = digits(settings.whatsappNumberFemenino);
  const masculino = digits(settings.whatsappNumberMasculino);
  if (gender === "Femenino") return femenino || general;
  if (gender === "Masculino") return masculino || general;
  return general;
}

export function resolveWhatsAppNumberForCart(products: Perfume[], settings: WhatsAppSettings): string {
  if (products.length === 0) return resolveWhatsAppNumber(undefined, settings);
  const first = resolveWhatsAppNumber(products[0].gender, settings);
  const sameDestination = products.every((p) => resolveWhatsAppNumber(p.gender, settings) === first);
  return sameDestination ? first : resolveWhatsAppNumber("Unisex", settings);
}
