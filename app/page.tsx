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
          // Placeholder: the assembly beats of the approved product animation, until the hero orbit is made.
          dir: "/media/product-animation/desert-eye-love/scrub",
          count: 48,
          poster: "/media/product-animation/desert-eye-love/scrub-poster.jpg",
          source: "Prototype product animation · concept hardware · scroll to turn",
        }}
      />
      <StorySection still="/media/product-animation/desert-eye-love/story-sand.jpg" href="/collections/desert-eye" />
      <AssemblySection product={featured} />
    </>
  );
}
