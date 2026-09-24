import Link from "next/link";
import { BrowseRail } from "@/components/catalog/BrowseRail";
import type { Product } from "@/lib/catalog/types";

// 07: the turn out of the launch and into the brand (the owner's rebalance, 24 September 2026).
// Everything above this belongs to DESERT EYE. From here the page says plainly that DESERT EYE is
// the current launch and not the company, and hands the visitor the whole collection on one
// even-handed rail. The counts are read from the catalogue, so the page never claims a piece that
// does not exist, and the concept is named as a concept.
export function ExploreDermal({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="collection-heading" data-testid="collection-section" className="collection-section">
      <div className="explore-head">
        <p className="label-xs">07 / The collection</p>
        <h2
          id="collection-heading"
          className="mt-5 font-display text-[clamp(2.5rem,5.6vw,6rem)] font-light uppercase leading-[0.96] tracking-[0.03em]"
        >
          Explore DERMAL
        </h2>
        <p className="explore-lede" data-testid="explore-lede">
          DESERT EYE is the current launch. It is one collection inside DERMAL: {products.length} design families and one
          concept still being drawn, original work beside anime-inspired work. An inspired design is an influence, never
          an official collaboration.
        </p>
        <div className="explore-links">
          <Link href="/shop" className="text-link" data-testid="explore-shop">
            Shop the collection <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/collections" className="text-link" data-testid="explore-selection">
            The selection <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <BrowseRail products={products} />
    </section>
  );
}
