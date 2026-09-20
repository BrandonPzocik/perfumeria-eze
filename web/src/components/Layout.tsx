import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import Toast from "./Toast";
import WhatsAppFAB from "./WhatsAppFAB";
import { useSettingsStore } from "../hooks/useSettingsStore";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import { useThemeColors } from "../hooks/useThemeColors";

export interface QuickFilter {
  tag: "nuevo" | "oferta";
  nonce: number;
}

export interface HomeOutletContext {
  query: string;
  quickFilter: QuickFilter | null;
}

export default function Layout() {
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const fetchPerfumes = usePerfumesStore((s) => s.fetchAll);

  useThemeColors();

  useEffect(() => {
    fetchSettings();
    fetchPerfumes();
  }, [fetchSettings, fetchPerfumes]);

  const scrollToResults = () => {
    const targetId = location.pathname.startsWith("/decants") ? "decants" : "catalogo";
    const run = () =>
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (location.pathname.startsWith("/decants") || location.pathname === "/" || location.pathname.startsWith("/producto/")) {
      requestAnimationFrame(run);
      return;
    }
    navigate("/");
    setTimeout(run, 80);
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (location.pathname.startsWith("/decants")) return;
    if (location.pathname !== "/") navigate("/");
  };

  const scrollToCatalog = () => {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!query.trim()) return;
    const t = window.setTimeout(scrollToResults, 350);
    return () => window.clearTimeout(t);
  }, [query]);

  const handleScrollToCatalog = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scrollToCatalog, 60);
    } else {
      scrollToCatalog();
    }
  };

  const handleQuickFilter = (tag: "nuevo" | "oferta") => {
    setQuickFilter({ tag, nonce: Date.now() });
    handleScrollToCatalog();
  };

  return (
    <div className="min-h-screen bg-stone text-ink">
      <Header
        query={query}
        onQueryChange={handleQueryChange}
        onSearch={scrollToResults}
        onScrollToCatalog={handleScrollToCatalog}
        onQuickFilter={handleQuickFilter}
      />
      <Outlet context={{ query, quickFilter } satisfies HomeOutletContext} />
      <Footer onScrollToCatalog={handleScrollToCatalog} onQuickFilter={handleQuickFilter} />
      <CartDrawer />
      <Toast />
      <WhatsAppFAB />
    </div>
  );
}
