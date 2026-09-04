import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import Drawer from "./Drawer";
import Bottle from "./Bottle";
import { StockTag, TagBadge } from "./Badges";
import ScentPyramid from "./ScentPyramid";
import ConfirmDecantSheet from "./ConfirmDecantSheet";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import { useSettingsStore } from "../hooks/useSettingsStore";
import { formatCurrency, buildWhatsAppLink, buildWhatsAppSingleProductMessage, resolveWhatsAppNumber } from "../lib/format";
import { assetUrl } from "../lib/api";
import { useCartStore } from "../hooks/useCartStore";
import { useFavoritesStore } from "../hooks/useFavoritesStore";
import { useRecentlyViewedStore } from "../hooks/useRecentlyViewedStore";
import { useToastStore } from "../hooks/useToastStore";
import {
  perfumeImageUrl,
  productPath,
} from "../lib/product";
import type { Perfume, PerfumeVariant } from "../types";

export default function ProductDetailDrawer({ product }: { product: Perfume }) {
  const navigate = useNavigate();
  const items = usePerfumesStore((s) => s.items);
  const registerEvent = usePerfumesStore((s) => s.registerEvent);
  const settings = useSettingsStore((s) => s.settings);
  const addItem = useCartStore((s) => s.addItem);
  const openForCheckout = useCartStore((s) => s.openForCheckout);
  const isFav = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const registerViewed = useRecentlyViewedStore((s) => s.register);
  const showToast = useToastStore((s) => s.show);
  const [pendingDecant, setPendingDecant] = useState<PerfumeVariant | null>(null);

  const sheet = product;
  const decantVariants = (product.variants || []).filter((v) => Number(v.price) > 0);

  useEffect(() => {
    registerViewed(sheet.id);
  }, [sheet.id, registerViewed]);

  const bottleStock = product.stock;
  const mainImage = assetUrl(perfumeImageUrl(sheet, items));

  const close = () => navigate(-1);

  const handleAddBottle = () => {
    addItem(product);
    registerEvent(product.id, "cart");
    showToast(`${product.name} agregado al carrito`);
  };

  const handleBuyBottle = () => {
    addItem(product);
    registerEvent(product.id, "cart");
    close();
    setTimeout(() => openForCheckout(), 50);
  };

  const confirmAddDecant = () => {
    if (!pendingDecant) return;
    addItem(product, { variant: pendingDecant });
    registerEvent(product.id, "cart");
    showToast(`${sheet.name} · Decant ${pendingDecant.size} agregado al carrito`);
    setPendingDecant(null);
  };

  const handleConsult = () => {
    registerEvent(sheet.id, "whatsapp");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${productPath(sheet, items)}`;
    registerEvent(sheet.id, "share");
    if (navigator.share) {
      try {
        await navigator.share({ title: sheet.name, text: `Mirá ${sheet.name} de ${sheet.brand}`, url });
      } catch {
        /* usuario canceló */
      }
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Enlace copiado al portapapeles");
    }
  };

  const hasPhoto = (p: Perfume) => Boolean(perfumeImageUrl(p, items));
  const sameFamily = items.filter((p) => p.family === sheet.family && p.id !== sheet.id);
  const similar = [
    ...sameFamily.filter(hasPhoto),
    ...sameFamily.filter((p) => !hasPhoto(p)),
  ].slice(0, 4);
  const similarImage = (p: Perfume) => assetUrl(perfumeImageUrl(p, items));
  const consultMessage = buildWhatsAppSingleProductMessage(sheet, settings.currency);

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
        <div className="p-3 sm:p-4 flex items-stretch gap-2">
          <button
            onClick={() => toggleFav(sheet.id)}
            className="w-11 h-11 flex-shrink-0 border border-line rounded-lg flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-colors self-center"
            aria-label="Favorito"
          >
            <Heart size={17} fill={isFav ? "var(--color-primary)" : "none"} color={isFav ? "var(--color-primary)" : "var(--color-ink)"} />
          </button>
          <button
            disabled={bottleStock === 0}
            onClick={handleAddBottle}
            className="flex-1 inline-flex items-center justify-center border-2 border-primary text-primary rounded-lg text-[12px] uppercase tracking-wide font-bold px-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-colors"
          >
            {bottleStock === 0 ? "Sin stock" : "Agregar"}
          </button>
          <button
            disabled={bottleStock === 0}
            onClick={handleBuyBottle}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-white rounded-lg text-[12px] uppercase tracking-wide font-bold px-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-colors"
          >
            {bottleStock === 0 ? "Sin stock" : (
              <>
                <MessageCircle size={15} /> Comprar
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="px-5 sm:px-6 pt-6 pb-8">
        <div className="flex gap-4 sm:gap-5 mb-6 items-start">
          <div className={`w-[42%] max-w-[200px] flex-shrink-0 image-placeholder rounded-card aspect-[3/4] overflow-hidden shadow-card ${mainImage ? "" : "p-3"}`}>
            {mainImage ? (
              <img src={mainImage} alt={sheet.name} className="w-full h-full object-cover" />
            ) : (
              <Bottle family={sheet.family} />
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-0.5">
            <span className="eyebrow opacity-70">{sheet.brand}</span>
            <h2 className="font-display font-bold uppercase tracking-wide text-[clamp(22px,5.5vw,32px)] leading-[1.08]">{sheet.name}</h2>
            <div className="flex gap-1.5 flex-wrap my-1">
              {sheet.tags.map((t) => <TagBadge key={t} tag={t} />)}
              <StockTag stock={bottleStock} />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-bold text-[22px] sm:text-[26px]">{formatCurrency(product.price, settings.currency)}</span>
              {product.oldPrice && (
                <span className="text-sm text-ink-soft line-through">{formatCurrency(product.oldPrice, settings.currency)}</span>
              )}
            </div>
            <span className="text-[12.5px] text-ink-soft">{product.type} · {product.size} · {product.gender}</span>
            {sheet.description && (
              <p className="text-[13px] sm:text-[13.5px] text-ink-soft leading-relaxed mt-1">{sheet.description}</p>
            )}
            <a
              href={buildWhatsAppLink(consultMessage, resolveWhatsAppNumber(sheet.gender, settings))}
              target="_blank"
              rel="noreferrer"
              onClick={handleConsult}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:text-primary mt-2 no-underline"
            >
              <MessageCircle size={15} /> Consultar
            </a>
          </div>
        </div>

        {decantVariants.length > 0 && (
          <div className="mb-6 pb-5 border-b border-line">
            <span className="eyebrow block mb-1">También en decant</span>
            <p className="text-[12px] text-ink-soft mb-3">Elegí el tamaño para agregar al carrito.</p>
            <div className="grid grid-cols-3 gap-2">
              {decantVariants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  disabled={variant.stock <= 0}
                  onClick={() => setPendingDecant(variant)}
                  className={`rounded-xl border bg-white px-2 py-3 text-left hover:border-primary/50 hover:bg-primary/5 transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    pendingDecant?.id === variant.id ? "border-primary bg-primary/5" : "border-line"
                  }`}
                >
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-soft">{variant.size}</span>
                  <span className="block text-[14px] font-semibold mt-0.5">{formatCurrency(variant.price, settings.currency)}</span>
                  {variant.stock <= 0 && (
                    <span className="block text-[10px] text-ink-soft mt-0.5">Agotado</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <span className="eyebrow">Pirámide olfativa</span>
        <div className="mt-4 mb-6">
          <ScentPyramid notas={sheet.notas} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <span className="eyebrow opacity-70 block mb-2">Intensidad</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= sheet.intensidad ? "bg-primary" : "bg-line"}`} />
              ))}
            </div>
          </div>
          <div>
            <span className="eyebrow opacity-70 block mb-2">Duración</span>
            <span className="text-[13px]">{sheet.duracion || "—"}</span>
          </div>
          <div>
            <span className="eyebrow opacity-70 block mb-2">Familia</span>
            <span className="text-[13px]">{sheet.family}</span>
          </div>
        </div>

        {similar.length > 0 && (
          <>
            <hr className="hairline my-6" />
            <span className="eyebrow">También te puede gustar</span>
            <div className="flex gap-3.5 overflow-x-auto no-scrollbar mt-4 pb-1">
              {similar.map((p) => {
                const img = similarImage(p);
                return (
                  <div key={p.id} className="w-[110px] flex-shrink-0 cursor-pointer group" onClick={() => navigate(productPath(p, items))}>
                    <div className={`image-placeholder rounded-card aspect-[3/4] mb-2 overflow-hidden shadow-card ${img ? "" : "p-2"}`}>
                      {img ? (
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Bottle family={p.family} />
                      )}
                    </div>
                    <span className="text-[11.5px] font-semibold block leading-tight">{p.name}</span>
                    <span className="text-[11px] text-ink-soft">{formatCurrency(p.price, settings.currency)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {pendingDecant && (
        <ConfirmDecantSheet
          productName={sheet.name}
          variant={pendingDecant}
          currency={settings.currency}
          onCancel={() => setPendingDecant(null)}
          onConfirm={confirmAddDecant}
        />
      )}
    </Drawer>
  );
}
