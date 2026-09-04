import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductDetailDrawer from "../components/ProductDetailDrawer";
import Filters from "../components/Filters";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import { hasDecants } from "../lib/product";
import type { HomeOutletContext } from "../components/Layout";

export default function Decants() {
  const { query } = useOutletContext<HomeOutletContext>();
  const { id } = useParams();
  const { items, loading, error, loaded, fetchAll } = usePerfumesStore();
  const [activeFamily, setActiveFamily] = useState("Todas");
  const [activeGender, setActiveGender] = useState("Todos");
  const [activeTag, setActiveTag] = useState("Todos");
  const [activeBrand, setActiveBrand] = useState("Todas");

  useEffect(() => {
    if (!loaded) fetchAll();
  }, [loaded, fetchAll]);

  const decants = useMemo(() => items.filter(hasDecants), [items]);
  const product = id ? decants.find((p) => p.id === id) || items.find((p) => p.id === id) : undefined;
  const brands = useMemo(() => Array.from(new Set(decants.map((p) => p.brand))).sort(), [decants]);

  const filtered = useMemo(() => {
    return decants.filter((p) => {
      if (query && !`${p.name} ${p.brand} ${p.family} ${p.id}`.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      if (activeFamily !== "Todas" && p.family !== activeFamily) return false;
      if (activeGender !== "Todos" && p.gender !== activeGender && p.gender !== "Unisex") return false;
      if (activeBrand !== "Todas" && p.brand !== activeBrand) return false;
      if (activeTag !== "Todos" && !p.tags.includes(activeTag as any)) return false;
      return true;
    });
  }, [decants, query, activeFamily, activeGender, activeBrand, activeTag]);

  return (
    <section id="decants" className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-12 sm:pt-[70px] pb-16 sm:pb-[100px] min-h-[60vh] scroll-mt-[64px] sm:scroll-mt-[72px]">
      <div className="mb-6 sm:mb-8">
        <span className="eyebrow">Fragancias en formato chico</span>
        <h1 className="font-display font-bold uppercase tracking-wide text-[clamp(28px,4vw,36px)] mt-1.5">Decants</h1>
        <p className="text-[14px] text-ink-soft mt-2 max-w-[520px]">
          Elegí 2ml, 5ml o 10ml. Cada tamaño tiene su precio. Tocá el ml que querés para sumarlo al carrito.
        </p>
      </div>

      <Filters
        activeFamily={activeFamily} setActiveFamily={setActiveFamily}
        activeGender={activeGender} setActiveGender={setActiveGender}
        activeTag={activeTag} setActiveTag={setActiveTag}
        activeBrand={activeBrand} setActiveBrand={setActiveBrand}
        brands={brands}
      />

      {loading && items.length === 0 ? (
        <p className="text-ink-soft py-16">Cargando decants…</p>
      ) : error ? (
        <p className="text-ink-soft py-16">No pudimos cargar los decants.</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 sm:py-[70px] text-ink-soft flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-line-soft flex items-center justify-center">
            <SearchX size={24} strokeWidth={1.2} />
          </div>
          <p className="font-display text-[22px] text-ink">No hay decants por acá</p>
          <span className="text-[13.5px] max-w-[360px]">
            Probá con otro filtro o buscá por nombre o marca.
          </span>
        </div>
      ) : (
        <>
          <p className="text-[12.5px] text-ink-soft mb-4 sm:mb-5">
            {filtered.length} fragancia{filtered.length !== 1 ? "s" : ""} en decant
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-3 sm:gap-x-6 gap-y-6 sm:gap-y-8">
            {filtered.map((p, i) => (
              <div key={p.id} className="animate-fadeIn" style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}>
                <ProductCard product={p} decantMode />
              </div>
            ))}
          </div>
        </>
      )}

      {product && <ProductDetailDrawer product={product} />}
    </section>
  );
}
