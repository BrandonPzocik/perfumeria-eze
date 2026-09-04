import { useNavigate } from "react-router-dom";
import type { MouseEvent } from "react";
import { useState } from "react";
import { Heart } from "lucide-react";
import Bottle from "./Bottle";
import { StockTag, TagBadge } from "./Badges";
import ConfirmDecantSheet from "./ConfirmDecantSheet";
import { formatCurrency } from "../lib/format";
import { useFavoritesStore } from "../hooks/useFavoritesStore";
import { useSettingsStore } from "../hooks/useSettingsStore";
import { useCartStore } from "../hooks/useCartStore";
import { useToastStore } from "../hooks/useToastStore";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import { assetUrl } from "../lib/api";
import { perfumeImageUrl, productPath } from "../lib/product";
import type { Perfume, PerfumeVariant } from "../types";

interface ProductCardProps {
  product: Perfume;
  large?: boolean;
  decantMode?: boolean;
}

export default function ProductCard({ product, large, decantMode }: ProductCardProps) {
  const navigate = useNavigate();
  const catalog = usePerfumesStore((s) => s.items);
  const isFav = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const currency = useSettingsStore((s) => s.settings.currency);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const registerEvent = usePerfumesStore((s) => s.registerEvent);
  const decant = Boolean(decantMode);
  const variants = (product.variants || []).filter((v) => Number(v.price) > 0);
  const stock = product.stock;
  const [pendingDecant, setPendingDecant] = useState<PerfumeVariant | null>(null);

  const imageUrl = assetUrl(perfumeImageUrl(product, catalog));

  const handlePickSize = (e: MouseEvent, variant: PerfumeVariant) => {
    e.stopPropagation();
    if (variant.stock <= 0) return;
    setPendingDecant(variant);
  };

  const confirmAddSize = () => {
    if (!pendingDecant) return;
    addItem(product, { variant: pendingDecant });
    registerEvent(product.id, "cart");
    showToast(`${product.name} · ${pendingDecant.size} agregado al carrito`);
    setPendingDecant(null);
  };

  return (
    <>
    <div
      className="flex flex-col cursor-pointer group"
      onClick={() => navigate(productPath(product, catalog))}
    >
      <div
        className={`relative rounded-card overflow-hidden border border-line-soft image-placeholder transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-card-hover group-hover:border-line ${
          large ? "aspect-[4/5]" : "aspect-[3/4]"
        }`}
      >
        <div className="absolute top-2 left-2 z-10 flex gap-1 flex-wrap max-w-[70%]">
          {decant && (
            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-accent text-stone-soft">
              Decant
            </span>
          )}
          {!decant && product.tags.slice(0, 2).map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </div>
        <button
          className="heart-btn absolute top-1.5 right-1.5 z-10 bg-stone-soft/95 backdrop-blur-sm rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shadow-card"
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(product.id);
          }}
          aria-label="Favorito"
        >
          <Heart
            size={15}
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
        {decant && variants.length > 0 ? (
          <div
            className="absolute inset-x-0 bottom-0 z-10 pt-10 pb-1.5 px-1.5 bg-gradient-to-t from-black/80 via-black/45 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-3 gap-1">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  disabled={variant.stock <= 0}
                  onClick={(e) => handlePickSize(e, variant)}
                  className="rounded-md bg-white/95 backdrop-blur-sm px-1 py-1.5 text-center leading-tight disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-transform"
                >
                  <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-ink-soft">{variant.size}</span>
                  <span className="block text-[10px] sm:text-[11px] font-semibold text-ink">{formatCurrency(variant.price, currency)}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="absolute bottom-2.5 left-2.5">
            <StockTag stock={stock} />
          </div>
        )}
      </div>

      <div className="pt-2.5 flex flex-col gap-0.5">
        <span className="eyebrow text-ink-soft/60 text-[10px]">{product.brand}</span>
        <h3 className={`font-display font-bold uppercase tracking-wide leading-tight group-hover:text-primary transition-colors ${large ? "text-[18px] sm:text-[20px]" : "text-[15px] sm:text-[17px]"}`}>
          {product.name}
        </h3>
        {!decant && (
          <>
            <span className="text-xs text-ink-soft">{product.type} · {product.size}</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-semibold text-[15px]">{formatCurrency(product.price, currency)}</span>
              {product.oldPrice && (
                <span className="text-[12px] text-ink-soft line-through">{formatCurrency(product.oldPrice, currency)}</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>

      {pendingDecant && (
        <ConfirmDecantSheet
          productName={product.name}
          variant={pendingDecant}
          currency={currency}
          onCancel={() => setPendingDecant(null)}
          onConfirm={confirmAddSize}
        />
      )}
    </>
  );
}
