import { useMemo } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import StoreLogo from "./StoreLogo";
import { useSettingsStore } from "../hooks/useSettingsStore";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import { assetUrl } from "../lib/api";

export default function Hero({ onExplore }: { onExplore: () => void }) {
  const settings = useSettingsStore((s) => s.settings);
  const items = usePerfumesStore((s) => s.items);
  const banner = assetUrl(settings.bannerUrl);

  const brands = useMemo(() => Array.from(new Set(items.map((p) => p.brand))), [items]);

  return (
    <section className="relative overflow-hidden text-stone-soft">
      {banner ? (
        <>
          <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-deep/95 via-primary/88 to-accent/40" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(145deg,var(--color-primary-deep)_0%,#0f2a6b_40%,var(--color-primary)_75%,#2563EB_100%)]" />
      )}

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 pt-14 sm:pt-24 pb-14 sm:pb-20 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 items-center">
        <div className="animate-fadeInUp text-center md:text-left order-2 md:order-1">
          <h1 className="font-display font-extrabold uppercase text-[clamp(38px,7vw,72px)] leading-[0.92] tracking-tight">
            {settings.storeName}
            <br />
            <span className="text-accent-soft">{settings.storeNameAccent}</span>
          </h1>
          <p className="mt-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.32em] text-accent-soft/80">
            Fragancia para hombres
          </p>
          <p className="text-[15px] sm:text-base leading-relaxed max-w-[420px] text-stone-soft/70 mt-5 mb-8 font-medium mx-auto md:mx-0">
            Perfumes de nicho y árabes, seleccionados para vos. Consultá, elegí y coordinamos por WhatsApp.
          </p>
          <div className="flex gap-3 flex-wrap justify-center md:justify-start">
            <button onClick={onExplore} className="btn-accent shadow-lg shadow-accent/25">
              Ver catálogo <ArrowRight size={15} />
            </button>
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border-2 border-white/25 text-stone-soft px-6 py-3.5 rounded-lg text-[13px] uppercase tracking-wider font-bold hover:border-white/50 hover:bg-white/5 transition-all no-underline"
            >
              <MessageCircle size={15} /> Consultar
            </a>
          </div>
        </div>

        <div className="relative flex justify-center items-center order-1 md:order-2 animate-fadeInUp min-h-[200px] sm:min-h-[280px] md:min-h-[340px]" style={{ animationDelay: "0.12s" }}>
          <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] rounded-full bg-accent/15 blur-3xl" />
          <StoreLogo
            settingsLogo={settings.logoUrl}
            alt={`${settings.storeName} ${settings.storeNameAccent}`}
            hero
            className="relative w-full max-w-[200px] sm:max-w-[280px] md:max-w-[340px] h-auto object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>

      {brands.length > 0 && (
        <div className="relative border-t border-white/10 bg-black/10 backdrop-blur-sm">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-4 flex gap-8 sm:gap-12 overflow-x-auto no-scrollbar">
            {brands.map((b) => (
              <span key={b} className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-stone-soft/40 flex-shrink-0 font-bold">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
