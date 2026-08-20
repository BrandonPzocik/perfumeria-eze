import { useOutletContext, useParams } from "react-router-dom";
import Hero from "../components/Hero";
import FeaturedRail from "../components/FeaturedRail";
import CatalogSection from "../components/CatalogSection";
import ProductDetailDrawer from "../components/ProductDetailDrawer";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import type { HomeOutletContext } from "../components/Layout";

export default function Home() {
  const { query, quickFilter } = useOutletContext<HomeOutletContext>();
  const { id } = useParams();
  const items = usePerfumesStore((s) => s.items);
  const product = id ? items.find((p) => p.id === id) : undefined;

  const scrollToCatalog = () => {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Hero onExplore={scrollToCatalog} />
      <FeaturedRail onSeeAll={scrollToCatalog} />
      <CatalogSection query={query} quickFilter={quickFilter} />
      {product && <ProductDetailDrawer product={product} />}
    </>
  );
}
