import { CollectionSection, EndingSection, HeroSection, PieceSection, StudioSection } from "@/components/home/HomeSections";
import { catalog } from "@/lib/catalog";

// A normal, vertically scrolling page: campaign opening, the featured design family, a Face Studio
// demonstration, the pieces, and a close.
export default function HomePage() {
  const products = catalog.listProducts();
  const featured = products[0];
  const antiEyebrow = products.filter((p) => p.forms.some((f) => f.id === "anti-eyebrow" && f.status === "available"));
  return (
    <>
      <HeroSection product={featured} />
      <PieceSection product={featured} />
      <StudioSection products={antiEyebrow} />
      <CollectionSection products={products} />
      <EndingSection />
    </>
  );
}
