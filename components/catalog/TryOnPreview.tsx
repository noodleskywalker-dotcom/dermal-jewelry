"use client";

import Link from "next/link";
import { formOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { previewItems } from "@/lib/studio/look";
import { LookRenderer } from "@/components/studio/LookRenderer";
import { PhotoPicker } from "@/components/studio/PhotoPicker";
import { useStudio } from "@/components/studio/StudioProvider";

// Personalized still preview. It reuses the Studio renderer and the customer's current placement,
// follows the piercing form chosen for this design, and does no detection, generation or network work.
export function TryOnPreview({
  product,
  formId,
  onNavigate,
  allowUpload = false,
}: {
  product: Product;
  /** Defaults to the form the customer last chose for this design. */
  formId?: string;
  onNavigate?: () => void;
  /** Only surfaces that stay open while the file dialog is showing may host the picker. */
  allowUpload?: boolean;
}) {
  const { photo, look, forms } = useStudio();
  const form = formOf(product, formId ?? forms[product.id]);
  const items = previewItems(look, product, form.id);
  // Zoom towards the previewed piece so small jewelry is readable in a compact panel.
  const focusItem = items.find((i) => i.productId === product.id) ?? items[0];

  return (
    <div data-testid="tryon-preview" data-product={product.slug} data-form={form.id}>
      <p className="label-xs text-ash">On you · {form.label}</p>
      <p className="mt-1 font-display text-xl font-light leading-tight">{product.title}</p>

      {photo ? (
        <>
          <div className="mt-4 aspect-[4/5] w-full bg-ink">
            <LookRenderer
              photo={photo}
              items={items}
              zoom={focusItem ? { x: focusItem.group.x, y: focusItem.group.y, factor: 2.4 } : undefined}
              label={`Virtual preview of ${product.title}, ${form.label} form, on your photo`}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ash">
            Approximate virtual preview using your current placement. Adjust it in Face Studio.
          </p>
        </>
      ) : (
        <div className="mt-4">
          <p className="text-sm leading-relaxed text-ash">
            Add a photo once and every piece previews on you. A sample model isn&rsquo;t available yet.
          </p>
          {allowUpload && <PhotoPicker className="mt-4" label="Use my photo" compact />}
        </div>
      )}

      <Link href={`/face-studio?product=${product.slug}&form=${form.id}`} onClick={onNavigate} className="text-link mt-3">
        Open in Face Studio <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
