import { AssemblySection } from "@/components/home/AssemblySection";
import { Landing } from "@/components/home/Landing";
import { ScrubHero } from "@/components/home/ScrubHero";
import { StorySection } from "@/components/home/StorySection";
import { catalog } from "@/lib/catalog";
import { internalMascotMedia, isInternalReview } from "@/lib/story/registry";

// The homepage scrolls normally: the landing, one scrubbed cinematic moment, three words of story,
// and the piece assembled. The mascot is internal concept art, so only a development server has it.
export default function HomePage() {
  const products = catalog.listProducts();
  const featured = products[0];
  return (
    <>
      <Landing featured={featured} products={products} mascot={internalMascotMedia(isInternalReview())} />
      <ScrubHero
        href={`/product/${featured.slug}`}
        frames={{
          // MEDIA 01, the approved hero orbit (22 September 2026): one full turn in 72 stills.
          // The rear of the piece in it is conceptual, never a manufacturing reference.
          dir: "/media/hero-orbit/desert-eye-love",
          count: 72,
          poster: "/media/hero-orbit/desert-eye-love/poster.jpg",
          source: "Prototype product orbit · concept hardware · scroll to turn",
        }}
      />
      <StorySection still="/media/product-animation/desert-eye-love/story-sand.jpg" href="/collections/desert-eye" />
      <AssemblySection product={featured} />
    </>
  );
}
