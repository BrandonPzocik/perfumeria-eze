import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { usePerfumesStore } from "../hooks/usePerfumesStore";

export default function FeaturedRail({ onSeeAll }: { onSeeAll: () => void }) {
  const items = usePerfumesStore((s) => s.items);
  const destacados = items.filter((p) => p.tags.includes("destacado")).slice(0, 8);
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  const updateIndex = () => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-featured-card]");
    const step = card ? card.offsetWidth + 20 : 220;
    setIndex(Math.round(el.scrollLeft / step));
  };

  const scrollByCards = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-featured-card]");
    const step = card ? card.offsetWidth + 20 : 220;
    const max = el.scrollWidth - el.clientWidth;
    let next = el.scrollLeft + dir * step;
    if (next > max - 8) next = 0;
    if (next < 0) next = max;
    el.scrollTo({ left: next, behavior: "smooth" });
  };

  useEffect(() => {
    if (destacados.length < 2) return;
    const el = scroller.current;
    const peek = window.setTimeout(() => {
      el?.scrollTo({ left: 48, behavior: "smooth" });
      window.setTimeout(() => el?.scrollTo({ left: 0, behavior: "smooth" }), 750);
    }, 700);
    const id = window.setInterval(() => {
      if (paused.current) return;
      scrollByCards(1);
    }, 3800);
    return () => {
      window.clearTimeout(peek);
      window.clearInterval(id);
    };
  }, [destacados.length]);

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

      <div
        className="relative"
        onPointerEnter={() => { paused.current = true; }}
        onPointerLeave={() => { paused.current = false; }}
        onPointerDown={() => { paused.current = true; }}
        onPointerUp={() => { paused.current = false; }}
      >
        {destacados.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => scrollByCards(-1)}
              className="hidden sm:flex absolute left-0 top-[38%] -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-stone-soft border border-line shadow-card items-center justify-center text-ink hover:bg-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={() => scrollByCards(1)}
              className="hidden sm:flex absolute right-0 top-[38%] -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 rounded-full bg-stone-soft border border-line shadow-card items-center justify-center text-ink hover:bg-white"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        <div
          ref={scroller}
          onScroll={updateIndex}
          className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory"
        >
          {destacados.map((p, i) => (
            <div
              key={p.id}
              data-featured-card
              className="w-[200px] sm:w-[250px] flex-shrink-0 snap-start"
              style={{ animation: i === 0 ? "none" : undefined }}
            >
              <ProductCard product={p} large />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-stone to-transparent" />
      </div>

      {destacados.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-1">
          {destacados.map((p, i) => (
            <span
              key={p.id}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-primary" : "w-1.5 bg-line"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
