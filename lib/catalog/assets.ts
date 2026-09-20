import manifestJson from "./asset-manifest.json";
import type { Product, ProductComponent } from "./types";
import { formOf } from "./index";

// The exact product asset slot. One transparent image per form (and optionally one for the wearer's
// right side) is the single visual source for that form everywhere: Face Studio, placement preview,
// product page, personalized previews, the reveal ending and bag thumbnails.
// Until a file is supplied, every surface falls back to the code-drawn concept artwork.

export type AssetManifest = Record<string, string>;
const MANIFEST = manifestJson as AssetManifest;

export type Side = "left" | "right";

/**
 * The exact asset for a form and side, or undefined when none has been supplied.
 * The wearer's right needs its own file: mirroring the left image would flip the symbol, which is
 * never allowed, so without a right-side file that side keeps the fallback artwork.
 */
export function assetFor(product: Product, formId: string | undefined, side: Side, manifest: AssetManifest = MANIFEST): string | undefined {
  const form = formOf(product, formId);
  return manifest[`${product.slug}:${form.id}:${side}`];
}

/**
 * Where the asset sits inside the square group box: the bounding box of the form's authored layout,
 * as fractions of the box. A tightly cropped asset is fitted to this width and centred on it, so it
 * occupies the same place, at the same size, as the artwork it replaces.
 */
export function layoutBounds(components: ProductComponent[], side: Side) {
  const sign = side === "left" ? 1 : -1;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const c of components) {
    const cx = 0.5 + sign * c.x;
    const cy = 0.5 + c.y;
    minX = Math.min(minX, cx - c.size / 2);
    maxX = Math.max(maxX, cx + c.size / 2);
    minY = Math.min(minY, cy - c.size / 2);
    maxY = Math.max(maxY, cy + c.size / 2);
  }
  if (!components.length) return { centerX: 0.5, centerY: 0.5, width: 1, height: 1 };
  return { centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2, width: maxX - minX, height: maxY - minY };
}
