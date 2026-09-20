"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/catalog";
import { site } from "@/lib/config/site";
import { windowProps } from "@/lib/motion/fade";
import { useReducedMotion, useScrollProgress } from "@/lib/motion/useScrollProgress";
import { ProductPieces } from "@/components/catalog/ProductArtwork";

// Chapter 01. One pinned frame: the pair rests in front of the wordmark on warm paper, then the
// scroll carries the camera into the red of the symbol until the frame turns dark.
export function HeroChapter({ product }: { product: Product }) {
  const reduced = useReducedMotion();
  const ref = useScrollProgress<HTMLElement>(!reduced);

  const opening = (
    <>
      <p className="label-xs text-ink/60">
        Collection {site.collection.number} — {site.collection.title}
      </p>
      <h1 className="mt-4 max-w-[13ch] font-display text-[clamp(2.1rem,3.6vw,3.4rem)] font-light leading-[1.02] text-ink">
        Jewelry for the face you chose.
      </h1>
      <Link href="/face-studio" className="text-link mt-5 text-ink">
        Enter Face Studio <span aria-hidden="true">↗</span>
      </Link>
    </>
  );

  const details = (
    <>
      <p className="label-xs text-ink/60">01 / 04 — The piece</p>
      <h2 className="mt-3 font-display text-[clamp(2rem,3.4vw,3.2rem)] font-light leading-none text-ink">{product.title}</h2>
      <p className="label-xs mt-4 text-ink/60">Demo {formatPrice(product.demoPrice, product.currency)}</p>
      <Link href={`/product/${product.slug}`} className="text-link mt-2 text-ink">
        View the piece <span aria-hidden="true">↗</span>
      </Link>
    </>
  );

  const wordmark = (
    <span aria-hidden="true" className="select-none font-sans text-[25vw] font-semibold leading-none tracking-[-0.04em] text-bone-deep">
      {site.brand}
    </span>
  );

  if (reduced) {
    return (
      <section id="piece" data-chapter="The piece" className="bg-bone text-ink">
        <div className="relative flex min-h-svh flex-col justify-end overflow-hidden px-5 pb-16 pt-28 sm:px-10">
          <div className="absolute inset-0 flex items-center justify-center">{wordmark}</div>
          <div className="absolute inset-0">
            <ProductPieces product={product} scale={0.34} shadow="soft" />
          </div>
          <div className="relative">{opening}</div>
        </div>
        <div className="grid gap-10 px-5 pb-24 sm:px-10 md:grid-cols-3">
          <div>{details}</div>
          <Callout index="A" title="Upper, outer" body="Openwork symbol with a deep-red accent." />
          <Callout index="B" title="Lower, inner" body="Small deep-red faceted gemstone." />
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="piece" data-chapter="The piece" className="chapter h-[340vh] bg-bone text-ink">
      <div className="chapter-stage">
        {/* Wordmark sits behind the object and recedes first. */}
        <div
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{ transform: "scale(calc(1 + var(--p) * 0.9))", opacity: "clamp(0, calc(1 - var(--p) * 5), 1)" }}
        >
          {wordmark}
        </div>

        {/* The object. First a slow push-in that keeps both pieces in frame, then a dive into the red
            of the symbol. No will-change here: the browser must redraw the vector art sharply at each size. */}
        <div
          className="absolute left-1/2 top-1/2 aspect-square w-[min(58vh,78vw)] -translate-x-1/2 -translate-y-1/2"
          style={{
            transform:
              "scale(calc(1 + clamp(0, calc((var(--p) - 0.6) / 0.4), 1) * clamp(0, calc((var(--p) - 0.6) / 0.4), 1) * 70))",
            // Where the symbol sits after the first push-in, as a share of this box.
            transformOrigin: "98.8% 17.4%",
          }}
        >
          <div className="absolute inset-0" style={{ transform: "scale(calc(1 + clamp(0, calc((var(--p) - 0.06) / 0.24), 1) * 1.2))" }}>
            <ProductPieces product={product} scale={0.74} shadow="none" />
          </div>
        </div>

        {/* The frame goes dark as the camera passes through. */}
        <div className="absolute inset-0 bg-ink" style={{ opacity: "clamp(0, calc((var(--p) - 0.82) * 7), 1)" }} />

        <div className="absolute bottom-[12svh] left-5 sm:left-10" {...windowProps(-1, -0.5, 0.04, 0.13)}>
          {opening}
        </div>

        <div className="absolute left-5 top-[22svh] sm:left-10" {...windowProps(0.26, 0.34, 0.54, 0.62)}>
          {details}
        </div>
        <div className="absolute right-5 top-[16svh] max-w-[15rem] text-right sm:right-[9vw]" {...windowProps(0.3, 0.38, 0.54, 0.62)}>
          <Callout index="A" title="Upper, outer" body="Openwork symbol with a deep-red accent." />
        </div>
        <div className="absolute bottom-[10svh] left-5 max-w-[15rem] sm:left-[30vw]" {...windowProps(0.34, 0.42, 0.54, 0.62)}>
          <Callout index="B" title="Lower, inner" body="Small deep-red faceted gemstone." />
        </div>

        <p
          className="label-xs absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-ink/60"
          {...windowProps(-1, -0.5, 0.02, 0.08)}
        >
          Scroll to go closer
          <span className="block h-8 w-px bg-ink/40" />
        </p>
      </div>
    </section>
  );
}

function Callout({ index, title, body }: { index: string; title: string; body: string }) {
  return (
    <div>
      <p className="label-xs text-ink/60">
        {index} — {title}
      </p>
      <p className="mt-2 font-display text-xl font-light leading-snug text-ink">{body}</p>
    </div>
  );
}
