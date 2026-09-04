import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, Menu, X } from "lucide-react";
import StoreLogo from "./StoreLogo";
import { useCartStore } from "../hooks/useCartStore";
import { useFavoritesStore } from "../hooks/useFavoritesStore";
import { useSettingsStore } from "../hooks/useSettingsStore";

interface HeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  onScrollToCatalog?: () => void;
  onQuickFilter?: (tag: "nuevo" | "oferta") => void;
}

export default function Header({ query, onQueryChange, onScrollToCatalog, onQuickFilter }: HeaderProps) {
  const [mobileNav, setMobileNav] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const cartCount = useCartStore((s) => s.lines.reduce((sum, l) => sum + l.qty, 0));
  const openCart = useCartStore((s) => s.open);
  const favCount = useFavoritesStore((s) => s.ids.length);
  const settings = useSettingsStore((s) => s.settings);
  const navigate = useNavigate();

  const goHomeAnd = (action?: () => void) => {
    setMobileNav(false);
    navigate("/");
    setTimeout(() => action?.(), 0);
  };

  useEffect(() => {
    document.body.style.overflow = mobileNav || mobileSearch ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileNav, mobileSearch]);

  const navItems = [
    { label: "Catálogo", action: () => goHomeAnd(onScrollToCatalog) },
    { label: "Decants", action: () => { setMobileNav(false); onQueryChange(""); navigate("/decants"); } },
    { label: "Ofertas", action: () => goHomeAnd(() => onQuickFilter?.("oferta")) },
    { label: "Nuevos ingresos", action: () => goHomeAnd(() => onQuickFilter?.("nuevo")) },
    { label: "Favoritos", action: () => { setMobileNav(false); navigate("/favoritos"); } },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-stone-soft/90 backdrop-blur-xl border-b border-line shadow-sm shadow-primary/5">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-center justify-between h-[64px] sm:h-[72px]">
          <div className="flex items-center gap-3 sm:gap-8 min-w-0">
            <button
              className="md:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/5 text-primary transition-colors"
              onClick={() => setMobileNav(true)}
              aria-label="Menú"
            >
              <Menu size={20} />
            </button>

            <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
              <StoreLogo
                settingsLogo={settings.logoUrl}
                alt={settings.storeName}
                className="w-11 h-11 sm:w-12 sm:h-12 object-contain flex-shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0 hidden xs:block sm:block">
                <span className="font-display font-bold uppercase text-[16px] sm:text-[19px] tracking-wide truncate block leading-none">
                  {settings.storeName}{" "}
                  <span className="text-primary">{settings.storeNameAccent}</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent/80 hidden sm:block mt-0.5">
                  Femenino · Masculino · Unisex
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex gap-5 lg:gap-6 text-[13px] font-semibold">
              {navItems.slice(0, 4).map((item) => (
                <span key={item.label} className="nav-link cursor-pointer text-ink-soft hover:text-primary transition-colors" onClick={item.action}>
                  {item.label}
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <button
              onClick={() => setMobileSearch(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/5 text-primary transition-colors"
              aria-label="Buscar"
            >
              <Search size={18} />
            </button>

            <div className="hidden md:flex items-center rounded-full bg-white border border-line px-3.5 py-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-sm">
              <Search size={15} className="text-accent flex-shrink-0" />
              <input
                placeholder="Buscar perfumes…"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className="bg-transparent outline-none ml-2 w-[180px] lg:w-[220px] text-[13px] placeholder:text-ink-soft/45"
              />
            </div>

            <Link to="/favoritos" className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/5 transition-colors" aria-label="Favoritos">
              <Heart size={19} />
              {favCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </Link>

            <button onClick={openCart} className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/5 transition-colors" aria-label="Carrito">
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-accent text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileNav && (
        <>
          <div className="fixed inset-0 bg-primary-deep/60 backdrop-blur-sm z-[55] animate-backdropIn md:hidden" onClick={() => setMobileNav(false)} />
          <nav className="fixed top-0 left-0 h-full w-[min(300px,85vw)] bg-stone-soft z-[56] shadow-drawer flex flex-col animate-slideInLeft md:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-primary/5">
              <span className="eyebrow">Menú</span>
              <button onClick={() => setMobileNav(false)} aria-label="Cerrar" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/10">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col p-3 gap-0.5">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="text-left px-4 py-3.5 rounded-lg text-[15px] font-semibold hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-auto p-5 border-t border-line">
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noreferrer" className="btn-primary w-full">
                Contactar por WhatsApp
              </a>
            </div>
          </nav>
        </>
      )}

      {mobileSearch && (
        <div className="fixed inset-0 z-[55] bg-stone-soft flex flex-col md:hidden animate-fadeIn">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-white">
            <Search size={18} className="text-accent flex-shrink-0" />
            <input
              autoFocus
              placeholder="Buscar por nombre, marca, notas…"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-ink-soft/50"
            />
            <button onClick={() => setMobileSearch(false)} aria-label="Cerrar búsqueda" className="text-[13px] font-bold text-primary px-2">
              Cerrar
            </button>
          </div>
          <div className="flex-1 p-4">
            <p className="text-[13px] text-ink-soft">Escribí para buscar en el catálogo completo.</p>
          </div>
        </div>
      )}
    </>
  );
}
