import { CinemaHero } from "@/components/home/CinemaHero";
import { FinalCta } from "@/components/home/FinalCta";
import { LaunchHero } from "@/components/home/LaunchHero";
import { SeeItOnYou } from "@/components/home/SeeItOnYou";
import { TheSelection } from "@/components/home/TheSelection";
import { catalog } from "@/lib/catalog";

const CINEMA = "/media/cinema";

// The homepage, resequenced on the owner's correction of 24 September 2026.
//
// The complaint was that a visitor spent the first several screens inside the DESERT EYE world and
// came away thinking the whole brand was built around it. So the launch now owns the opening and
// nothing after it:
//
//   01  the piece in low light — the DESERT EYE launch
//   02  the piece turned — one concise reveal, and that is the last of the launch
//   03  THE SELECTION — every design family on the same stage, on DERMAL's own paper
//   04  on you — Face Studio
//   05  (reserved: the Custom Atelier introduction, not built)
//   06  the last frame
//
// CRAFTED IN SAND, the macro push-in, the meaning, the assembly and the forms stage were taken off
// this page. Their components and media are untouched and still in the repository: the owner may
// move that storytelling into /product/desert-eye-love, which is a separate change and not this one.
// Nothing is duplicated across the two pages.
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
      <TheSelection products={products} />
      <SeeItOnYou product={featured} />
      <FinalCta still={`${CINEMA}/hero-final.jpg`} shopHref="/collections" />
    </>
  );
}
