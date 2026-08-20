import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { usePerfumesStore } from "../hooks/usePerfumesStore";

export default function FeaturedRail({ onSeeAll }: { onSeeAll: () => void }) {
  const items = usePerfumesStore((s) => s.items);
  const destacados = items.filter((p) => p.tags.includes("destacado")).slice(0, 6);

  if (destacados.length === 0) return null;

  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-14 sm:pt-[70px] pb-4">
      <div className="flex justify-between items-end mb-6 sm:mb-8">
        <div>
          <span className="eyebrow">Selección de la casa</span>
          <h2 className="font-display font-bold uppercase tracking-wide text-[clamp(26px,4vw,34px)] mt-1.5">Destacados</h2>
        </div>
        <button
          onClick={onSeeAll}
          className="text-[13px] font-semibold flex items-center gap-1 text-wine hover:gap-2 transition-all"
        >
          Ver todos <ChevronRight size={15} />
        </button>
      </div>
      <div className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {destacados.map((p) => (
          <div key={p.id} className="w-[200px] sm:w-[250px] flex-shrink-0 snap-start">
            <ProductCard product={p} large />
          </div>
        ))}
      </div>
    </section>
  );
}
