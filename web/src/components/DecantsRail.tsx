import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import { hasDecants } from "../lib/product";

export default function DecantsRail() {
  const navigate = useNavigate();
  const items = usePerfumesStore((s) => s.items);
  const decants = items.filter(hasDecants);

  if (decants.length === 0) return null;

  return (
    <section id="decants-home" className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-[100px]">
      <div className="flex justify-between items-end mb-5 sm:mb-8">
        <div>
          <span className="eyebrow">Probá sin comprometerte</span>
          <h2 className="font-display font-bold uppercase tracking-wide text-[clamp(26px,4vw,34px)] mt-1.5">Decants</h2>
          <p className="text-[13px] text-ink-soft mt-1.5">2ml · 5ml · 10ml. Tocá el tamaño para sumarlo al carrito.</p>
        </div>
        <button
          onClick={() => navigate("/decants")}
          className="text-[13px] font-semibold flex items-center gap-1 text-wine hover:gap-2 transition-all flex-shrink-0"
        >
          Ver todos <ChevronRight size={15} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-3 sm:gap-x-6 gap-y-6 sm:gap-y-8">
        {decants.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} decantMode />
        ))}
      </div>
    </section>
  );
}
