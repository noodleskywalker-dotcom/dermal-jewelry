"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { site } from "@/lib/config/site";
import { useReveal } from "@/lib/motion/useScrollProgress";
import { ProductPieces } from "@/components/catalog/ProductArtwork";
import { FormVisual } from "@/components/catalog/FormVisual";
import { ProductGrid } from "@/components/catalog/ProductGrid";

// The homepage scrolls like any page. Nothing is pinned and the wheel is never taken over:
// sections simply ease in as they arrive, and do nothing at all under reduced motion.

export function HeroSection({ product }: { product: Product }) {
  return (
    <section id="top" className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-bone px-5 pb-14 pt-28 text-ink sm:px-10">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-sans text-[25vw] font-semibold leading-none tracking-[-0.04em] text-bone-deep"
      >
        {site.brand}
      </span>
      <div className="absolute left-1/2 top-[46%] aspect-square w-[min(58vh,78vw)] -translate-x-1/2 -translate-y-1/2">
        <ProductPieces product={product} scale={0.74} shadow="soft" />
      </div>
      <div className="relative">
        <p className="label-xs text-ink/60">Facial jewelry · original and anime-inspired designs</p>
        <h1 className="mt-4 max-w-[13ch] font-display text-[clamp(2.1rem,3.6vw,3.4rem)] font-light leading-[1.02]">
          Jewelry for the face you chose.
        </h1>
        <div className="mt-5 flex flex-wrap gap-x-8">
          <Link href="/face-studio" className="text-link">
            Enter Face Studio <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/shop" className="text-link">
            Shop all pieces <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PieceSection({ product }: { product: Product }) {
  const ref = useReveal<HTMLElement>();
  const form = product.forms.find((f) => f.id === product.defaultFormId)!;
  return (
    <section ref={ref} id="piece" className="bg-ink px-5 py-24 text-ivory sm:px-10 sm:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="reveal relative aspect-square w-full max-w-[44rem]">
          <ProductPieces product={product} scale={0.9} shadow="dark" />
        </div>
        <div>
          <p className="label-xs reveal text-ash">Featured design family</p>
          <h2 className="reveal mt-4 font-display text-[clamp(2.4rem,4.4vw,4.2rem)] font-light leading-none" style={{ "--delay": "80ms" } as React.CSSProperties}>
            {product.title}
          </h2>
          <dl className="reveal mt-10 space-y-6" style={{ "--delay": "160ms" } as React.CSSProperties}>
            <div>
              <dt className="label-xs text-ash">A — Upper, outer</dt>
              <dd className="mt-2 font-display text-2xl font-light">Openwork symbol with a deep-red accent.</dd>
            </div>
            <div>
              <dt className="label-xs text-ash">B — Lower, inner</dt>
              <dd className="mt-2 font-display text-2xl font-light">Small deep-red faceted gemstone.</dd>
            </div>
          </dl>
          <p className="label-xs reveal mt-10 text-ash" style={{ "--delay": "240ms" } as React.CSSProperties}>
            {product.forms.map((f) => `${f.label}${f.status === "available" ? "" : " (concept pending)"}`).join(" · ")}
          </p>
          <p className="label-xs reveal mt-2 text-ash" style={{ "--delay": "240ms" } as React.CSSProperties}>
            From demo {formatPrice(Math.min(...product.forms.filter((f) => f.status === "available").map((f) => f.demoPrice)), product.currency)} ·{" "}
            {form.label} shown
          </p>
          <Link href={`/product/${product.slug}`} className="text-link reveal mt-6" style={{ "--delay": "320ms" } as React.CSSProperties}>
            View the design family <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Face Studio is shown rather than described: the visitor changes the piece on a line drawing. */
export function StudioSection({ products }: { products: Product[] }) {
  const ref = useReveal<HTMLElement>();
  const [index, setIndex] = useState(0);
  const product = products[index];
  return (
    <section ref={ref} id="studio" className="bg-bone px-5 py-24 text-ink sm:px-10 sm:py-32">
      <div className="reveal mx-auto max-w-6xl">
        <div className="relative aspect-[3/2] w-full">
          <svg viewBox="0 0 1200 800" className="absolute inset-0 h-full w-full" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
            <defs>
              <clipPath id="eye-opening">
                <path d="M330 400 C430 300 640 300 780 410 C650 480 450 470 330 400 Z" />
              </clipPath>
            </defs>
            <g strokeWidth="2.2" opacity="0.9">
              <path d="M290 262 C420 176 640 172 812 268" strokeWidth="7" opacity="0.85" />
              <path d="M360 362 C460 286 630 290 752 372" opacity="0.45" />
              <path d="M330 400 C430 300 640 300 780 410" strokeWidth="4" />
              <path d="M330 400 C450 470 650 480 780 410" />
              <path d="M780 410 C832 396 872 372 902 344" strokeWidth="4" />
              <g clipPath="url(#eye-opening)">
                <circle cx="555" cy="390" r="66" />
                <circle cx="555" cy="390" r="25" fill="currentColor" stroke="none" />
                <circle cx="577" cy="370" r="7" fill="#e7e2d8" stroke="none" />
              </g>
              <path d="M236 330 C214 450 206 546 262 604" opacity="0.4" />
              <path d="M972 180 C1024 372 1002 566 906 730" opacity="0.4" />
            </g>
          </svg>
          {/* Same layout function as the real renderer, anchored below and outside the eye. */}
          <div key={product.id} data-testid="studio-demo-piece" data-product={product.slug} className="fade-in absolute aspect-square w-[9%]" style={{ left: "70.5%", top: "54%" }}>
            <FormVisual product={product} />
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-10">
        <div>
          <h2 className="reveal font-display text-[clamp(2.2rem,3.8vw,3.6rem)] font-light leading-[1.02]">Try it on your face.</h2>
          <p className="label-xs reveal mt-5 leading-relaxed text-ink/60">
            Upload once.
            <br />
            Explore everything.
          </p>
          <Link href="/face-studio" className="text-link reveal mt-4">
            Enter Face Studio <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="reveal">
          <p className="label-xs text-ink/60">Change the piece</p>
          <div className="mt-2 flex flex-wrap gap-x-6">
            {products.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
                className={`min-h-11 border-b font-display text-xl font-light ${i === index ? "border-ink" : "border-transparent text-ink/55 hover:text-ink"}`}
              >
                {p.title}
              </button>
            ))}
          </div>
          <p className="label-xs mt-4 max-w-[20rem] leading-relaxed text-ink/60">
            Illustration. In the Studio you use your own photo, and it never leaves your device.
          </p>
        </div>
      </div>
    </section>
  );
}

export function CollectionSection({ products }: { products: Product[] }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="collection" className="bg-ink px-5 py-24 text-ivory sm:px-10 sm:py-32">
      <div className="reveal flex flex-wrap items-end justify-between gap-6">
        <h2 className="font-display text-[clamp(3rem,8vw,8rem)] font-light leading-[0.9]">
          The <em>pieces</em>
        </h2>
        <p className="label-xs max-w-[22rem] leading-relaxed text-ash">
          Original designs and anime-inspired designs, side by side. Demo prices. Materials and dimensions are published once verified.
        </p>
      </div>
      <div className="reveal mt-16">
        <ProductGrid products={products} />
      </div>
      <p className="label-xs reveal mt-14 text-ash">Hover or tab to a piece to preview it on your photo. On a phone, use Try on.</p>
    </section>
  );
}

export function EndingSection() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="enter" className="flex min-h-[80svh] flex-col justify-between gap-16 bg-bone px-5 py-24 text-ink sm:px-10">
      <p className="font-display text-[clamp(3rem,9.5vw,10rem)] font-light leading-[0.95]">
        {["Your face.", "Your placement.", "Your piece."].map((line, i) => (
          <span key={line} className={`reveal block ${i === 2 ? "italic text-garnet" : ""}`} style={{ "--delay": `${i * 140}ms` } as React.CSSProperties}>
            {line}
          </span>
        ))}
      </p>
      <div className="reveal flex flex-wrap items-end justify-between gap-8" style={{ "--delay": "480ms" } as React.CSSProperties}>
        <Link href="/face-studio" className="text-link">
          Enter Face Studio <span aria-hidden="true">↗</span>
        </Link>
        <p className="label-xs max-w-[20rem] leading-relaxed text-ink/60">
          No account and no photo are needed to shop. The preview is approximate and is not a fitting.
        </p>
      </div>
    </section>
  );
}
