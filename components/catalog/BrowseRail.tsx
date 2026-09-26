"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { availableForms, isConceptFamily, lineLabels } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";
import { FloatingObject } from "./FloatingObject";
import { ConceptBlade } from "./SelectionRail";
import { SandLayer } from "@/components/story/SandLayer";

// The collection browser, browsed sideways like a gallery: one design family centred, its
// neighbours well into the frame at either edge. A finger swipes it, a mouse drags it, the arrows
// and keys step it; the vertical wheel stays with the page.
//
// Every family gets the same stage (24 September 2026). DERMAL is the brand and DESERT EYE is one
// collection inside it, so no family is given a larger frame or a longer look than another. A family
// keeps its own small world inside that frame — sand and garnet for DESERT EYE, dark stone and a
// tracing light for HORUS TRACE, a blade reflection for BLADE TRACE, polished light for CROSSLINE,
// silver for ANKH TRACE, chrome for KIRI — while the surrounding page stays DERMAL.
//
// Nothing is invented: KIRI is a concept with no product, and the ways in below promise nothing that
// has not been announced.

type World = "sand" | "trace" | "blade" | "line" | "symbol" | "chrome";
type Entry = {
  id: string;
  name: string;
  kind: string;
  /** The forms this family is actually drawn in, or the honest status of a concept. */
  forms: string;
  /** A concept has nowhere to go: no piece to view and nothing to try on. */
  href: string | null;
  /** False for a family that exists only as a design render: it can be viewed, not tried on. */
  tryOn: boolean;
  world: World;
  visual: React.ReactNode;
};

/** The owner's order for the collection browser, with the world each family carries. */
const FAMILIES: { slug: string; world: World; kind?: string }[] = [
  { slug: "desert-eye-love", world: "sand" },
  { slug: "horus-trace", world: "trace" },
  { slug: "blade-trace", world: "blade" },
  { slug: "crossline", world: "line" },
  { slug: "ankh-trace", world: "symbol" },
  // Known from the owner's renders of 26 September 2026 and not yet configured: viewable, never tried on.
  { slug: "japanese-angel", world: "line" },
  { slug: "ankh-eye", world: "symbol" },
];

