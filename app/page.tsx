import { AssemblySection } from "@/components/home/AssemblySection";
import { CinemaHero } from "@/components/home/CinemaHero";
import { DesertWorld } from "@/components/home/DesertWorld";
import { ExploreDermal } from "@/components/home/ExploreDermal";
import { FinalCta } from "@/components/home/FinalCta";
import { FormsStage } from "@/components/home/FormsStage";
import { LaunchHero } from "@/components/home/LaunchHero";
import { MacroDetail } from "@/components/home/MacroDetail";
import { MacroScrub } from "@/components/home/MacroScrub";
import { PieceStory } from "@/components/home/PieceStory";
import { SeeItOnYou } from "@/components/home/SeeItOnYou";
import { catalog } from "@/lib/catalog";
import { internalCompanionStill, isInternalReview } from "@/lib/story/registry";

const CINEMA = "/media/cinema";

// The homepage as a short film you walk into (the owner's cinematic direction, 22 September 2026):
// the piece in low light; the piece turned; the dunes; the small reader of the dunes; closer and
// closer into the stone; what the piece means; the assembly; the forms; on you; the ways in; the
// last frame. Media is generated from the exact approved product frame; nothing redraws the jewelry.
//
// The launch owns the opening, and only the opening: after ON YOU the page turns into EXPLORE DERMAL
// and hands the visitor the whole collection on an even-handed rail (the owner's rebalance,
// 24 September 2026).
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
      <ExploreDermal products={products} />
      <FinalCta still={`${CINEMA}/hero-final.jpg`} shopHref="/collections" />
    </>
  );
}
