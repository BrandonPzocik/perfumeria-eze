import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import { useFavoritesStore } from "../hooks/useFavoritesStore";

export default function Favorites() {
  const favIds = useFavoritesStore((s) => s.ids);
  const items = usePerfumesStore((s) => s.items);
  const products = items.filter((p) => favIds.includes(p.id));

  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-12 sm:pt-[60px] pb-16 sm:pb-[100px] min-h-[60vh]">
      <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink mb-6 transition-colors no-underline">
        <ArrowLeft size={15} /> Volver al catálogo
      </Link>
      <span className="eyebrow">Guardados en este dispositivo</span>
      <h1 className="font-display font-bold uppercase tracking-wide text-[clamp(28px,4vw,36px)] mt-1.5 mb-8">Tus favoritos</h1>

      {products.length === 0 ? (
        <div className="text-center py-16 sm:py-[90px] text-ink-soft flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-line-soft flex items-center justify-center">
            <Heart size={28} strokeWidth={1.2} />
          </div>
          <p className="font-display text-[22px] text-ink">Todavía no guardaste ningún perfume</p>
          <span className="text-[13.5px] max-w-[360px]">
            Tocá el corazón en cualquier perfume del catálogo para guardarlo acá. Se guarda en este dispositivo, sin necesidad de crear una cuenta.
          </span>
          <Link to="/" className="btn-secondary mt-2 no-underline">
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-[30px]">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}
