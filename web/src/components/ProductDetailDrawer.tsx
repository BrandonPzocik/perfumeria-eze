import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import Drawer from "./Drawer";
import Bottle from "./Bottle";
import { StockTag, TagBadge } from "./Badges";
import ScentPyramid from "./ScentPyramid";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import { useSettingsStore } from "../hooks/useSettingsStore";
import { formatCurrency, buildWhatsAppLink } from "../lib/format";
import { assetUrl } from "../lib/api";
import { useCartStore } from "../hooks/useCartStore";
import { useFavoritesStore } from "../hooks/useFavoritesStore";
import { useRecentlyViewedStore } from "../hooks/useRecentlyViewedStore";
import { useToastStore } from "../hooks/useToastStore";
import type { Perfume } from "../types";

export default function ProductDetailDrawer({ product }: { product: Perfume }) {
  const navigate = useNavigate();
  const items = usePerfumesStore((s) => s.items);
  const registerEvent = usePerfumesStore((s) => s.registerEvent);
  const settings = useSettingsStore((s) => s.settings);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);
  const isFav = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const registerViewed = useRecentlyViewedStore((s) => s.register);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    registerViewed(product.id);
  }, [product.id, registerViewed]);

  const close = () => navigate(-1);

  const handleAdd = () => {
    addItem(product);
    registerEvent(product.id, "cart");
    showToast(`${product.name} agregado al carrito`);
  };

  const handleBuyNow = () => {
    addItem(product);
    registerEvent(product.id, "cart");
    registerEvent(product.id, "whatsapp");
    close();
    setTimeout(() => openCart(), 50);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/producto/${product.id}`;
    registerEvent(product.id, "share");
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: `Mirá ${product.name} de ${product.brand}`, url });
      } catch {
        /* usuario canceló */
      }
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Enlace copiado al portapapeles");
    }
  };

  const similar = items.filter((p) => p.family === product.family && p.id !== product.id).slice(0, 4);
  const mainImage = assetUrl(product.images?.find((i) => i.isMain)?.url || product.images?.[0]?.url);

  const singleItemMessage = `Hola! Quiero consultar por:\n\n• ${product.name} (${product.type} ${product.size})\n\nMi nombre:\nDirección:\n\nGracias.`;

  return (
    <Drawer
      open
      onClose={close}
      title="Ficha del perfume"
      width="md"
      headerRight={
        <button
          onClick={handleShare}
          aria-label="Compartir"
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-line-soft transition-colors"
        >
          <Share2 size={18} />
        </button>
      }
      footer={
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => toggleFav(product.id)}
            className="w-full sm:w-12 sm:h-12 h-11 flex-shrink-0 border border-line rounded-lg flex items-center justify-center hover:bg-line-soft transition-colors"
            aria-label="Favorito"
          >
            <Heart size={18} fill={isFav ? "var(--color-primary)" : "none"} color={isFav ? "var(--color-primary)" : "var(--color-ink)"} />
          </button>
          <button
            disabled={product.stock === 0}
            onClick={handleAdd}
            className="btn-secondary flex-1 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
          </button>
          <a
            href={buildWhatsAppLink(singleItemMessage, settings.whatsappNumber)}
            target="_blank"
            rel="noreferrer"
            onClick={handleBuyNow}
            className="btn-primary flex-1 py-3.5"
          >
            <MessageCircle size={15} /> Comprar
          </a>
        </div>
      }
    >
      <div className="px-5 sm:px-6 pt-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 mb-6">
          <div className={`w-full sm:w-[160px] flex-shrink-0 image-placeholder rounded-card aspect-[3/4] sm:aspect-auto sm:h-[210px] overflow-hidden shadow-card mx-auto sm:mx-0 max-w-[200px] sm:max-w-none ${mainImage ? "" : "p-3"}`}>
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Bottle family={product.family} />
            )}
          </div>
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <span className="eyebrow opacity-70">{product.brand}</span>
            <h2 className="font-display font-bold uppercase tracking-wide text-[clamp(26px,5vw,34px)] leading-[1.08]">{product.name}</h2>
            <div className="flex gap-1.5 flex-wrap justify-center sm:justify-start my-1">
              {product.tags.map((t) => <TagBadge key={t} tag={t} />)}
              <StockTag stock={product.stock} />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5 justify-center sm:justify-start">
              <span className="font-bold text-[24px]">{formatCurrency(product.price, settings.currency)}</span>
              {product.oldPrice && (
                <span className="text-sm text-ink-soft line-through">{formatCurrency(product.oldPrice, settings.currency)}</span>
              )}
            </div>
            <span className="text-[12.5px] text-ink-soft">{product.type} · {product.size} · {product.gender}</span>
            {product.description && (
              <p className="text-[13.5px] text-ink-soft leading-relaxed mt-2">{product.description}</p>
            )}
          </div>
        </div>

        <hr className="hairline my-6" />

        <span className="eyebrow">Pirámide olfativa</span>
        <div className="mt-4 mb-6">
          <ScentPyramid notas={product.notas} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <span className="eyebrow opacity-70 block mb-2">Intensidad</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= product.intensidad ? "bg-wine" : "bg-line"}`} />
              ))}
            </div>
          </div>
          <div>
            <span className="eyebrow opacity-70 block mb-2">Duración</span>
            <span className="text-[13px]">{product.duracion}</span>
          </div>
          <div>
            <span className="eyebrow opacity-70 block mb-2">Familia</span>
            <span className="text-[13px]">{product.family}</span>
          </div>
        </div>

        {similar.length > 0 && (
          <>
            <hr className="hairline my-6" />
            <span className="eyebrow">También te puede gustar</span>
            <div className="flex gap-3.5 overflow-x-auto no-scrollbar mt-4 pb-1">
              {similar.map((p) => (
                <div key={p.id} className="w-[110px] flex-shrink-0 cursor-pointer group" onClick={() => navigate(`/producto/${p.id}`)}>
                  <div className="image-placeholder rounded-card aspect-[3/4] p-2 mb-2 shadow-card group-hover:shadow-card-hover transition-shadow">
                    <Bottle family={p.family} />
                  </div>
                  <span className="text-[11.5px] font-semibold block leading-tight">{p.name}</span>
                  <span className="text-[11px] text-ink-soft">{formatCurrency(p.price, settings.currency)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
