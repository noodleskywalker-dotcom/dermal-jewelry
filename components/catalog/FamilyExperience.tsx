"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { AddToBagButton } from "@/components/cart/AddToBagButton";
import { RevealPlayer, type ConceptStills } from "@/components/reveal/RevealPlayer";
import { useFormChoice } from "@/components/studio/useFormChoice";
import { PlacementPreview } from "./PlacementPreview";
import { TryOnPreview } from "./TryOnPreview";

type ViewId = "reveal" | "placement" | "tryon";

// One customer-facing page per design family. The chosen piercing form lives in the shared Studio
// provider, so the reveal, the placement preview, the try-on, Face Studio and the bag always agree.
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

  const views: { id: ViewId; label: string }[] = [
    ...(product.reveal.mode !== "none" ? [{ id: "reveal" as const, label: "Concept reveal" }] : []),
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
    <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]" data-testid="family" data-form={form.id}>
      <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div role="tablist" aria-label="Ways to look at this piece" className="flex gap-x-7 overflow-x-auto whitespace-nowrap border-b border-line">
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
              className={`label-xs -mb-px inline-flex min-h-11 items-center border-b ${view === v.id ? "border-ivory text-ivory" : "border-transparent text-ash hover:text-ivory"}`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Width is tied to the window height so the whole 4:5 frame fits on screen, even in short windows. */}
        <div role="tabpanel" id={`panel-${view}`} aria-labelledby={`tab-${view}`} className="mt-5 w-full max-w-[max(16rem,60svh)]">
          {/* Keyed by product so leaving a product always unmounts, and so stops, its reveal. */}
          {view === "reveal" && <RevealPlayer key={product.id} product={product} formId={form.id} fixtureSrc={fixtureSrc} concept={concept} />}
          {view === "placement" && <PlacementPreview product={product} formId={form.id} />}
          {view === "tryon" && (
            <div className="max-w-sm">
              <TryOnPreview product={product} formId={form.id} allowUpload />
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="label-xs text-ash">
          {product.origin === "anime-inspired" ? "Anime-inspired design · not an official collaboration" : "Original design"} · Demo product
        </p>
        <h1 className="mt-4 font-display text-5xl font-light leading-[0.95] sm:text-6xl">{product.title}</h1>
        <p className="mt-6 text-base leading-relaxed text-ash">{product.story}</p>

        <fieldset className="mt-9">
          <legend className="label-xs text-ash">Piercing form</legend>
          <div className="mt-3 flex flex-wrap gap-x-7 gap-y-1">
            {product.forms.map((f) => {
              const pending = f.status !== "available";
              const selected = !pending && f.id === form.id;
              return (
                <label
                  key={f.id}
                  className={`flex min-h-11 items-center border-b text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-garnet-text ${
                    selected ? "border-ivory text-ivory" : pending ? "cursor-not-allowed border-transparent text-ash/60" : "cursor-pointer border-transparent text-ash hover:text-ivory"
                  }`}
                >
                  <input
                    type="radio"
                    name={`form-${product.id}`}
                    value={f.id}
                    checked={selected}
                    disabled={pending}
                    onChange={() => chooseForm(f.id)}
                    data-testid={`form-${f.id}`}
                    className="sr-only"
                  />
                  {f.label}
                  {pending && <span className="label-xs ml-2">Concept pending</span>}
                </label>
              );
            })}
          </div>
        </fieldset>

        <p className="mt-7 font-display text-3xl font-light" data-testid="family-price">
          <span className="label-xs mr-3 align-middle text-ash">Demo price</span>
          {formatPrice(form.demoPrice, product.currency)}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ash" data-testid="family-form-note">
          {form.note}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <AddToBagButton product={product} formId={form.id} />
          <Link
            href={`/face-studio?product=${product.slug}&form=${form.id}`}
            data-testid="try-it-on"
            className="inline-flex min-h-12 items-center justify-center border border-ivory px-7 text-xs uppercase tracking-[0.22em] transition-colors duration-200 hover:bg-ivory hover:text-ink"
          >
            Try it on
          </Link>
        </div>
        <p className="text-xs leading-relaxed text-ash">Demo shopping only. Checkout is disabled and nothing can be ordered.</p>

        <section aria-labelledby="included-heading" className="mt-10 border-t border-line pt-6">
          <h2 id="included-heading" className="label-xs text-ash">
            What&rsquo;s included · {form.label}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ash" data-testid="family-package">
            {form.packageContents}
          </p>
        </section>
      </div>
    </div>
  );
}
