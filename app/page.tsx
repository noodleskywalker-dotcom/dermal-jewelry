import { Landing } from "@/components/home/Landing";
import { catalog } from "@/lib/catalog";
import { internalMascotMedia, isInternalReview } from "@/lib/story/registry";

// A calm landing page on paper: two ways in, a small companion, a quiet row of pieces.
// The mascot is internal concept art, so only a development server has it; a build shows jewelry there.
export default function HomePage() {
  const products = catalog.listProducts();
  return <Landing featured={products[0]} products={products} mascot={internalMascotMedia(isInternalReview())} />;
}
