"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatPrice } from "@/lib/catalog";
import type { Product, ProductForm } from "@/lib/catalog/types";
import type { CollectionStory, StoryMedia } from "@/lib/story";
import { previewItems } from "@/lib/studio/look";
import { AddToBagButton } from "@/components/cart/AddToBagButton";
import { PlacementPreview } from "@/components/catalog/PlacementPreview";
import { LookRenderer } from "@/components/studio/LookRenderer";
import { PhotoPicker } from "@/components/studio/PhotoPicker";
import { useStudio } from "@/components/studio/StudioProvider";
import { StoryVisual } from "./StoryVisual";

export type StoryView = "concept" | "placement" | "tryon";

const VIEWS: { id: StoryView; label: string }[] = [
  { id: "concept", label: "Concept" },
  { id: "placement", label: "Placement" },
  { id: "tryon", label: "Try on" },
];

// What the cinematic resolves into, and what a jewelry object opens directly: the product itself,
// in place, with its controls arriving around the character close-up. It is the same product, form,
// bag and Face Studio state as everywhere else; only the presentation belongs to the story.
export function StoryProductExperience({
  story,
  media,
  product,
  form,
  view,
  collectionTitle,
  replay,
  onChooseForm,
  onChooseView,
  onBack,
}: {
  story: CollectionStory;
  media: StoryMedia;
  product: Product;
  form: ProductForm;
  view: StoryView;
  collectionTitle: string;
  /** Present only when this product has a story that may play in this build. */
  replay?: { label: string; onPress: () => void };
  onChooseForm: (formId: string) => void;
  onChooseView: (view: StoryView) => void;
  onBack: () => void;
}) {
  const { photo, look } = useStudio();
  const heading = useRef<HTMLHeadingElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Arriving here moves keyboard and screen-reader focus to the product, wherever it came from.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [product.id]);

  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = VIEWS[(index + delta + VIEWS.length) % VIEWS.length];
    onChooseView(next.id);
    tabRefs.current[next.id]?.focus();
  };

  const items = previewItems(look, product, form.id);
  const focusItem = items.find((i) => i.productId === product.id) ?? items[0];
  const onFace = view === "tryon" && Boolean(photo);
  const awaitingPhoto = view === "tryon" && !photo;

  return (
    <div
      data-testid="story-product"
      data-product={product.slug}
      data-form={form.id}
      data-view={view}
      className="grid lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1.45fr)_minmax(21rem,1fr)]"
    >
      <div
        role="tabpanel"
        id={`story-panel-${view}`}
        aria-labelledby={`story-view-${view}`}
        className="fade-in relative h-[62svh] min-h-[22rem] overflow-hidden bg-[#efe9dd] lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)]"
      >
        {/* The character. It lets go as another view takes over. */}
        <div
          data-testid="story-character-layer"
          data-hidden={view !== "concept"}
          aria-hidden={view !== "concept"}
          className="story-layer absolute inset-0"
          style={{ opacity: view === "concept" ? 1 : 0, filter: view === "concept" ? "none" : "blur(10px)", transform: view === "concept" ? "none" : "scale(1.06)" }}
        >
          <StoryVisual story={story} media={media} product={product} formId={form.id} />
        </div>

        {/* The featureless head: the placement view, and the stand-in for a face until the customer adds theirs. */}
        {(view === "placement" || awaitingPhoto) && (
          <div data-testid="story-head" className={`fade-in absolute inset-0 flex items-center justify-center p-4 ${awaitingPhoto ? "pb-56 sm:pb-28" : ""}`}>
            <div className="aspect-[4/5] h-full max-w-full">
              <PlacementPreview product={product} formId={form.id} />
            </div>
          </div>
        )}

        {view === "tryon" && (
          <div data-testid="story-tryon" data-photo={Boolean(photo)} className="absolute inset-0">
            {photo ? (
              <div className="story-face absolute inset-0 bg-ink">
                <LookRenderer
                  photo={photo}
                  items={items}
                  zoom={focusItem ? { x: focusItem.group.x, y: focusItem.group.y, factor: 2.2 } : undefined}
                  label={`Virtual preview of ${product.title}, ${form.label} form, on your photo`}
                />
                <p className="label-xs absolute inset-x-5 bottom-5 leading-relaxed text-ink/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
                  On you · approximate preview · not a fitting or a piercing-safety assessment
                </p>
              </div>
            ) : (
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-line bg-paper px-5 py-4 sm:px-7">
                <div className="max-w-md">
                  <p className="font-display text-2xl font-light leading-tight">See it on you.</p>
                  <p className="mt-1 text-xs leading-relaxed text-ash">Your photo stays in this browser. It is never uploaded, stored or sent anywhere.</p>
                </div>
                <PhotoPicker className="w-full sm:w-56 [&>p]:mt-1 [&>p]:min-h-0" label="Use my photo" compact />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="story-controls px-5 py-9 sm:px-8 lg:px-12 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-x-6" style={{ "--i": 0 } as React.CSSProperties}>
          <button type="button" data-testid="story-back" onClick={onBack} className="text-link">
            <span aria-hidden="true">←</span> {collectionTitle}
          </button>
          {replay && (
            <button type="button" data-testid="story-replay" onClick={replay.onPress} className="text-link">
              {replay.label}
            </button>
          )}
        </div>

        <p className="label-xs mt-8 text-ink/60" style={{ "--i": 1 } as React.CSSProperties}>
          {product.origin === "anime-inspired" ? "Anime-inspired design · not an official collaboration" : "Original design"} · Demo product
        </p>
        <h1
          ref={heading}
          tabIndex={-1}
          data-testid="story-product-title"
          className="mt-4 font-display text-5xl font-light leading-[0.95] outline-none sm:text-6xl"
          style={{ "--i": 2, outline: "none" } as React.CSSProperties}
        >
          {product.title}
        </h1>

        <fieldset className="mt-9" style={{ "--i": 3 } as React.CSSProperties}>
          <legend className="label-xs text-ink/60">Piercing type</legend>
          <div className="mt-3 flex flex-wrap gap-x-7 gap-y-1">
            {product.forms.map((f) => {
              const pending = f.status !== "available";
              const selected = !pending && f.id === form.id;
              return (
                <label
                  key={f.id}
                  className={`flex min-h-11 items-center border-b text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-garnet ${
                    selected ? "border-ink text-ink" : pending ? "cursor-not-allowed border-transparent text-ink/40" : "cursor-pointer border-transparent text-ink/60 hover:text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name={`story-form-${product.id}`}
                    value={f.id}
                    checked={selected}
                    disabled={pending}
                    onChange={() => onChooseForm(f.id)}
                    data-testid={`story-form-${f.id}`}
                    className="sr-only"
                  />
                  {f.label}
                  {pending && <span className="label-xs ml-2">Concept pending</span>}
                </label>
              );
            })}
          </div>
          <p data-testid="story-form-note" className="mt-3 text-sm leading-relaxed text-ink/60">
            {form.note}
          </p>
        </fieldset>

        <div className="mt-8" style={{ "--i": 4 } as React.CSSProperties}>
          <p className="label-xs text-ink/60">Views</p>
          <div role="tablist" aria-label="Ways to look at this piece" className="mt-1 flex gap-x-7">
            {VIEWS.map((v, i) => (
              <button
                key={v.id}
                ref={(el) => {
                  tabRefs.current[v.id] = el;
                }}
                type="button"
                role="tab"
                id={`story-view-${v.id}`}
                data-testid={`story-view-${v.id}`}
                aria-selected={view === v.id}
                aria-controls={`story-panel-${v.id}`}
                tabIndex={view === v.id ? 0 : -1}
                onClick={() => onChooseView(v.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`inline-flex min-h-11 items-center border-b text-sm ${view === v.id ? "border-ink text-ink" : "border-transparent text-ink/60 hover:text-ink"}`}
              >
                {v.label}
              </button>
            ))}
          </div>
          {onFace && (
            <Link href={`/face-studio?product=${product.slug}&form=${form.id}`} data-testid="story-open-studio" className="text-link mt-1">
              Adjust in Face Studio <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>

        <p className="mt-8 font-display text-3xl font-light" data-testid="story-price" style={{ "--i": 5 } as React.CSSProperties}>
          <span className="label-xs mr-3 align-middle text-ink/60">Demo price</span>
          {formatPrice(form.demoPrice, product.currency)}
        </p>

        <div className="mt-6 max-w-sm" style={{ "--i": 6 } as React.CSSProperties}>
          <AddToBagButton product={product} formId={form.id} />
          <p className="text-xs leading-relaxed text-ink/60">Demo shopping only. Checkout is disabled and nothing can be ordered.</p>
        </div>

        <div className="mt-8 border-t border-ink/15 pt-5" style={{ "--i": 7 } as React.CSSProperties}>
          <p className="text-sm leading-relaxed text-ink/60" data-testid="story-package">
            {form.packageContents}
          </p>
          <Link href={`/product/${product.slug}?form=${form.id}`} data-testid="story-details" className="text-link mt-2">
            Full details and specifications <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