export function BrowseRail({ products }: { products: Product[] }) {
  const entries: Entry[] = FAMILIES.flatMap(({ slug, world }) => {
    const product = products.find((p) => p.slug === slug);
    if (!product) return [];
    const concept = isConceptFamily(product);
    return [
      {
        id: slug,
        name: product.title,
        kind: [...lineLabels(product), ...(concept ? ["Concept"] : [])].join(" · "),
        forms: availableForms(product).map((f) => f.label).join(" / "),
        href: `/product/${product.slug}`,
        tryOn: !concept,
        world,
        visual: (
          <span className="browse-object">
            {/* The family's own detail, held close to the piece. The stage behind it stays DERMAL. */}
            <span aria-hidden="true" className="browse-halo" />
            {world === "sand" && <SandLayer className="browse-sand" />}
            <FloatingObject product={product} depth={1} />
          </span>
        ),
      },
    ];
  });

  // KIRI closes the rail on the same stage as the rest: a direction, named honestly, with no piece
  // to view, nothing to try on and no price.
  entries.push({
    id: "kiri",
    name: "KIRI",
    kind: "Original · Concept",
    // Its status is said once, under the label, and not repeated where the forms would go.
    forms: "",
    href: null,
    tryOn: false,
    world: "chrome",
    visual: (
      <span className="browse-object browse-blade" data-object-host>
        <span aria-hidden="true" className="browse-halo" />
        <ConceptBlade />
        <span aria-hidden="true" className="fo-blade" />
      </span>
    ),
  });

  const rail = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  const go = useCallback((to: number) => {
    const el = rail.current;
    const slide = el?.children[Math.max(0, Math.min(to, (el?.children.length ?? 1) - 1))] as HTMLElement | undefined;
    if (!el || !slide) return;
    el.scrollTo({ left: slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const middle = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let distance = Infinity;
      [...el.children].forEach((child, i) => {
        const c = child as HTMLElement;
        const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - middle);
        if (d < distance) {
          distance = d;
          best = i;
        }
      });
      setIndex(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    read();
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div data-testid="browse" className="browse relative">
      <div className="browse-head">
        <p className="label-xs" data-testid="browse-index" aria-live="polite">
          {String(index + 1).padStart(2, "0")} / {String(entries.length).padStart(2, "0")}
        </p>
        <p className="label-xs text-ash">
          <span className="hidden lg:inline">Drag</span>
          <span className="lg:hidden">Swipe</span>
        </p>
      </div>
      <ul
        ref={rail}
        data-testid="browse-rail"
        data-dragging={dragging}
        aria-label="Browse the collection"
        tabIndex={0}
        className="browse-rail"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (!d.moved && Math.abs(dx) > 6) {
            d.moved = true;
            setDragging(true);
          }
          if (d.moved) e.currentTarget.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (d?.moved) requestAnimationFrame(() => {
            setDragging(false);
            go(index);
          });
        }}
        onPointerLeave={() => {
          if (drag.current?.moved) setDragging(false);
          drag.current = null;
        }}
        onClickCapture={(e) => {
          if (dragging) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!delta) return;
          e.preventDefault();
          go(index + delta);
        }}
      >
        {entries.map((entry, i) => {
          const current = i === index;
          return (
            <li key={entry.id} data-testid="browse-entry" data-entry={entry.id} data-world={entry.world} data-current={current} className="browse-entry">
              {entry.href ? (
                <Link href={entry.href} draggable={false} tabIndex={current ? 0 : -1} className="browse-visual" aria-label={`${entry.name}, ${entry.kind}`}>
                  {entry.visual}
                </Link>
              ) : (
                // A concept is looked at, not opened: there is no piece behind it to link to.
                <div className="browse-visual" role="img" aria-label={`${entry.name}, ${entry.kind}`}>
                  {entry.visual}
                </div>
              )}
              <div className="browse-label">
                <p className="label-xs" data-testid="browse-entry-index">
                  {String(i + 1).padStart(2, "0")} / {String(entries.length).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-[clamp(1.75rem,3.2vw,3rem)] font-light leading-none tracking-[0.06em]">{entry.name}</h3>
                <span className="browse-meta">
                  <span className="label-xs block text-ash">{entry.kind}</span>
                  {entry.forms && (
                    <span className="label-xs mt-1 block text-ash" data-testid="browse-entry-forms">{entry.forms}</span>
                  )}
                </span>
                {entry.href ? (
                  <span className="browse-actions">
                    <Link href={entry.href} draggable={false} tabIndex={current ? 0 : -1} className="text-link" data-testid="browse-go">
                      View piece <span aria-hidden="true">↗</span>
                    </Link>
                    {entry.tryOn && (
                    <Link
                      href={`/face-studio?product=${entry.id}`}
                      draggable={false}
                      tabIndex={current ? 0 : -1}
                      className="text-link"
                      data-testid="browse-tryon"
                    >
                      Try on <span aria-hidden="true">↗</span>
                    </Link>
                    )}
                  </span>
                ) : (
                  <p className="label-xs browse-actions text-ash" data-testid="browse-concept-note">
                    Not yet available
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="browse-steps" data-testid="browse-steps">
        <button type="button" data-testid="browse-prev" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous" className="label-xs inline-flex min-h-11 items-center gap-2 disabled:opacity-25">
          <span aria-hidden="true">←</span> Prev
        </button>
        <button type="button" data-testid="browse-next" onClick={() => go(index + 1)} disabled={index === entries.length - 1} aria-label="Next" className="label-xs inline-flex min-h-11 items-center gap-2 disabled:opacity-25">
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
