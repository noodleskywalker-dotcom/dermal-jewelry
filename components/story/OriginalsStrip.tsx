import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { site } from "@/lib/config/site";
import { ProductPieces } from "@/components/catalog/ProductArtwork";

// What follows a story-driven stage. DERMAL is a jewelry brand with original designs beside its
// anime-inspired ones, and a story page must not suggest otherwise. Its first row sits just inside
// the first screen, so the page visibly continues.
//
// A concept that has no artwork yet is shown as words only. Nothing is drawn for it, priced or sold.
export function OriginalsStrip({ id, products }: { id: string; products: Product[] }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} data-testid="originals-strip" className="scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-[110rem] px-5 sm:px-8 lg:px-12">
        <div className="flex min-h-[5.5rem] items-center justify-between gap-6 border-b border-line">
          <p className="label-xs text-ash">Also at {site.brand}</p>
          <h2 id={`${id}-heading`} className="font-display text-2xl font-light sm:text-3xl">
            Original designs
          </h2>
          {/* The wrapper owns the breakpoint, because the link class already sets a display value. */}
          <span className="hidden sm:block">
            <Link href="/collections/originals" className="text-link">
              Collection 002 <span aria-hidden="true">↗</span>
            </Link>
          </span>
        </div>

        <ul className="grid gap-x-10 gap-y-14 py-16 sm:grid-cols-2 lg:grid-cols-3 lg:py-24">
          {site.concepts.map((concept) => (
            <li key={concept.name} data-testid="concept-entry" className="flex min-h-[16rem] flex-col justify-between border-t border-line pt-5">
              <p className="label-xs text-ash">
                {concept.kind} / {concept.status}
              </p>
              <div>
                <p className="font-display text-6xl font-light leading-none tracking-[0.08em] sm:text-7xl">{concept.name}</p>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-ash">{concept.note}</p>
              </div>
            </li>
          ))}
          {products.map((product) => (
            <li key={product.id} className="border-t border-line pt-5">
              <Link href={`/product/${product.slug}`} className="group block">
                <p className="label-xs text-ash">Original / Concept artwork</p>
                <div className="relative mt-2 aspect-[5/3] w-full transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:-translate-y-1">
                  <ProductPieces product={product} scale={0.22} shadow="soft" />
                </div>
                <span className="flex items-baseline justify-between gap-4">
                  <span className="font-display text-3xl font-light leading-tight">{product.title}</span>
                  <span className="min-w-0 text-right text-sm text-ash">
                    <span className="sr-only">Demo price </span>
                    {formatPrice(product.demoPrice, product.currency)} · Demo
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
