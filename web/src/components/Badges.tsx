import type { Tag } from "../types";

export function StockTag({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md bg-line-soft text-ink-soft">
        Agotado
      </span>
    );
  if (stock <= 5)
    return (
      <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md bg-accent/20 text-ink">
        Poco stock
      </span>
    );
  return null;
}

const TAG_MAP: Record<Tag, { label: string; className: string }> = {
  nuevo: { label: "Nuevo", className: "bg-bottle text-stone-soft" },
  oferta: { label: "Oferta", className: "bg-primary text-stone-soft" },
  destacado: { label: "Destacado", className: "bg-accent text-stone-soft" },
  "mas-vendido": { label: "Más vendido", className: "bg-ink text-stone-soft" },
};

export function TagBadge({ tag }: { tag: Tag }) {
  const t = TAG_MAP[tag];
  if (!t) return null;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md ${t.className}`}>
      {t.label}
    </span>
  );
}
