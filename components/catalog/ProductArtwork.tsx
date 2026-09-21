import { formOf } from "@/lib/catalog";
import { formAssets } from "@/lib/catalog/assets";
import type { Product } from "@/lib/catalog/types";
import { FormVisual } from "./FormVisual";

/** What the artwork for a form is, in plain words. Prototype art is never called a product photograph. */
export function artworkLabel(product: Product, formId?: string): string {
  const form = formOf(product, formId);
  const exact = Boolean(formAssets(product, form.id, "left"));
  return exact && form.composition?.artClass === "prototype-product-art" ? "Prototype artwork" : "Concept artwork";
}

// Product-only still life used wherever final photography is missing. The pieces come from
// FormVisual, so an exact asset in the slot replaces the concept artwork here as well.
export function ProductArtwork({
  product,
  className,
  scale = 0.62,
  showLabel = true,
  tone = "bone",
  formId,
}: {
  product: Product;
  /** Which piercing form to draw. Defaults to the product's default form. */
  formId?: string;
  className?: string;
  /** Group width as a fraction of the box. */
  scale?: number;
  showLabel?: boolean;
  /** Warm paper for editorial layouts, ink for small thumbnails inside dark UI. */
  tone?: "bone" | "ink" | "none";
}) {
  const surface = tone === "bone" ? "bg-bone" : tone === "ink" ? "bg-coal" : "";
  const label = artworkLabel(product, formId);
  return (
    <div
      role="img"
      aria-label={`${product.title}: ${label.toLowerCase()}. ${product.summary}`}
      className={`relative overflow-hidden ${surface} ${className ?? ""}`}
      style={tone === "bone" ? { backgroundImage: "linear-gradient(165deg, #ece8df 0%, #e2ddd1 55%, #d3cdbf 100%)" } : undefined}
    >
      <ProductPieces product={product} formId={formId} scale={scale} shadow={tone === "ink" ? "dark" : "soft"} />
      {showLabel && (
        <span className={`label-xs absolute bottom-3 left-3 ${tone === "ink" ? "text-ash" : "text-ink/55"}`}>{label}</span>
      )}
    </div>
  );
}

/** The bare pieces, centred in their parent. Used by tiles, the homepage, bag thumbnails and the reveal ending. */
export function ProductPieces({
  product,
  scale,
  shadow = "soft",
  formId,
}: {
  product: Product;
  formId?: string;
  scale: number;
  shadow?: "soft" | "dark" | "none";
}) {
  const filter =
    shadow === "soft"
      ? "drop-shadow(0 1.2vw 1vw rgba(40,30,20,0.28)) drop-shadow(0 0.2vw 0.2vw rgba(40,30,20,0.35))"
      : shadow === "dark"
        ? "drop-shadow(0 10px 18px rgba(0,0,0,0.6))"
        : undefined;
  return (
    <div className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2" style={{ width: `${scale * 100}%` }}>
      <FormVisual product={product} formId={formId} filter={filter} />
    </div>
  );
}
