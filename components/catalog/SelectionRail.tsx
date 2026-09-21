"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { availableForms, formatPrice, formOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { AddToBagButton } from "@/components/cart/AddToBagButton";
import { useChooseForm } from "@/components/studio/useFormChoice";
import { useStudio } from "@/components/studio/StudioProvider";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";
import { FormVisual } from "./FormVisual";

// The selection: design families side by side, browsed sideways. It is an ordinary horizontal
// scroller with snap points, so a finger swipes it, a trackpad or shift-wheel scrolls it, the arrow
// buttons and the arrow keys step it, and vertical scrolling of the page is never taken over.
// Each family is one floating object with a lot of air, and its piercing forms are switched in place.
export function SelectionRail({ products, initialSlug }: { products: Product[]; initialSlug?: string }) {
  const rail = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const { forms } = useStudio();
  const chooseForm = useChooseForm();
  const start = Math.max(0, products.findIndex((p) => p.slug === initialSlug));
  const [index, setIndex] = useState(start);

  const go = useCallback(
    (to: number, behavior: ScrollBehavior = "smooth") => {
      const el = rail.current;
      const slide = el?.children[Math.min(products.length - 1, Math.max(0, to))] as HTMLElement | undefined;
      if (!el || !slide) return;
      el.scrollTo({ left: slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2, behavior });
    },
    [products.length],
  );

  // Open on the family named in the address.
  useEffect(() => {
    if (start > 0) go(start, "auto");
  }, [start, go]);

  // The slide nearest the middle is the current one.
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
    // A visitor may have swiped before the page became interactive, so the position is read once now.
    read();
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const step = (delta: number) => go(index + delta, reduced ? "auto" : "smooth");

  return (
    <div data-testid="selection" data-index={index} className="relative">
      <ul
        ref={rail}
        data-testid="selection-rail"
        aria-label="Design families"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!delta) return;
          e.preventDefault();
          step(delta);
        }}
        // Positioned, so the visually hidden radio inputs of far slides are clipped with their slide instead of widening the page.
        className="selection-rail relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {products.map((product, i) => {
          const form = formOf(product, forms[product.id]);
          const options = availableForms(product);
          const current = i === index;
          return (
            <li key={product.id} data-testid="selection-slide" data-product={product.slug} data-form={form.id} data-current={current} aria-current={current ? "true" : undefined} className="selection-slide shrink-0 snap-center">
              <div className="grid h-full items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
                <Link href={`/product/${product.slug}?form=${form.id}`} aria-label={`View ${product.title}, ${form.label} form`} className="selection-object relative mx-auto block aspect-square w-[min(70%,22rem)] lg:w-[min(80%,30rem)]" tabIndex={current ? 0 : -1}>
                  <span className="landing-float absolute inset-0 block" style={{ animationDelay: `${i * -1.3}s` }}>
                    <FormVisual key={form.id} product={product} formId={form.id} filter="drop-shadow(0 22px 18px rgba(40,30,20,0.2)) drop-shadow(0 2px 2px rgba(40,30,20,0.3))" />
                  </span>
                </Link>

                <div className="mx-auto w-full max-w-md lg:mx-0">
                  <p className="label-xs text-ink/55">
                    {String(i + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")} · {product.origin === "anime-inspired" ? "Anime-inspired · not an official collaboration" : "Original design"}
                  </p>
                  <h2 className="mt-3 font-display text-5xl font-light leading-[0.95] sm:text-6xl">{product.title}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-ink/60">{product.summary}</p>

                  {options.length > 1 && (
                    <fieldset className="mt-6" disabled={!current}>
                      <legend className="label-xs text-ink/55">Piercing type</legend>
                      <div className="mt-1 flex flex-wrap gap-x-6">
                        {options.map((f) => (
                          <label key={f.id} className={`flex min-h-11 cursor-pointer items-center border-b text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-garnet ${f.id === form.id ? "border-ink text-ink" : "border-transparent text-ink/55 hover:text-ink"}`}>
                            <input type="radio" name={`selection-form-${product.id}`} value={f.id} checked={f.id === form.id} onChange={() => chooseForm(product, f.id)} data-testid={`selection-form-${f.id}`} className="sr-only" />
                            {f.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  <p className="mt-5 font-display text-3xl font-light" data-testid="selection-price">
                    <span className="label-xs mr-3 align-middle text-ink/55">Demo price</span>
                    {formatPrice(form.demoPrice, product.currency)}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-1">
                    <Link href={`/product/${product.slug}?form=${form.id}`} data-testid="selection-view" tabIndex={current ? 0 : -1} className="text-link">
                      View the piece <span aria-hidden="true">→</span>
                    </Link>
                    <Link href={`/face-studio?product=${product.slug}&form=${form.id}`} tabIndex={current ? 0 : -1} className="text-link">
                      Try on <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                  {current && <AddToBagButton product={product} formId={form.id} className="mt-5 max-w-xs" />}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-between px-5 sm:px-8 lg:bottom-8 lg:px-12">
        <button type="button" data-testid="selection-prev" onClick={() => step(-1)} disabled={index === 0} aria-label="Previous design" className="label-xs pointer-events-auto inline-flex min-h-11 items-center gap-2 disabled:opacity-25">
          <span aria-hidden="true">←</span> Prev
        </button>
        <p className="label-xs text-ink/55" aria-live="polite">
          {String(index + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
        </p>
        <button type="button" data-testid="selection-next" onClick={() => step(1)} disabled={index === products.length - 1} aria-label="Next design" className="label-xs pointer-events-auto inline-flex min-h-11 items-center gap-2 disabled:opacity-25">
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
