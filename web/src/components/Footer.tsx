import { Link, useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import StoreLogo from "./StoreLogo";
import { useSettingsStore } from "../hooks/useSettingsStore";

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M15 8h-2a2 2 0 0 0-2 2v10M9 13h4" />
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </svg>
  );
}

interface FooterProps {
  onScrollToCatalog: () => void;
  onQuickFilter?: (tag: "nuevo" | "oferta") => void;
}

export default function Footer({ onScrollToCatalog, onQuickFilter }: FooterProps) {
  const settings = useSettingsStore((s) => s.settings);
  const navigate = useNavigate();

  const goHomeAnd = (action?: () => void) => {
    navigate("/");
    setTimeout(() => action?.(), 0);
  };

  return (
    <footer className="relative text-stone-soft/85 px-4 sm:px-6 pt-14 sm:pt-20 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,var(--color-primary-deep)_0%,#0f2a6b_50%,var(--color-primary)_100%)]" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />

      <div className="relative max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr] gap-10 mb-12 sm:mb-14">
          <div>
            <div className="flex items-center gap-3">
              <StoreLogo
                settingsLogo={settings.logoUrl}
                alt={settings.storeName}
                className="w-12 h-12 object-contain flex-shrink-0"
              />
              <div>
                <span className="font-display font-bold uppercase text-[20px] sm:text-[22px] tracking-wide block leading-none">
                  {settings.storeName}{" "}
                  <span className="text-accent-soft">{settings.storeNameAccent}</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-accent-soft/70 mt-1 block">
                  Fragancia para hombres
                </span>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-stone-soft/55 mt-4 max-w-[320px]">
              Perfumería masculina de nicho. Pedidos por WhatsApp, atención personalizada, sin vueltas.
            </p>
            <div className="flex gap-3 mt-5">
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border border-white/15 flex items-center justify-center hover:bg-white/10 hover:border-accent-soft/40 transition-colors">
                  <InstagramIcon size={18} />
                </a>
              )}
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border border-white/15 flex items-center justify-center hover:bg-white/10 hover:border-accent-soft/40 transition-colors">
                  <FacebookIcon size={18} />
                </a>
              )}
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg border border-white/15 flex items-center justify-center hover:bg-white/10 hover:border-accent-soft/40 transition-colors">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
          <div>
            <span className="eyebrow text-accent-soft">Explorar</span>
            <div className="flex flex-col gap-2.5 mt-4 text-[13.5px]">
              <button className="text-left hover:text-accent-soft transition-colors" onClick={onScrollToCatalog}>Catálogo completo</button>
              <button className="text-left hover:text-accent-soft transition-colors" onClick={() => goHomeAnd(onScrollToCatalog)}>Marcas</button>
              <button className="text-left hover:text-accent-soft transition-colors" onClick={() => goHomeAnd(() => onQuickFilter?.("oferta"))}>Ofertas</button>
              <Link to="/favoritos" className="hover:text-accent-soft transition-colors no-underline text-stone-soft/85">Favoritos</Link>
            </div>
          </div>
          <div>
            <span className="eyebrow text-accent-soft">Atención</span>
            <div className="flex flex-col gap-2.5 mt-4 text-[13.5px] text-stone-soft/75">
              <span>{settings.schedule}</span>
              <span>Pedidos 100% por WhatsApp</span>
              <span>Envíos a todo el país</span>
            </div>
          </div>
        </div>
        <hr className="border-white/10" />
        <p className="text-[11px] text-stone-soft/35 mt-5">
          {settings.storeName} {settings.storeNameAccent} © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
