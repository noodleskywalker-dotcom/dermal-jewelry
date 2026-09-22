"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { availableForms, displayTitle, formatPrice, formOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";
import { AddToBagButton } from "@/components/cart/AddToBagButton";
import { SandLayer } from "@/components/story/SandLayer";
import { useStudio } from "@/components/studio/StudioProvider";
import { useChooseForm } from "@/components/studio/useFormChoice";
import { FloatingObject, motionOf } from "./FloatingObject";

export type Concept = { name: string; kind: string; status: string; note: string };

// The selection: one design family centred at a time, its neighbours faint at the edges.
// It is an ordinary sideways scroller with snap points, so a finger swipes it, a mouse drags it, a
// trackpad or a sideways wheel scrolls it, and the arrow buttons and keys step it. The vertical wheel
// is left to the page. Sand belongs to the DESERT EYE family alone: it fades out as the next family arrives.
export function SelectionRail({
  products,
  concepts = [],
  initialSlug,
  accentSrc,
}: {
  products: Product[];
  /** Original designs that exist only as a direction. Shown as words, never as a product. */
  concepts?: readonly Concept[];
  initialSlug?: string;
  /** Internal mascot still, development server only. It rests on the DESERT EYE sand as an accent. */
  accentSrc?: string;
}) {
  const rail = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const { forms } = useStudio();
  const chooseForm = useChooseForm();
  const total = products.length + concepts.length;
  const start = Math.max(0, products.findIndex((p) => p.slug === initialSlug));
  const [index, setIndex] = useState(start);
  const [dragging, setDragging] = useState(false);

  const go = useCallback(
    (to: number, behavior: ScrollBehavior = "smooth") => {
      const el = rail.current;
      const slide = el?.children[Math.min(total - 1, Math.max(0, to))] as HTMLElement | undefined;
      if (!el || !slide) return;
      el.scrollTo({ left: slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2, behavior });
    },
    [total],
  );

  const nearest = useCallback(() => {
    const el = rail.current;
    if (!el) return 0;
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
    return best;
  }, []);

  useEffect(() => {
    if (start > 0) go(start, "auto");
  }, [start, go]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      setIndex(nearest());
      // How far along the whole rail, for the thin progress line.
      const span = el.scrollWidth - el.clientWidth;
      el.parentElement?.style.setProperty("--progress", span > 0 ? (el.scrollLeft / span).toFixed(4) : "0");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    // A visitor may have swiped before the page became interactive, so the position is read once now.
    read();
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [nearest]);

  // Mouse drag. Touch already swipes natively. A drag of more than a few pixels is not a click.
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      setDragging(true);
    }
    if (d.moved) e.currentTarget.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    // Snap is off while dragging; settle on the nearest family.
    requestAnimationFrame(() => {
      setDragging(false);
      go(nearest(), reduced ? "auto" : "smooth");
    });
  };

  const step = (delta: number) => go(index + delta, reduced ? "auto" : "smooth");
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div data-testid="selection" data-index={index} className="selection relative">
      <div className="pointer-events-none absolute inset-x-6 top-2 z-10 flex items-center justify-between sm:inset-x-10 lg:inset-x-16 lg:top-4">
        {/* The index counts the families that can be browsed. A concept at the end is named, not numbered. */}
        <p data-testid="selection-index" className="label-xs" aria-live="polite">
          {index < products.length ? `Index ${pad(index + 1)} / ${pad(products.length)}` : `Concept · ${concepts[index - products.length]?.name ?? ""}`}
        </p>
        <p className="label-xs flex items-center gap-4 text-ash">
          <span className="hidden lg:inline">Drag</span>
          <span className="lg:hidden">Swipe</span>
          <span aria-hidden="true" className="selection-progress" />
        </p>
      </div>

      <ul
        ref={rail}
        data-testid="selection-rail"
        data-dragging={dragging}
        aria-label="Design families"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => {
          // The click that ends a drag must not open a product.
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
          step(delta);
        }}
        // Positioned, so the visually hidden radio inputs of far slides are clipped with their slide instead of widening the page.
        className="selection-rail relative flex overflow-x-auto overscroll-x-contain"
      >
        {products.map((product, i) => {
          const form = formOf(product, forms[product.id]);
          const options = availableForms(product);
          const current = i === index;
          const sand = motionOf(product) === "sand";
          return (
            <li
              key={product.id}
              data-testid="selection-slide"
              data-product={product.slug}
              data-form={form.id}
              data-current={current}
              data-side={i < index ? "before" : i > index ? "after" : undefined}
              data-object-host
              aria-current={current ? "true" : undefined}
              className="selection-slide"
            >
              <Link
                href={`/product/${product.slug}?form=${form.id}`}
                draggable={false}
                aria-label={`View ${product.title}, ${form.label} form`}
                tabIndex={current ? 0 : -1}
                className="selection-object relative mx-auto block aspect-square"
              >
                {/* DESERT EYE's own layer, under its jewelry and nowhere near the words. It leaves with the slide. */}
                {sand && <SandLayer className="selection-sand" />}
                <FloatingObject product={product} formId={form.id} depth={1} delay={i * -1.3} />
                {sand && accentSrc && (
                  // Internal still from the development server, resting on the sand at the foot of the piece.
                  // It is never optimised, cached or deployed.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={accentSrc} alt="" draggable={false} data-testid="selection-accent" className="selection-accent" />
                )}
              </Link>

              <div className="selection-info relative mx-auto mt-2 w-full max-w-xl text-center">
                <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-light leading-none tracking-[0.04em]">{displayTitle(product.title)}</h2>
                {options.length > 1 ? (
                  <fieldset className="mt-4" disabled={!current}>
                    <legend className="sr-only">Piercing type</legend>
                    <div className="flex flex-wrap items-center justify-center gap-x-5">
                      {options.map((f, n) => (
                        <span key={f.id} className="flex items-center gap-x-5">
                          {n > 0 && <span aria-hidden="true" className="text-ash">·</span>}
                          <label className={`label-xs flex min-h-11 cursor-pointer items-center border-b has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-garnet ${f.id === form.id ? "border-ink text-ink" : "border-transparent text-ash hover:text-ink"}`}>
                            <input type="radio" name={`selection-form-${product.id}`} value={f.id} checked={f.id === form.id} onChange={() => chooseForm(product, f.id)} data-testid={`selection-form-${f.id}`} className="sr-only" />
                            {f.label}
                          </label>
                        </span>
                      ))}
                    </div>
                  </fieldset>
                ) : (
                  <p className="label-xs mt-4 flex min-h-11 items-center justify-center text-ash">{form.label}</p>
                )}
                <p className="label-xs mt-1" data-testid="selection-price">
                  <span className="text-ash">Demo price · </span>
                  {formatPrice(form.demoPrice, product.currency)}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8">
                  <Link href={`/product/${product.slug}?form=${form.id}`} draggable={false} data-testid="selection-view" tabIndex={current ? 0 : -1} className="text-link">
                    View the piece <span aria-hidden="true">→</span>
                  </Link>
                  <Link href={`/face-studio?product=${product.slug}&form=${form.id}`} draggable={false} tabIndex={current ? 0 : -1} className="text-link">
                    Try on <span aria-hidden="true">↗</span>
                  </Link>
                </div>
                {current && <AddToBagButton product={product} formId={form.id} className="mx-auto mt-3 max-w-[16rem]" />}
              </div>
            </li>
          );
        })}

        {concepts.map((concept, n) => {
          const current = products.length + n === index;
          return (
            <li key={concept.name} data-testid="selection-concept" data-current={current} data-side={current ? undefined : "after"} aria-current={current ? "true" : undefined} className="selection-slide">
              <div className="selection-object relative mx-auto flex aspect-square items-center justify-center">
                <ConceptBlade />
              </div>
              <div className="selection-info relative mx-auto mt-2 w-full max-w-xl text-center">
                <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-light leading-none tracking-[0.2em]">{concept.name}</h2>
                <p className="label-xs mt-4 flex min-h-11 items-center justify-center text-ash">
                  {concept.kind} / {concept.status}
                </p>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-ash">{concept.note}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="pointer-events-none absolute inset-x-6 bottom-4 flex items-center justify-between sm:inset-x-10 lg:inset-x-16 lg:bottom-8" data-testid="selection-steps">
        <button type="button" data-testid="selection-prev" onClick={() => step(-1)} disabled={index === 0} aria-label="Previous design" className="label-xs pointer-events-auto inline-flex min-h-11 items-center gap-2 disabled:opacity-25">
          <span aria-hidden="true">←</span> Prev
        </button>
        <button type="button" data-testid="selection-next" onClick={() => step(1)} disabled={index === total - 1} aria-label="Next design" className="label-xs pointer-events-auto inline-flex min-h-11 items-center gap-2 disabled:opacity-25">
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

// KIRI exists only as a direction: reduced blade geometry, no product. Where its piece will stand, one
// chrome concept form stands instead: a slim tapered blade, drawn from vectors, with a single restrained
// line of light along its edge. It is deliberately a sculpture of the idea, not a placeholder for a photo,
// and never a product: no price, no forms, nothing to add to a bag.
function ConceptBlade() {
  return (
    <svg viewBox="0 0 200 200" className="selection-blade" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="kiri-chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6f7f9" />
          <stop offset="0.32" stopColor="#b9bec6" />
          <stop offset="0.5" stopColor="#eef0f3" />
          <stop offset="0.7" stopColor="#7d838c" />
          <stop offset="1" stopColor="#575c64" />
        </linearGradient>
        <linearGradient id="kiri-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="kiri-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* Contact shadow, close under the point, where the form meets the paper. */}
      <ellipse cx="122" cy="176" rx="24" ry="3.5" fill="rgba(40,30,20,0.16)" filter="url(#kiri-shadow)" />
      <g transform="rotate(-22 100 100)">
        {/* The blade: one long tapered lozenge, a little wider at the shoulder than at the point. */}
        <path d="M100 14 C112 58 117 110 110 168 C107 180 93 180 90 168 C83 110 88 58 100 14 Z" fill="url(#kiri-chrome)" />
        {/* The spine: the turning edge where the two faces meet. */}
        <path d="M100 22 C103 70 103 120 100 170" stroke="rgba(40,44,50,0.35)" strokeWidth="0.8" fill="none" />
        {/* One line of light along the leading edge. */}
        <path d="M94.5 40 C90.5 80 90.5 120 93.5 160" stroke="url(#kiri-edge)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}
