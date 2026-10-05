import Link from "next/link";
import { SelectionRail } from "@/components/catalog/SelectionRail";
import { WaysIn } from "@/components/catalog/WaysIn";
import type { Product } from "@/lib/catalog/types";

// 03: THE SELECTION — the third screen, and the one that has to do the work (the owner's homepage
// correction, 24 September 2026).
//
// The launch owns the first two screens and no more. By the time a visitor reaches this one they
// should understand that DERMAL is a brand of several design families and that DESERT EYE is one of
// them. So the canvas here is DERMAL's own paper: no sand, no desert, no campaign environment and
// no oversized launch branding. Each family carries its own small detail close to its piece, and
// the page around it stays neutral.
//
// Every family stands on the same stage. Nothing about this section ranks them.
export function TheSelection({ products }: { products: Product[] }) {
  return (
    <section id="selection" aria-labelledby="collection-heading" data-testid="collection-section" className="collection-section selection-world">
      <div className="explore-head">
        <p className="label-xs">03 / The selection</p>
        <h2
          id="collection-heading"
          className="mt-5 font-display text-[clamp(2.5rem,5.6vw,6rem)] font-light uppercase leading-[0.96] tracking-[0.03em]"
        >
          The selection
        </h2>
        <p className="explore-lede" data-testid="explore-lede">
          Objects for the face. Seven distinct stories, from ancient symbols to a single line. Find the one that feels like yours.
        </p>
      </div>

      <SelectionRail products={products} />

      <div className="selection-cta">
        <Link href="/shop" className="text-link selection-cta-main" data-testid="explore-shop">
          View full collection <span aria-hidden="true">→</span>
        </Link>
        {/* The other ways in stay available, and stay quiet: this section is about the pieces. */}
        <WaysIn exclude={["/shop"]} />
      </div>
    </section>
  );
}
