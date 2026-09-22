"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { displayTitle, filmFor, formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { AddToBagButton } from "@/components/cart/AddToBagButton";
import { RevealPlayer, type ConceptStills } from "@/components/reveal/RevealPlayer";
import { useFormChoice } from "@/components/studio/useFormChoice";
import { motionOf } from "./FloatingObject";
import { OrbitViewer } from "./OrbitViewer";
import { PieceAssembly } from "./PieceAssembly";
import { ProductFilm } from "./ProductFilm";
import { PlacementPreview } from "./PlacementPreview";
import { TryOnPreview } from "./TryOnPreview";

type ViewId = "piece" | "orbit" | "exploded" | "reveal" | "placement" | "tryon";

// One customer-facing page per design family: a large airy stage on about two thirds of the screen,
// and very little beside it. The chosen piercing form lives in the shared Studio provider, so the
// piece, the reveal, the placement preview, the try-on, Face Studio and the bag always agree.
export function FamilyExperience({
  product,
  initialFormId,
  fixtureSrc,
  concept,
}: {
  product: Product;
  initialFormId?: string;
  fixtureSrc?: string;
  /** Development-only stills for the local reveal prototype. */
  concept?: ConceptStills;
}) {
  const { form, choose } = useFormChoice(product, initialFormId);
  // An approved product animation for this form takes the stage; without one, the drawn assembly does.
  const film = filmFor(product, form.id);

  const views: { id: ViewId; label: string }[] = [
    // The whole piercing comes first: the product animation where one exists, otherwise assembled from the parts.
    { id: "piece", label: "The piece" },
    // A filmed form also has its 360° turn and its exploded drawing, like a configurator's views of one object.
    ...(film ? [{ id: "orbit" as const, label: "360°" }, { id: "exploded" as const, label: "Exploded" }] : []),
    // The concept-reveal prototype is superseded on a form with a real film; development fixtures can still open it.
    ...(product.reveal.mode !== "none" && (!film || fixtureSrc || concept) ? [{ id: "reveal" as const, label: "Concept reveal" }] : []),
    { id: "placement", label: "Placement preview" },
    { id: "tryon", label: "Try on your face" },
  ];
  const [view, setView] = useState<ViewId>(views[0].id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const chooseForm = (formId: string) => {
    choose(formId);
    // Shareable address for this product and form. Nothing about a photo is ever written to the URL.
    const url = new URL(window.location.href);
    url.searchParams.set("form", formId);
    window.history.replaceState(null, "", url);
  };

  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = views[(index + delta + views.length) % views.length];
    setView(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" data-testid="family" data-form={form.id}>
      <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div role="tabpanel" id={`panel-${view}`} aria-labelledby={`tab-${view}`} className="relative flex w-full items-center justify-center lg:min-h-[min(74svh,46rem)]">
          {view === "piece" && film ? (
            // Keyed by form, so changing form always starts from the poster and never carries a playing film across.
            <ProductFilm key={`${product.id}:${form.id}`} product={product} film={film} formId={form.id} />
          ) : view === "orbit" && film ? (
            <OrbitViewer dir="/media/hero-orbit/desert-eye-love" count={72} title={product.title} />
          ) : view === "exploded" ? (
            <PieceAssembly key={`${product.id}:exploded`} product={product} formId={form.id} sand={motionOf(product, form.id) === "sand"} exploded />
          ) : view === "piece" ? (
            // DESERT EYE alone stands on a little sand, drawn inside the stage. Every other family stands on plain paper.
            <PieceAssembly key={product.id} product={product} formId={form.id} sand={motionOf(product, form.id) === "sand"} />
          ) : (
            // The other views keep their 4:5 frame, sized to fit the window.
            <div className="w-full max-w-[max(16rem,56svh)]">
              {/* Keyed by product so leaving a product always unmounts, and so stops, its reveal. */}
              {view === "reveal" && <RevealPlayer key={product.id} product={product} formId={form.id} fixtureSrc={fixtureSrc} concept={concept} />}
              {view === "placement" && <PlacementPreview product={product} formId={form.id} />}
              {view === "tryon" && <TryOnPreview product={product} formId={form.id} allowUpload />}
            </div>
          )}
        </div>

        <div role="tablist" aria-label="Ways to look at this piece" className="mt-4 flex gap-x-7 overflow-x-auto whitespace-nowrap sm:justify-center">
          {views.map((v, i) => (
            <button
              key={v.id}
              ref={(el) => {
                tabRefs.current[v.id] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${v.id}`}
              aria-selected={view === v.id}
              aria-controls={`panel-${v.id}`}
              tabIndex={view === v.id ? 0 : -1}
              onClick={() => setView(v.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`label-xs inline-flex min-h-11 items-center border-b ${view === v.id ? "border-ink text-ink" : "border-transparent text-ash hover:text-ink"}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:pt-[12svh]">
        <p className="label-xs text-ash">{product.origin === "anime-inspired" ? "Anime-inspired design · not an official collaboration" : "Original design"} · Demo product</p>
        <h1 className="mt-5 font-display text-[clamp(2.5rem,3.6vw,3.75rem)] font-light leading-[1.02] tracking-[0.03em]">{displayTitle(product.title)}</h1>

        <fieldset className="mt-9">
          <legend className="label-xs mb-2 text-ash">Form</legend>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {product.forms.map((f, n) => {
              const pending = f.status !== "available";
              const selected = !pending && f.id === form.id;
              return (
                <span key={f.id} className="flex items-center gap-x-5">
                  {n > 0 && <span aria-hidden="true" className="text-ash">·</span>}
                  <label
                    className={`label-xs flex min-h-11 items-center border-b has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-garnet ${
                      selected ? "border-ink text-ink" : pending ? "cursor-not-allowed border-transparent text-ash" : "cursor-pointer border-transparent text-ash hover:text-ink"
                    }`}
                  >
                    <input type="radio" name={`form-${product.id}`} value={f.id} checked={selected} disabled={pending} onChange={() => chooseForm(f.id)} data-testid={`form-${f.id}`} className="sr-only" />
                    {f.label}
                    {pending && <span className="ml-2 normal-case tracking-normal">Concept pending</span>}
                  </label>
                </span>
              );
            })}
          </div>
        </fieldset>

        <p className="mt-8 font-display text-3xl font-light tracking-[0.06em]" data-testid="family-price">
          <span className="label-xs mr-3 align-middle text-ash">Demo price</span>
          {formatPrice(form.demoPrice, product.currency)}
        </p>

        <Link href={`/face-studio?product=${product.slug}&form=${form.id}`} data-testid="try-it-on" className="text-link mt-6">
          Try on <span aria-hidden="true">↗</span>
        </Link>

        <AddToBagButton product={product} formId={form.id} className="mt-5 max-w-sm" />
        <p className="text-xs leading-relaxed text-ash">Demo shopping only. Checkout is disabled and nothing can be ordered.</p>

        <details className="mt-10 border-t border-line pt-3">
          <summary className="label-xs flex min-h-11 cursor-pointer items-center text-ash hover:text-ink">About this piece</summary>
          <p className="mt-2 text-sm leading-relaxed text-ash">{product.story}</p>
        </details>
        {/* Kept in plain sight, not folded away: how final this form is, and what is in the package. */}
        <p className="mt-4 text-sm leading-relaxed text-ash" data-testid="family-form-note">
          {form.note}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ash" data-testid="family-package">
          {form.packageContents}
        </p>
      </div>
    </div>
  );
}
