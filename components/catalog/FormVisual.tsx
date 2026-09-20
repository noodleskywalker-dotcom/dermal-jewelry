import { formOf } from "@/lib/catalog";
import { assetFor, layoutBounds, type Side } from "@/lib/catalog/assets";
import type { Product } from "@/lib/catalog/types";
import { resolveComponents } from "@/lib/studio/geometry";
import type { ComponentTweak } from "@/lib/studio/types";
import { JewelryArt } from "@/components/studio/JewelryArt";

// The one place a product form is drawn. It fills its parent, which must be the square group box.
// With an exact asset in the slot, that image is used. Otherwise the code-drawn concept artwork is
// drawn from the same layout, so every surface switches over together and nothing else changes.
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
  /** Test id prefix for each drawn piece. */
  pieceTestId?: (componentId: string) => string;
}) {
  const form = formOf(product, formId);
  const src = assetFor(product, form.id, side);

  if (src) {
    const bounds = layoutBounds(form.components, side);
    return (
      // The exact product asset. It is never flipped, recoloured or redrawn.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        draggable={false}
        data-testid="form-asset"
        data-form={form.id}
        className="pointer-events-none absolute block h-auto max-w-none select-none"
        style={{
          left: `${bounds.centerX * 100}%`,
          top: `${bounds.centerY * 100}%`,
          width: `${bounds.width * 100}%`,
          transform: "translate(-50%, -50%)",
          filter,
        }}
      />
    );
  }

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
          <JewelryArt art={c.art} />
        </span>
      ))}
    </>
  );
}

/** True when a form is shown from one exact image, so its pieces cannot be moved separately. */
export function hasExactAsset(product: Product, formId: string | undefined, side: Side): boolean {
  return Boolean(assetFor(product, formId, side));
}
