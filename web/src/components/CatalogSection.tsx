import { useEffect, useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import ProductCard from "./ProductCard";
import Filters from "./Filters";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import type { QuickFilter } from "./Layout";

interface CatalogSectionProps {
  query: string;
  quickFilter: QuickFilter | null;
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-[3/4] rounded-card bg-line-soft" />
      <div className="h-2.5 w-1/2 bg-line-soft rounded" />
      <div className="h-4 w-3/4 bg-line-soft rounded" />
      <div className="h-3 w-1/3 bg-line-soft rounded" />
    </div>
  );
}

export default function CatalogSection({ query, quickFilter }: CatalogSectionProps) {
  const { items, loading, error, loaded, fetchAll } = usePerfumesStore();
  const [activeFamily, setActiveFamily] = useState("Todas");
  const [activeGender, setActiveGender] = useState("Todos");
  const [activeTag, setActiveTag] = useState<string>("Todos");
  const [activeBrand, setActiveBrand] = useState("Todas");

  useEffect(() => {
    if (!loaded) fetchAll();
  }, [loaded, fetchAll]);

  useEffect(() => {
    if (quickFilter) setActiveTag(quickFilter.tag);
  }, [quickFilter]);

  const brands = useMemo(() => Array.from(new Set(items.map((p) => p.brand))).sort(), [items]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (query && !`${p.name} ${p.brand} ${p.family} ${p.id}`.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      if (activeFamily !== "Todas" && p.family !== activeFamily) return false;
      if (activeGender !== "Todos" && p.gender !== activeGender && p.gender !== "Unisex") return false;
      if (activeBrand !== "Todas" && p.brand !== activeBrand) return false;
      if (activeTag !== "Todos" && !p.tags.includes(activeTag as any)) return false;
      return true;
    });
  }, [items, query, activeFamily, activeGender, activeBrand, activeTag]);

  return (
    <section id="catalogo" className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-12 sm:pt-[70px] pb-16 sm:pb-[100px] scroll-mt-[64px] sm:scroll-mt-[72px]">
      <div className="mb-6 sm:mb-8">
        <span className="eyebrow">Todo el catálogo</span>
        <h2 className="font-display font-bold uppercase tracking-wide text-[clamp(28px,4vw,36px)] mt-1.5">Perfumes</h2>
      </div>

      <Filters
        activeFamily={activeFamily} setActiveFamily={setActiveFamily}
        activeGender={activeGender} setActiveGender={setActiveGender}
        activeTag={activeTag} setActiveTag={setActiveTag}
        activeBrand={activeBrand} setActiveBrand={setActiveBrand}
        brands={brands}
      />

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-[30px]">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-16 sm:py-[70px] text-ink-soft">
          <p className="font-display text-[22px] mb-2">No pudimos conectar con el servidor</p>
          <span className="text-[13.5px]">Verificá que la API esté corriendo (npm run dev en la carpeta server).</span>
        </div>
      ) : (
        <>
          <p className="text-[12.5px] text-ink-soft mb-4 sm:mb-5">
            {filtered.length} perfume{filtered.length !== 1 ? "s" : ""} encontrados
          </p>
          {filtered.length === 0 ? (
            <div className="text-center py-16 sm:py-[70px] text-ink-soft flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-line-soft flex items-center justify-center">
                <SearchX size={24} strokeWidth={1.2} />
              </div>
              <p className="font-display text-[22px] text-ink">No encontramos nada por acá</p>
              <span className="text-[13.5px] max-w-[360px]">
                Probá con otro filtro o buscá por marca, familia olfativa o nombre.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-[30px]">
              {filtered.map((p, i) => (
                <div key={p.id} className="animate-fadeIn" style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
