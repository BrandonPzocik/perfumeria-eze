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
          <div className="absolute inset-0 bg-gradient-to-br from-[#1C1814]/92 via-[#2A241E]/88 to-[#3D3229]/85" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C1814] via-[#2A241E] to-[#3D3229]" />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(166,139,91,0.18)_0%,transparent_55%)] pointer-events-none" />

      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 pt-7 sm:pt-16 md:pt-20 pb-8 sm:pb-16 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-10 items-center">
        <div className="animate-fadeInUp text-center md:text-left order-2 md:order-1">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-white/55 mb-2 sm:mb-3">
            {settings.storeName} {settings.storeNameAccent}
          </p>
          <h1 className="font-display font-extrabold uppercase text-[clamp(32px,7vw,62px)] leading-[0.92] tracking-[0.02em] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
            Tu aroma.
            <br />
            <span className="text-[#D4C4A8]">Tu identidad.</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-[15px] sm:text-[19px] italic font-medium tracking-[0.01em] text-white/80 max-w-[380px] mx-auto md:mx-0 leading-snug">
            Elegí cómo querés ser recordado.
          </p>
          <p className="mt-3 sm:mt-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-white/45">
            Femenino · Masculino · Unisex
          </p>
          <div className="flex gap-3 flex-wrap justify-center md:justify-start mt-5 sm:mt-8">
            <button onClick={onExplore} className="btn-accent shadow-lg shadow-black/30">
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

        <div className="relative flex justify-center items-center order-1 md:order-2 animate-fadeInUp min-h-[170px] sm:min-h-[260px] md:min-h-[420px]" style={{ animationDelay: "0.12s" }}>
          <div className="absolute w-[220px] sm:w-[360px] md:w-[480px] h-[220px] sm:h-[360px] md:h-[480px] rounded-full bg-accent/10 blur-3xl" />
          <StoreLogo
            settingsLogo={settings.logoUrl}
            alt={`${settings.storeName} ${settings.storeNameAccent}`}
            hero
            className="relative w-full max-w-[250px] sm:max-w-[340px] md:max-w-[480px] lg:max-w-[540px] h-auto object-contain drop-shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
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
