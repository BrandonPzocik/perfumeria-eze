import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import Bottle from "./Bottle";
import { StockTag, TagBadge } from "./Badges";
import { formatCurrency } from "../lib/format";
import { useFavoritesStore } from "../hooks/useFavoritesStore";
import { useSettingsStore } from "../hooks/useSettingsStore";
import { assetUrl } from "../lib/api";
import type { Perfume } from "../types";

interface ProductCardProps {
  product: Perfume;
  large?: boolean;
}

export default function ProductCard({ product, large }: ProductCardProps) {
  const navigate = useNavigate();
  const isFav = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const currency = useSettingsStore((s) => s.settings.currency);

  const mainImage = product.images?.find((i) => i.isMain) || product.images?.[0];
  const imageUrl = assetUrl(mainImage?.url);

  return (
    <div
      className="flex flex-col cursor-pointer group"
      onClick={() => navigate(`/producto/${product.id}`)}
    >
      <div
        className={`relative rounded-card overflow-hidden border border-line-soft image-placeholder transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-card-hover group-hover:border-line ${
          large ? "aspect-[4/5]" : "aspect-[3/4]"
        }`}
      >
        <div className="absolute top-2.5 left-2.5 z-10 flex gap-1 flex-wrap max-w-[75%]">
          {product.tags.slice(0, 2).map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </div>
        <button
          className="heart-btn absolute top-2 right-2 z-10 bg-stone-soft/95 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center shadow-card opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(product.id);
          }}
          aria-label="Favorito"
        >
          <Heart
            size={16}
            fill={isFav ? "var(--color-primary)" : "none"}
            color={isFav ? "var(--color-primary)" : "var(--color-ink)"}
            strokeWidth={1.6}
          />
        </button>
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
        ) : (
          <div className="absolute inset-y-3 left-[18%] right-[18%] transition-transform duration-500 group-hover:scale-105">
            <Bottle family={product.family} />
          </div>
        )}
        <div className="absolute bottom-2.5 left-2.5">
          <StockTag stock={product.stock} />
        </div>
      </div>

      <div className="pt-3 flex flex-col gap-0.5">
        <span className="eyebrow text-ink-soft/60 text-[10px]">{product.brand}</span>
        <h3 className={`font-display font-bold uppercase tracking-wide leading-tight group-hover:text-primary transition-colors ${large ? "text-[20px]" : "text-[16px] sm:text-[17px]"}`}>
          {product.name}
        </h3>
        <span className="text-xs text-ink-soft">
          {product.type} · {product.size}
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-semibold text-[15px]">{formatCurrency(product.price, currency)}</span>
          {product.oldPrice && (
            <span className="text-[12px] text-ink-soft line-through">{formatCurrency(product.oldPrice, currency)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
