import { useOutletContext, useParams } from "react-router-dom";
import Hero from "../components/Hero";
import FeaturedRail from "../components/FeaturedRail";
import DecantsRail from "../components/DecantsRail";
import CatalogSection from "../components/CatalogSection";
import ProductDetailDrawer from "../components/ProductDetailDrawer";
import { usePerfumesStore } from "../hooks/usePerfumesStore";
import type { HomeOutletContext } from "../components/Layout";
import { scrollAppToId } from "../lib/scroll";

export default function Home() {
  const { query, quickFilter } = useOutletContext<HomeOutletContext>();
  const { id } = useParams();
  const items = usePerfumesStore((s) => s.items);
  const product = id ? items.find((p) => p.id === id) : undefined;

  const scrollToCatalog = () => scrollAppToId("catalogo");

  return (
    <>
      <Hero onExplore={scrollToCatalog} />
      <FeaturedRail onSeeAll={scrollToCatalog} />
      <CatalogSection query={query} quickFilter={quickFilter} />
      <DecantsRail />
      {product && <ProductDetailDrawer product={product} />}
    </>
  );
}
