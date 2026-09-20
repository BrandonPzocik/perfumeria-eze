import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import Toast from "./Toast";
import WhatsAppFAB from "./WhatsAppFAB";
import { useSettingsStore } from "../hooks/useSettingsStore";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import { useThemeColors } from "../hooks/useThemeColors";
import { scrollAppToId } from "../lib/scroll";

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

  const onResultsPage =
    location.pathname === "/" ||
    location.pathname.startsWith("/producto/") ||
    location.pathname.startsWith("/decants");

  const scrollToResults = useCallback(() => {
    const targetId = location.pathname.startsWith("/decants") ? "decants" : "catalogo";
    const run = () => scrollAppToId(targetId);
    if (onResultsPage) {
      requestAnimationFrame(run);
      return;
    }
    navigate("/");
    setTimeout(run, 120);
  }, [location.pathname, navigate, onResultsPage]);

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (location.pathname.startsWith("/decants")) return;
    if (location.pathname !== "/") navigate("/");
  };

  const scrollToCatalog = () => scrollAppToId("catalogo");

  useEffect(() => {
    if (!query.trim()) return;
    const t = window.setTimeout(scrollToResults, 350);
    return () => window.clearTimeout(t);
  }, [query, scrollToResults]);

  const handleScrollToCatalog = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scrollToCatalog, 120);
    } else {
      scrollToCatalog();
    }
  };

  const handleQuickFilter = (tag: "nuevo" | "oferta") => {
    setQuickFilter({ tag, nonce: Date.now() });
    handleScrollToCatalog();
  };

  return (
    <div className="h-full bg-stone text-ink flex flex-col overflow-hidden">
      <Header
        query={query}
        onQueryChange={handleQueryChange}
        onSearch={scrollToResults}
        onScrollToCatalog={handleScrollToCatalog}
        onQuickFilter={handleQuickFilter}
      />
      <div id="app-scroll" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain">
        <Outlet context={{ query, quickFilter } satisfies HomeOutletContext} />
        <Footer onScrollToCatalog={handleScrollToCatalog} onQuickFilter={handleQuickFilter} />
      </div>
      <CartDrawer />
      <Toast />
      <WhatsAppFAB />
    </div>
  );
}
