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
    <footer className="relative text-white px-4 sm:px-6 pt-14 sm:pt-20 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1C1814] via-[#2A241E] to-[#3D3229]" />

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
                <span className="font-display font-bold uppercase text-[20px] sm:text-[22px] tracking-[0.02em] block leading-tight text-white">
                  {settings.storeName}{" "}
                  <span className="text-[#D4C4A8]">{settings.storeNameAccent}</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/50 mt-1 block">
                  Femenino · Masculino · Unisex
                </span>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-white/65 mt-4 max-w-[320px]">
              Perfumería de nicho. Pedidos por WhatsApp, atención personalizada, sin vueltas.
            </p>
            <div className="flex gap-3 mt-5 flex-wrap">
              {settings.instagramUrlFemenino && (
                <a
                  href={settings.instagramUrlFemenino}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1 text-white no-underline"
                  aria-label="Instagram mujeres"
                >
                  <span className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <InstagramIcon size={18} />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">Mujeres</span>
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1 text-white no-underline"
                  aria-label="Instagram hombres"
                >
                  <span className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <InstagramIcon size={18} />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">Hombres</span>
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1 text-white no-underline"
                  aria-label="Facebook"
                >
                  <span className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <FacebookIcon size={18} />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">Facebook</span>
                </a>
              )}
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1 text-white no-underline"
                aria-label="WhatsApp"
              >
                <span className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <MessageCircle size={18} />
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">WhatsApp</span>
              </a>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4C4A8]">Explorar</span>
            <div className="flex flex-col gap-2.5 mt-4 text-[13.5px] text-white/75">
              <button className="text-left hover:text-white transition-colors" onClick={onScrollToCatalog}>Catálogo completo</button>
              <Link to="/decants" className="hover:text-white transition-colors no-underline text-white/75">Decants</Link>
              <button className="text-left hover:text-white transition-colors" onClick={() => goHomeAnd(onScrollToCatalog)}>Marcas</button>
              <button className="text-left hover:text-white transition-colors" onClick={() => goHomeAnd(() => onQuickFilter?.("oferta"))}>Ofertas</button>
              <Link to="/favoritos" className="hover:text-white transition-colors no-underline text-white/75">Favoritos</Link>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4C4A8]">Atención</span>
            <div className="flex flex-col gap-2.5 mt-4 text-[13.5px] text-white/75">
              <span>{settings.schedule}</span>
              <span>Pedidos 100% por WhatsApp</span>
              <span>Envíos a todo el país</span>
            </div>
          </div>
        </div>
        <hr className="border-white/15" />
        <p className="text-[11px] text-white/40 mt-5">
          {settings.storeName} {settings.storeNameAccent} © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
