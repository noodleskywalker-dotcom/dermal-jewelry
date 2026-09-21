import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import type { MascotMedia } from "@/lib/story/registry";
import { FormVisual } from "@/components/catalog/FormVisual";
import { Mascot } from "./Mascot";

// The landing page: a jewelry brand first. One calm screen on paper with two clear ways in, a small
// companion in the corner, and a quiet row of pieces. Nothing is pinned and nothing is driven by scroll.
export function Landing({ featured, products, mascot }: { featured: Product; products: Product[]; mascot: MascotMedia | null }) {
  return (
    <div className="story-light">
      <section aria-labelledby="landing-heading" className="landing-hero mx-auto grid max-w-[110rem] items-end gap-x-10 px-5 pt-10 sm:px-8 sm:pt-24 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:px-12 lg:pt-28">
        <div className="pb-10 lg:pb-24">
          <p className="label-xs text-ink/55">Facial jewelry · previewed on you</p>
          <h1 id="landing-heading" className="mt-5 max-w-[11ch] font-display text-6xl font-light leading-[0.95] sm:text-7xl lg:text-8xl">
            Jewelry for the face you chose.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-ink/60">Small, exact pieces for brow, cheek and nose. See one on your own face before anything else.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/face-studio" data-testid="cta-face" className="inline-flex min-h-12 items-center justify-center bg-ink px-8 text-xs uppercase tracking-[0.22em] text-ivory transition-colors duration-300 hover:bg-garnet">
              View on your face
            </Link>
            <Link href="/collections" data-testid="cta-selection" className="inline-flex min-h-12 items-center justify-center border border-ink px-8 text-xs uppercase tracking-[0.22em] transition-colors duration-300 hover:bg-ink hover:text-ivory">
              View selection
            </Link>
          </div>
        </div>

        <div className="relative pb-6 lg:pb-16">
          {mascot ? (
            <div className="ml-auto w-full max-w-[40rem]">
              <Mascot media={mascot} href={`/collections?family=${featured.slug}`} label={`Wake him and open ${featured.title}`} />
            </div>
          ) : (
            // A build has no character art. The featured piece stands here instead.
            <Link href={`/collections?family=${featured.slug}`} data-testid="landing-piece" aria-label={`Open ${featured.title}`} className="landing-float relative ml-auto block aspect-square w-full max-w-[26rem]">
              <FormVisual product={featured} filter="drop-shadow(0 18px 16px rgba(40,30,20,0.2)) drop-shadow(0 2px 2px rgba(40,30,20,0.3))" />
            </Link>
          )}
        </div>
      </section>

      <section aria-labelledby="teaser-heading" className="mx-auto max-w-[110rem] px-5 pb-24 pt-10 sm:px-8 lg:px-12">
        <div className="flex items-baseline justify-between gap-6 border-t border-ink/15 pt-6">
          <h2 id="teaser-heading" className="label-xs text-ink/55">
            The selection
          </h2>
          <Link href="/collections" className="text-link">
            View all <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {products.map((product, i) => (
            <li key={product.id} data-testid="teaser-piece">
              <Link href={`/collections?family=${product.slug}`} className="group block">
                <span className="landing-float relative mx-auto block aspect-square w-[62%]" style={{ animationDelay: `${i * -1.6}s` }}>
                  <FormVisual product={product} filter="drop-shadow(0 12px 10px rgba(40,30,20,0.2)) drop-shadow(0 2px 2px rgba(40,30,20,0.28))" />
                </span>
                <span className="mt-4 block text-center font-display text-xl font-light leading-tight">{product.title}</span>
                <span className="label-xs mt-1 block text-center text-ink/55">
                  {product.origin === "original" ? "Original" : "Anime-inspired"} · <span className="sr-only">Demo price </span>
                  {formatPrice(product.demoPrice, product.currency)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
