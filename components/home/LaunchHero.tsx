import Image from "next/image";
import Link from "next/link";
import type { ProductRender } from "@/lib/catalog/types";

/** The current two-top design, presented as a still until accurate motion media exists. */
export function LaunchHero({ render }: { render?: ProductRender }) {
  if (!render) return null;
  return (
    <section id="reveal" aria-labelledby="launch-story-heading" data-testid="scrub-hero" data-mode="still" className="launch-editorial">
      <div className="launch-editorial-copy">
        <p className="label-xs">02 / A feeling, given form</p>
        <h2 id="launch-story-heading">A mark.<br /><em>A pulse.</em></h2>
        <p>The openwork love symbol and a deep-red stone. Two separate tops, held in a measured diagonal. A small expression with a story of its own.</p>
        <Link href="/product/desert-eye-love#design-story" className="text-link">Explore DESERT EYE <span aria-hidden="true">↗</span></Link>
      </div>
      <figure>
        <Image src={render.hero.src} width={render.hero.width} height={render.hero.height} alt={render.alt} sizes="(max-width: 760px) 90vw, 55vw" data-testid="launch-product-image" />
        <figcaption className="label-xs">DESERT EYE — LOVE / AI design study</figcaption>
      </figure>
    </section>
  );
}
