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
    <section className="relative overflow-hidden text-white">
      {banner ? (
        <>
          <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628]/92 via-[#0f2744]/88 to-[#1e3a8a]/85" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#0f2744] to-[#1e3a8a]" />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(59,130,246,0.18)_0%,transparent_55%)] pointer-events-none" />

      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 pt-14 sm:pt-24 pb-14 sm:pb-20 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 items-center">
        <div className="animate-fadeInUp text-center md:text-left order-2 md:order-1">
          <h1 className="font-display font-extrabold uppercase text-[clamp(36px,6.5vw,68px)] leading-[1.05] tracking-[0.02em] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
            {settings.storeName}
            <br />
            <span className="text-[#93C5FD]">{settings.storeNameAccent}</span>
          </h1>
          <p className="mt-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-white/60">
            Fragancia para hombres
          </p>
          <p className="text-[15px] sm:text-base leading-relaxed max-w-[420px] text-white/75 mt-5 mb-8 font-normal mx-auto md:mx-0">
            Perfumes de nicho y árabes, seleccionados para vos. Consultá, elegí y coordinamos por WhatsApp.
          </p>
          <div className="flex gap-3 flex-wrap justify-center md:justify-start">
            <button onClick={onExplore} className="btn-accent shadow-lg shadow-blue-900/30">
              Ver catálogo <ArrowRight size={15} />
            </button>
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3.5 rounded-lg text-[13px] uppercase tracking-wider font-bold hover:bg-white/10 transition-all no-underline"
            >
              <MessageCircle size={15} /> Consultar
            </a>
          </div>
        </div>

        <div className="relative flex justify-center items-center order-1 md:order-2 animate-fadeInUp min-h-[200px] sm:min-h-[280px] md:min-h-[340px]" style={{ animationDelay: "0.12s" }}>
          <div className="absolute w-[260px] sm:w-[320px] h-[260px] sm:h-[320px] rounded-full bg-blue-400/10 blur-3xl" />
          <StoreLogo
            settingsLogo={settings.logoUrl}
            alt={`${settings.storeName} ${settings.storeNameAccent}`}
            hero
            className="relative w-full max-w-[200px] sm:max-w-[280px] md:max-w-[340px] h-auto object-contain drop-shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
          />
        </div>
      </div>

      {brands.length > 0 && (
        <div className="relative border-t border-white/10 bg-black/15">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-4 flex gap-8 sm:gap-12 overflow-x-auto no-scrollbar">
            {brands.map((b) => (
              <span key={b} className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-white/45 flex-shrink-0 font-bold">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
