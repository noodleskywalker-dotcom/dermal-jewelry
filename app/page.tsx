import { AssemblySection } from "@/components/home/AssemblySection";
import { CinemaHero } from "@/components/home/CinemaHero";
import { DesertWorld } from "@/components/home/DesertWorld";
import { FinalCta } from "@/components/home/FinalCta";
import { FormsStage } from "@/components/home/FormsStage";
import { LaunchHero } from "@/components/home/LaunchHero";
import { MacroDetail } from "@/components/home/MacroDetail";
import { MacroScrub } from "@/components/home/MacroScrub";
import { PieceStory } from "@/components/home/PieceStory";
import { SeeItOnYou } from "@/components/home/SeeItOnYou";
import { BrowseRail } from "@/components/catalog/BrowseRail";
import { catalog } from "@/lib/catalog";
import { internalCompanionStill, isInternalReview } from "@/lib/story/registry";

const CINEMA = "/media/cinema";

// The homepage as a short film you walk into (the owner's cinematic direction, 22 September 2026):
// the piece in low light; the piece turned; the dunes; the small reader of the dunes; closer and
// closer into the stone; what the piece means; the assembly; the forms; on you; the ways in; the
// last frame. Media is generated from the exact approved product frame; nothing redraws the jewelry.
export default function HomePage() {
  const products = catalog.listProducts();
  const featured = products[0];
  return (
    <>
      <CinemaHero
        poster={`${CINEMA}/hero-poster.jpg`}
        sources={[
          { src: `${CINEMA}/hero.webm`, type: "video/webm" },
          { src: `${CINEMA}/hero.mp4`, type: "video/mp4" },
        ]}
      />
      <LaunchHero frames={{ dir: `${CINEMA}/orbit`, count: 72, poster: `${CINEMA}/orbit/poster.jpg` }} />
      <DesertWorld
        poster={`${CINEMA}/sand-poster.jpg`}
        companion={internalCompanionStill(isInternalReview())}
        sand={[
          { src: `${CINEMA}/sand.webm`, type: "video/webm" },
          { src: `${CINEMA}/sand.mp4`, type: "video/mp4" },
        ]}
      />
      <MacroScrub dir={`${CINEMA}/macro`} count={64} />
      <MacroDetail src={`${CINEMA}/piece-4k.jpg`} />
      <PieceStory still={`${CINEMA}/piece-4k.jpg`} />
      <AssemblySection product={featured} />
      <FormsStage product={featured} still={`${CINEMA}/piece-4k.jpg`} />
      <SeeItOnYou product={featured} />
      <section aria-labelledby="collection-heading" data-testid="collection-section" className="collection-section">
        <div className="mx-auto max-w-[120rem] px-6 sm:px-10 lg:px-16">
          <p className="label-xs">07 / Collections</p>
          <h2 id="collection-heading" className="sr-only">The collections</h2>
        </div>
        <BrowseRail products={products} />
      </section>
      <FinalCta still={`${CINEMA}/hero-final.jpg`} shopHref="/collections" />
    </>
  );
}
