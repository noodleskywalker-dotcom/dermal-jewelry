import { formOf } from "@/lib/catalog";
import { formAssets, type Side } from "@/lib/catalog/assets";
import type { ArtId, Product } from "@/lib/catalog/types";
import { resolveComponents } from "@/lib/studio/geometry";
import type { ComponentTweak } from "@/lib/studio/types";
import { JewelryArt } from "@/components/studio/JewelryArt";

/**
 * One piece of a form: its exact source image when the form has images for all of its pieces,
 * otherwise the code-drawn fallback. The image is never flipped, recoloured or redrawn.
 */
export function PieceArt({
  product,
  formId,
  componentId,
  art,
  side = "left",
}: {
  product: Product;
  formId?: string;
  componentId: string;
  art: ArtId;
  side?: Side;
}) {
  const src = formAssets(product, formId, side)?.[componentId];
  if (!src) return <JewelryArt art={art} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      data-testid="piece-asset"
      data-component={componentId}
      className="pointer-events-none block h-auto w-full select-none"
    />
  );
}

// The one place a finished form is composed for display. It fills its parent, which must be the
// square group box, and lays the pieces out from the form's composition metadata. Face Studio uses
// the same metadata and the same PieceArt, so there is no second representation of the product.
export function FormVisual({
  product,
  formId,
  side = "left",
  tweaks = {},
  filter,
  pieceTestId,
}: {
  product: Product;
  formId?: string;
  side?: Side;
  tweaks?: Record<string, ComponentTweak>;
  /** Optional CSS filter, used for soft contact shadows on paper. */
  filter?: string;
  /** Test id for each drawn piece. */
  pieceTestId?: (componentId: string) => string;
}) {
  const form = formOf(product, formId);
  return (
    <>
      {resolveComponents(product, { side, tweaks, formId: form.id }).map((c) => (
        <span
          key={c.id}
          data-testid={pieceTestId?.(c.id)}
          className="pointer-events-none absolute block"
          style={{
            left: `${c.leftPct}%`,
            top: `${c.topPct}%`,
            width: `${c.widthPct}%`,
            transform: `translate(-50%, -50%) rotate(${c.rotation}deg)`,
            filter,
          }}
        >
          <PieceArt product={product} formId={form.id} componentId={c.id} art={c.art} side={side} />
        </span>
      ))}
    </>
  );
}
