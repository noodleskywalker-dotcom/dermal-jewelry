"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice, placementLabel } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { site } from "@/lib/config/site";
import { useReducedMotion, useScrollProgress } from "@/lib/motion/useScrollProgress";
import { ProductPieces } from "@/components/catalog/ProductArtwork";
import { TryOnPreview } from "@/components/catalog/TryOnPreview";
import { Modal } from "@/components/layout/Modal";

// Chapter 03. Vertical scroll drives a horizontal sequence. Objects sit directly on the paper at
// alternating scales with an oversized index numeral, instead of a grid of cards.
const LAYOUT = [
  { width: "md:w-[46vw]", scale: 0.5, align: "md:self-start md:pt-[14svh]" },
  { width: "md:w-[34vw]", scale: 0.42, align: "md:self-end md:pb-[10svh]" },
  { width: "md:w-[40vw]", scale: 0.4, align: "md:self-start md:pt-[20svh]" },
  { width: "md:w-[34vw]", scale: 0.34, align: "md:self-end md:pb-[14svh]" },
];

const OPEN_DELAY_MS = 220;
const CLOSE_DELAY_MS = 160;

export function CollectionChapter({ products }: { products: Product[] }) {
  const reduced = useReducedMotion();
  const ref = useScrollProgress<HTMLElement>(!reduced);
  const trackRef = useRef<HTMLDivElement>(null);
  const [sheetProduct, setSheetProduct] = useState<Product | null>(null);
  const [paneProduct, setPaneProduct] = useState<Product | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The horizontal travel is measured from the real track width, so it stays right at any size.
  useEffect(() => {
    const section = ref.current;
    const track = trackRef.current;
    if (!section || !track || reduced) return;
    const measure = () => section.style.setProperty("--shift", `${Math.max(0, track.scrollWidth - window.innerWidth)}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref, reduced]);

  const schedule = (product: Product | null, delay: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPaneProduct(product), delay);
  };

  /** Keyboard focus must bring an off-screen object into the frame by scrolling the page. */
  const bringIntoFrame = (item: HTMLElement) => {
    const section = ref.current;
    const track = trackRef.current;
    if (!section || !track || reduced) return;
    const shift = track.scrollWidth - window.innerWidth;
    if (shift <= 0) return;
    const target = Math.min(1, Math.max(0, (item.offsetLeft + item.offsetWidth / 2 - window.innerWidth / 2) / shift));
    const top = section.getBoundingClientRect().top + window.scrollY;
    // After the browser's own focus scrolling has settled.
    requestAnimationFrame(() => window.scrollTo({ top: top + target * (section.offsetHeight - window.innerHeight) }));
  };

  const intro = (
    <div className="flex w-[88vw] shrink-0 flex-col justify-end pb-[14svh] pl-5 sm:pl-10 md:w-[52vw]">
      <p className="label-xs text-ink/60">03 / 04 — Collection {site.collection.number}</p>
      <h2 className="mt-4 font-display text-[clamp(3.4rem,9vw,9rem)] font-light leading-[0.9] text-ink">
        Desert
        <br />
        <em>Eye</em>
      </h2>
      <p className="label-xs mt-6 max-w-[22rem] leading-relaxed text-ink/60">
        Four concept pieces. Demo prices. Materials and dimensions are published once verified.
      </p>
    </div>
  );

  const items = products.map((product, i) => {
    const layout = LAYOUT[i % LAYOUT.length];
    return (
      <article
        key={product.id}
        data-testid="sequence-item"
        data-product={product.slug}
        className={`group relative w-[84vw] shrink-0 px-5 sm:px-10 ${layout.width} ${reduced ? "" : layout.align}`}
        onPointerEnter={(e) => e.pointerType === "mouse" && schedule(product, OPEN_DELAY_MS)}
        onPointerLeave={(e) => e.pointerType === "mouse" && schedule(null, CLOSE_DELAY_MS)}
        onFocus={(e) => {
          bringIntoFrame(e.currentTarget);
          if (e.target instanceof HTMLElement && e.target.matches(":focus-visible")) schedule(product, 0);
        }}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && schedule(null, CLOSE_DELAY_MS)}
        onKeyDown={(e) => e.key === "Escape" && schedule(null, 0)}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-[0.12em] left-3 select-none font-display text-[clamp(8rem,22vw,22rem)] font-light leading-none text-bone-deep sm:left-8"
        >
          0{i + 1}
        </span>
        <Link href={`/product/${product.slug}`} className="relative block" aria-label={`${product.title}, demo ${formatPrice(product.demoPrice, product.currency)}`}>
          <div className="relative aspect-square w-full transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.04]">
            <ProductPieces product={product} scale={layout.scale + 0.2} shadow="soft" />
          </div>
        </Link>
        <div className="relative mt-2 flex items-end justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-light leading-tight text-ink sm:text-3xl">{product.title}</h3>
            <p className="label-xs mt-2 text-ink/60">
              {product.placements.map(placementLabel).join(" · ")} — Demo {formatPrice(product.demoPrice, product.currency)}
            </p>
          </div>
          <button type="button" data-testid="sequence-try-on" onClick={() => setSheetProduct(product)} className="text-link shrink-0 text-ink">
            Try on<span className="sr-only"> {product.title}</span> <span aria-hidden="true">↗</span>
          </button>
        </div>
      </article>
    );
  });

  const outro = (
    <div className="flex w-[70vw] shrink-0 flex-col justify-center px-5 sm:px-10 md:w-[30vw]">
      <Link href={`/collections/${site.collection.slug}`} className="text-link self-start text-ink">
        Explore the collection <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );

  const sheet = (
    <Modal open={sheetProduct !== null} onClose={() => setSheetProduct(null)} label={sheetProduct ? `Try on ${sheetProduct.title}` : "Try on"} variant="sheet">
      {sheetProduct && (
        <div className="overflow-y-auto p-6" data-testid="tryon-sheet">
          <div className="mb-2 flex justify-end">
            <button type="button" onClick={() => setSheetProduct(null)} className="label-xs inline-flex min-h-11 items-center text-ash hover:text-ivory">
              Close
            </button>
          </div>
          <TryOnPreview product={sheetProduct} onNavigate={() => setSheetProduct(null)} allowUpload />
        </div>
      )}
    </Modal>
  );

  if (reduced) {
    return (
      <section id="collection" data-chapter="Collection" className="bg-bone py-24 text-ink">
        {intro}
        <div className="mt-16 grid gap-y-20 md:grid-cols-2">{items}</div>
        <div className="mt-16">{outro}</div>
        {sheet}
      </section>
    );
  }

  return (
    <section ref={ref} id="collection" data-chapter="Collection" className="chapter h-[460vh] bg-bone text-ink md:h-[380vh]">
      <div className="chapter-stage">
        <div
          ref={trackRef}
          className="flex h-full w-max items-stretch will-change-transform max-md:items-center"
          style={{ transform: "translate3d(calc(var(--p) * var(--shift, 0px) * -1), 0, 0)" }}
        >
          {intro}
          {items}
          {outro}
        </div>

        {/* Desktop preview pane: one at a time, shows the hovered or focused piece on the visitor's photo. */}
        {paneProduct && (
          <aside
            data-testid="sequence-pane"
            className="fade-in absolute bottom-8 right-8 hidden w-[18rem] bg-ink p-5 text-ivory shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:block"
            onPointerEnter={() => timer.current && clearTimeout(timer.current)}
            onPointerLeave={() => schedule(null, CLOSE_DELAY_MS)}
          >
            <TryOnPreview product={paneProduct} />
          </aside>
        )}
      </div>
      {sheet}
    </section>
  );
}
