"use client";

import { useState } from "react";
import { formOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { clampFocus, type CollectionStory, type StoryFocus, type StoryMedia } from "@/lib/story";
import { FormVisual } from "@/components/catalog/FormVisual";
import { ProductPieces } from "@/components/catalog/ProductArtwork";

// The concept view of a story's product: a picture framed on the chosen piercing form, with the
// jewelry drawn over it as a separate overlay from the product asset. A picture never supplies the
// jewelry, so changing the character or the close-up later cannot change the product.
// Each form names its own picture and framing in the story data. With no picture supplied, a
// labelled placeholder is drawn instead.
export function StoryVisual({
  story,
  media,
  product,
  formId,
  internal,
  captions = true,
}: {
  story: CollectionStory;
  media: StoryMedia;
  product: Product;
  formId: string;
  internal: boolean;
  /** The cinematic carries its own captions and turns these off. */
  captions?: boolean;
}) {
  const form = formOf(product, formId);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const focus = product.slug === story.productSlug ? story.focus[form.id] : undefined;
  const usable = (f: StoryFocus | undefined): f is StoryFocus => Boolean(f && media[f.slot] && !failed[f.slot]);

  if (!usable(focus)) {
    return (
      <div data-testid="story-visual" data-form={form.id} data-media="placeholder" className="absolute inset-0" style={{ backgroundImage: "linear-gradient(165deg, #f1ece2 0%, #e4dccd 60%, #d6ccb9 100%)" }}>
        <ProductPieces product={product} formId={form.id} scale={form.components.length > 1 ? 0.5 : 0.24} shadow="soft" />
        <p className="label-xs absolute inset-x-4 bottom-4 text-ink/60">
          {focus ? "Character close-up placeholder · media not supplied · concept artwork" : "Concept artwork"}
        </p>
      </div>
    );
  }

  // One layer per picture. Forms that share a picture pan across it; a different picture cross-fades.
  const slots = [...new Set(Object.values(story.focus).filter(usable).map((f) => f.slot))];

  return (
    <div data-testid="story-visual" data-form={form.id} data-media={focus.slot} className="story-frame absolute inset-0 overflow-hidden">
      {slots.map((slotId) => {
        const slot = story.slots.find((s) => s.id === slotId);
        const active = slotId === focus.slot;
        const framing = active ? focus : Object.values(story.focus).find((f) => f.slot === slotId)!;
        const f = clampFocus(framing);
        const aspect = slot?.aspect ?? 1;
        return (
          <div key={slotId} aria-hidden="true" className="story-layer absolute inset-0" style={{ opacity: active ? 1 : 0 }}>
            <div
              className="story-pan"
              style={{
                width: `max(100cqw, calc(100cqh * ${aspect}))`,
                aspectRatio: String(aspect),
                transform: `translate(${-f.x * 100}%, ${-f.y * 100}%) scale(${f.zoom})`,
                transformOrigin: `${f.x * 100}% ${f.y * 100}%`,
              }}
            >
              {/* An internal still from the development server. It is never optimised, cached or deployed. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media[slotId]}
                alt=""
                draggable={false}
                className="block h-full w-full select-none"
                onError={() => setFailed((prev) => ({ ...prev, [slotId]: true }))}
              />
              {active && (
                <div
                  key={form.id}
                  data-testid="story-jewel"
                  className="story-jewel absolute aspect-square -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${focus.anchor.x * 100}%`, top: `${focus.anchor.y * 100}%`, width: `${focus.scale * 100}%` }}
                >
                  <FormVisual product={product} formId={form.id} pieceTestId={() => "story-jewel-piece"} filter="drop-shadow(0 0.18em 0.2em rgba(30,15,10,0.55))" />
                </div>
              )}
            </div>
          </div>
        );
      })}
      {captions && (
        <p className="label-xs absolute bottom-4 left-4 max-w-[calc(100%-2rem)] bg-ink/75 px-3 py-2 leading-relaxed text-ivory">
          {focus.caption} · jewelry is a product overlay
          {internal && <span className="block text-ivory/70">Internal concept still · not for publication</span>}
        </p>
      )}
    </div>
  );
}
