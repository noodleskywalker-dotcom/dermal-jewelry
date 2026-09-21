"use client";

import { useState } from "react";
import { formOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { clampFocus, type CollectionStory, type StoryFocus, type StoryMedia } from "@/lib/story";
import { FormVisual } from "@/components/catalog/FormVisual";
import { artworkLabel, ProductPieces } from "@/components/catalog/ProductArtwork";

// The concept view of a story's product: a picture framed on the chosen piercing form, with the
// jewelry drawn over it as a separate overlay from the product asset. A picture never supplies the
// jewelry, so changing the character or the close-up later cannot change the product.
//
// Two honest exceptions, both set in the story data:
// - a picture that already has jewelry painted into it is shown as the prototype reference it is,
//   without an overlay on top, because the two together read as a double image;
// - a picture too small for its crop is shown in a smaller window with paper around it, rather than
//   being blown up until it goes soft.
// With no picture supplied, a plain product still is drawn instead.
export function StoryVisual({
  story,
  media,
  product,
  formId,
  captions = true,
}: {
  story: CollectionStory;
  media: StoryMedia;
  product: Product;
  formId: string;
  /** The cinematic carries its own captions and turns these off. */
  captions?: boolean;
}) {
  const form = formOf(product, formId);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const focus = product.slug === story.productSlug ? story.focus[form.id] : undefined;
  const usable = (f: StoryFocus | undefined): f is StoryFocus => Boolean(f && media[f.slot] && !failed[f.slot]);

  if (!usable(focus)) {
    return (
      <div data-testid="story-visual" data-form={form.id} data-media="placeholder" data-jewelry="overlay" className="absolute inset-0" style={{ backgroundImage: "linear-gradient(165deg, #f4f0e7 0%, #e9e2d4 60%, #dcd2bf 100%)" }}>
        <ProductPieces product={product} formId={form.id} scale={form.components.length > 1 ? 0.5 : 0.24} shadow="soft" />
        {captions && <p className="label-xs absolute inset-x-5 bottom-5 text-ink/55">{form.label} · {artworkLabel(product, form.id).toLowerCase()}</p>}
      </div>
    );
  }

  // One layer per picture. Forms that share a picture pan across it; a different picture cross-fades.
  const slots = [...new Set(Object.values(story.focus).filter(usable).map((f) => f.slot))];
  const painted = Boolean(story.slots.find((s) => s.id === focus.slot)?.paintedJewelry);

  return (
    <div data-testid="story-visual" data-form={form.id} data-media={focus.slot} data-jewelry={painted ? "painted-reference" : "overlay"} className="absolute inset-0">
      {slots.map((slotId) => {
        const slot = story.slots.find((s) => s.id === slotId);
        const active = slotId === focus.slot;
        const framing = active ? focus : Object.values(story.focus).find((f) => f.slot === slotId)!;
        const f = clampFocus(framing);
        const aspect = slot?.aspect ?? 1;
        const inset = framing.inset;
        return (
          <div
            key={slotId}
            aria-hidden="true"
            data-testid="story-window"
            data-slot={slotId}
            className="story-frame story-layer"
            style={
              inset
                ? { opacity: active ? 1 : 0, left: "50%", top: "48%", height: `${inset * 100}%`, aspectRatio: "4 / 5", maxWidth: "86%", translate: "-50% -50%" }
                : { opacity: active ? 1 : 0, inset: 0 }
            }
          >
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
              {active && !slot?.paintedJewelry && (
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
        <p className={`label-xs absolute inset-x-5 bottom-5 ${focus.inset ? "text-center text-ink/55" : "text-ivory/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]"}`}>
          {focus.caption} · concept
        </p>
      )}
    </div>
  );
}
