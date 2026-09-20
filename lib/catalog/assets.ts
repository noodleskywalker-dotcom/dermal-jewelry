import manifestJson from "./asset-manifest.json";
import type { Product } from "./types";
import { formOf } from "./index";

// The exact product asset slot. Each piece of a form has its own transparent source image, and the
// form's `components` metadata (offset, size, rotation) is the single description of how the pieces
// sit together. Every surface composes the same images through that metadata, so there is one
// representation of the product, and Face Studio can still move each piece on its own.
// Until every piece of a form has an image, the whole form falls back to the code-drawn artwork.

export type AssetManifest = Record<string, string>;
const MANIFEST = manifestJson as AssetManifest;

export type Side = "left" | "right";

const key = (slug: string, formId: string, componentId: string, side: Side) => `${slug}:${formId}:${componentId}:${side}`;

/**
 * Image for one piece on one side, or undefined.
 * A dedicated right-side image wins when supplied. Otherwise the one approved image is reused on the
 * right at its mirrored position. It is never flipped, so the symbol can never be mirrored by accident.
 */
export function componentAsset(
  product: Product,
  formId: string | undefined,
  componentId: string,
  side: Side,
  manifest: AssetManifest = MANIFEST,
): string | undefined {
  const form = formOf(product, formId);
  return manifest[key(product.slug, form.id, componentId, side)] ?? manifest[key(product.slug, form.id, componentId, "left")];
}

/**
 * Images for every piece of a form, keyed by component id, or null when any piece is missing.
 * Exact art and drawn art are never mixed inside one form.
 */
export function formAssets(
  product: Product,
  formId: string | undefined,
  side: Side,
  manifest: AssetManifest = MANIFEST,
): Record<string, string> | null {
  const form = formOf(product, formId);
  const result: Record<string, string> = {};
  for (const component of form.components) {
    const src = componentAsset(product, form.id, component.id, side, manifest);
    if (!src) return null;
    result[component.id] = src;
  }
  return form.components.length ? result : null;
}
