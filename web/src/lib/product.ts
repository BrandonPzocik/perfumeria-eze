import type { CartLine, Perfume, PerfumeVariant } from "../types";

export const DECANT_SIZES = ["2ml", "5ml", "10ml"] as const;
export type DecantSize = (typeof DECANT_SIZES)[number];

export function hasDecants(product: Perfume | undefined | null): boolean {
  return Boolean(product?.variants?.some((v) => Number(v.price) > 0));
}

export function cartLineKey(id: string, variantId?: string): string {
  return `${id}::${variantId || ""}`;
}

export function lineKey(line: Pick<CartLine, "id" | "variantId">): string {
  return cartLineKey(line.id, line.variantId);
}

export function displayPrice(product: Perfume): number {
  return product.price;
}

export function totalStock(product: Perfume): number {
  return product.stock;
}

export function defaultVariant(product: Perfume | undefined): PerfumeVariant | undefined {
  if (!product?.variants?.length) return undefined;
  return product.variants.find((v) => v.stock > 0 && v.price > 0) || product.variants[0];
}

export function lineUnitPrice(line: CartLine, product: Perfume): number {
  if (line.variantId && product.variants?.length) {
    const variant = product.variants.find((v) => v.id === line.variantId);
    if (variant) return variant.price;
  }
  if (line.size && product.variants?.length) {
    const variant = product.variants.find((v) => v.size === line.size);
    if (variant) return variant.price;
  }
  return product.price;
}

export function lineDisplayName(line: CartLine, product: Perfume): string {
  if (line.size) return `${product.name} · Decant ${line.size}`;
  return product.name;
}

export function ownImageUrl(product: Perfume | undefined | null): string | undefined {
  return product?.images?.find((i) => i.isMain)?.url || product?.images?.[0]?.url;
}

export function perfumeImageUrl(product: Perfume, _catalog: Perfume[] = []): string | undefined {
  return ownImageUrl(product);
}

export function productPath(product: Perfume, _catalog: Perfume[] = []): string {
  return `/producto/${product.id}`;
}
