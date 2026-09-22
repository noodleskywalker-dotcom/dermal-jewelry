import Link from "next/link";
import { displayTitle, formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import type { MascotMedia } from "@/lib/story/registry";
import { FloatingObject } from "@/components/catalog/FloatingObject";
import { DepthField } from "@/components/motion/DepthField";
import { SandLayer } from "@/components/story/SandLayer";
import { Mascot } from "./Mascot";

// Where each piece floats on a wide screen, in percent of the field, with its size and depth. The
// first is the hero: one large piece, right of the headline. The others are small and secondary.
const SPOTS = [
  { x: 68, y: 44, size: 30, depth: 1 },
  { x: 90, y: 22, size: 6.5, depth: 1.8 },
  { x: 92, y: 70, size: 7, depth: 0.6 },
  { x: 52, y: 82, size: 6.5, depth: 1.4 },
];

// The landing page. One headline, two ways in, one large piece of jewelry on a great deal of paper,
// three small ones behind it, and a small companion resting in the corner. No tagline and no marketing copy.
export function Landing({ products, featured, mascot }: { featured: Product; products: Product[]; mascot: MascotMedia | null }) {
  return (
    <DepthField testId="landing" className="landing relative mx-auto max-w-[120rem] overflow-x-clip px-6 sm:px-10 lg:px-16">
      <section aria-labelledby="landing-heading" className="relative grid min-h-[calc(100svh-4rem)] content-between gap-y-10 pb-8 pt-10 lg:block lg:pb-0 lg:pt-0">
        <div className="relative z-10 lg:absolute lg:left-0 lg:top-[26%] lg:max-w-[44rem]">
          <h1 id="landing-heading" className="font-display text-[clamp(3.25rem,7.2vw,7.5rem)] font-light leading-[0.98] tracking-[-0.01em]">
            Jewelry for the face you chose.
          </h1>
          <div className="mt-10 flex flex-wrap gap-3 lg:mt-14">
            <Link href="/face-studio" data-testid="cta-face" className="btn-solid">
              View on your face
            </Link>
            <Link href="/collections" data-testid="cta-selection" className="btn-line">
              View selection
            </Link>
          </div>
        </div>

        {/* Jewelry in space. On a wide screen the hero has the right of the page and the small pieces their own
            depth; on a phone the hero sits under the actions with the small pieces in a row beside it. */}
        <ul aria-label="Pieces" className="landing-objects pointer-events-none relative z-[5] flex items-end justify-between gap-4 lg:absolute lg:inset-0 lg:block">
          {[featured, ...products.filter((p) => p.id !== featured.id)].slice(0, SPOTS.length).map((product, i) => {
            const spot = SPOTS[i];
            const hero = i === 0;
            return (
              <li
                key={product.id}
                data-testid="teaser-piece"
                data-hero={hero || undefined}
                data-object-host
                className="landing-object group pointer-events-auto"
                style={{ "--x": `${spot.x}%`, "--y": `${spot.y}%`, "--size": `${spot.size}vw` } as React.CSSProperties}
              >
                <Link href={`/collections?family=${product.slug}`} className="block" aria-label={`${product.title}, ${product.origin === "original" ? "original design" : "anime-inspired design"}`}>
                  <span className="relative block aspect-square w-full">
                    <FloatingObject product={product} depth={spot.depth} delay={i * -1.7} reflection={hero} />
                  </span>
                  <span className="landing-object-label">
                    <span className="block font-display text-lg font-light leading-tight">{displayTitle(product.title)}</span>
                    <span className="label-xs mt-1 block text-ash max-lg:sr-only">
                      {product.origin === "original" ? "Original" : "Anime-inspired"} · <span className="sr-only">Demo price </span>
                      {formatPrice(product.demoPrice, product.currency)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* The companion belongs to DESERT EYE, so a little of that collection's sand comes with him, and only here.
            No z-index on this block: a stacking context would isolate the figure's multiply blend from the paper. */}
        {mascot && (
          // A small discovery in the corner, not the identity of the page.
          <div className="landing-mascot relative ml-auto w-[min(34vw,11rem)] lg:absolute lg:bottom-[4%] lg:right-[1%] lg:w-[min(13vw,13rem)]">
            <SandLayer className="landing-sand" />
            <Mascot media={mascot} href={`/collections?family=${featured.slug}`} label={`Wake him and open ${featured.title}`} />
          </div>
        )}
      </section>
    </DepthField>
  );
}
