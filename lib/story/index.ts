import { formOf } from "@/lib/catalog";
import type { Product, ProductForm } from "@/lib/catalog/types";
import type { CollectionStory, ScatterSpot, StoryBeat, StoryFocus } from "./types";

export type { CollectionStory, ScatterSpot, StoryBeat, StoryBeatId, StoryEffect, StoryFocus, StoryMedia, StoryMediaSlot } from "./types";

// Pure helpers only. The story registry lives in `./registry` and is read by server code, so working
// names of internal concept characters never travel in a client bundle.

export function totalSeconds(story: CollectionStory): number {
  return story.beats.reduce((end, beat) => Math.max(end, beat.to), 0);
}

/** The beat playing at a time in seconds. Past the end it is the last beat. */
export function beatAt(story: CollectionStory, seconds: number): StoryBeat {
  return story.beats.find((b) => seconds >= b.from && seconds < b.to) ?? story.beats[story.beats.length - 1];
}

/**
 * Whether the cinematic may play at all.
 * Internal review can always see the labelled animatic. A customer-facing build plays it only once
 * real footage exists and the story is approved, so an unfinished story is never shown as finished.
 */
export function canPlayCinematic(story: CollectionStory, context: { internal: boolean; reducedMotion: boolean }): boolean {
  if (context.reducedMotion) return false;
  if (context.internal) return true;
  const r = story.readiness;
  return r.sourceVideo === "available" && r.rightsCleared && r.approvedForPublication;
}

/** Keeps a framing inside its picture, so zooming toward an edge never uncovers the page behind. */
export function clampFocus(focus: Pick<StoryFocus, "x" | "y" | "zoom">): { x: number; y: number; zoom: number } {
  const zoom = Math.max(1, focus.zoom);
  const margin = 0.5 / zoom;
  const clamp = (v: number) => Math.min(1 - margin, Math.max(margin, v));
  return { x: clamp(focus.x), y: clamp(focus.y), zoom };
}

export type FloatingPiece = { product: Product; form: ProductForm; spot: ScatterSpot };

/**
 * The jewelry objects to float on the canvas. A spot is dropped when its product is missing or its
 * form is not available, so a concept-pending form can never appear as something to buy.
 */
export function floatingPieces(story: CollectionStory, products: Product[]): FloatingPiece[] {
  return story.scatter.flatMap((spot) => {
    const product = products.find((p) => p.slug === spot.productSlug);
    if (!product) return [];
    const form = formOf(product, spot.formId);
    return form.id === spot.formId ? [{ product, form, spot }] : [];
  });
}

/**
 * A point of a picture, in page pixels, when the picture is fitted inside a box with
 * `object-fit: contain` and `object-position: left bottom`. `point` is 0 to 1 across the picture.
 */
export function pointOnContained(box: { left: number; top: number; width: number; height: number }, aspect: number, point: { x: number; y: number }): { x: number; y: number } {
  const width = Math.min(box.width, box.height * aspect);
  const height = width / aspect;
  return { x: box.left + point.x * width, y: box.top + box.height - height + point.y * height };
}

export const STORY_SEEN_PREFIX = "dermal-story-seen:";
