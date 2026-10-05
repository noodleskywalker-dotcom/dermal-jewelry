import { formOf, renderFor } from "@/lib/catalog";
import { formAssets } from "@/lib/catalog/assets";
import type { Product } from "@/lib/catalog/types";
import { FormVisual } from "./FormVisual";

/** What the artwork for a form is, in plain words. Prototype art is never called a product photograph. */
export function artworkLabel(product: Product, formId?: string): string {
  if (renderFor(product, formId)) return "Design render";
  const form = formOf(product, formId);
  const exact = Boolean(formAssets(product, form.id, "left"));
  return exact && form.composition?.artClass === "prototype-product-art" ? "Prototype artwork" : "Concept artwork";
}

// Product-only still life. A completed photographic render fills its frame; other forms use
// their exact component artwork or the existing concept drawing.
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
  /** Kept for callers; it now only chooses the weight of the contact shadow. */
  tone?: "bone" | "ink" | "none";
}) {
  const label = artworkLabel(product, formId);
  const photographic = renderFor(product, formId)?.presentation === "photographic";
  return (
    <div
      role="img"
      aria-label={`${product.title}: ${label.toLowerCase()}. ${product.summary}`}
      data-presentation={photographic ? "photographic" : undefined}
      className={`relative overflow-hidden ${className ?? ""}`}
    >
      <ProductPieces product={product} formId={formId} scale={scale} shadow={tone === "ink" ? "dark" : "soft"} />
      {showLabel && (
        <span className={`label-xs absolute bottom-3 left-3 ${photographic ? "product-photograph-label" : tone === "ink" ? "text-ash" : "text-ink/55"}`}>{label}</span>
      )}
    </div>
  );
}

/** The selected form's photographic scene or component artwork, used by thumbnails and story stills. */
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
  const render = renderFor(product, formId);
  if (render?.presentation === "photographic") {
    return (
      <span className="product-photograph" data-presentation="photographic">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={render.catalogue.src} width={render.catalogue.width} height={render.catalogue.height} alt="" loading="lazy" decoding="async" draggable={false} />
      </span>
    );
  }
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
