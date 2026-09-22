import { AssemblySection } from "@/components/home/AssemblySection";
import { CraftedInSand } from "@/components/home/CraftedInSand";
import { FinalCta } from "@/components/home/FinalCta";
import { FormsStage } from "@/components/home/FormsStage";
import { LaunchHero } from "@/components/home/LaunchHero";
import { MacroDetail } from "@/components/home/MacroDetail";
import { SeeItOnYou } from "@/components/home/SeeItOnYou";
import { BrowseRail } from "@/components/catalog/BrowseRail";
import { catalog } from "@/lib/catalog";

const ORBIT = "/media/hero-orbit/desert-eye-love";
const FILM = "/media/product-animation/desert-eye-love";

// The homepage unfolds like a launch film (the owner's flow of 22 September 2026): the piece turned
// by scroll with the headline, crafted in sand, material detail, the assembly, the forms, on you,
// the collection, and a last frame. Normal scrolling between the moments. The mascot is internal
// concept art, so only a development server has it.
export default function HomePage() {
  const products = catalog.listProducts();
  const featured = products[0];
  return (
    <>
      <LaunchHero frames={{ dir: ORBIT, count: 72, poster: `${ORBIT}/poster.jpg` }} />
      <CraftedInSand still={`${FILM}/story-sand.jpg`} href="/collections/desert-eye" />
      <MacroDetail dir={ORBIT} />
      <AssemblySection product={featured} />
      <FormsStage product={featured} still={`${ORBIT}/f-001.jpg`} />
      <SeeItOnYou product={featured} />
      <section aria-labelledby="collection-heading" data-testid="collection-section" className="collection-section">
        <div className="mx-auto max-w-[120rem] px-6 sm:px-10 lg:px-16">
          <p className="label-xs">07 / COLLECTIONS</p>
          <h2 id="collection-heading" className="sr-only">The collections</h2>
        </div>
        <BrowseRail products={products} />
      </section>
      <FinalCta still={`${ORBIT}/f-060.jpg`} shopHref="/collections" />
    </>
  );
}
