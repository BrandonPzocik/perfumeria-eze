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
  intro = "Hola! Quiero realizar el siguiente pedido:",
  customerName = "",
  customerAddress = ""
): string {
  const items = lines
    .map((l) => ({ line: l, product: products.find((p) => p.id === l.id) }))
    .filter((x): x is { line: CartLine; product: Perfume } => Boolean(x.product));

  const body = items.map(({ line, product }) => `• ${product.name} x${line.qty}`).join("\n");
  const total = items.reduce((sum, { line, product }) => sum + product.price * line.qty, 0);

  return [
    intro,
    "",
    body,
    "",
    `Total: ${formatCurrency(total, currency)}`,
    "",
    `Nombre: ${customerName}`,
    `Dirección: ${customerAddress}`,
    "",
    "Gracias.",
  ].join("\n");
}

export function buildWhatsAppLink(message: string, number: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
