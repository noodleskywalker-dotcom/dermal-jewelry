"use client";

import { useState } from "react";
import { formOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { purchaseState } from "@/lib/commerce/display";
import { bagActions } from "@/lib/cart/store";
import { cartActions, useShopifyCart } from "@/lib/cart/shopify-store";
import { useCommerceLive } from "@/components/commerce/CommerceProvider";

/**
 * One button, two backings.
 *
 * When Shopify has a variant that is genuinely for sale, this adds a real Shopify cart line and the
 * bag's totals come from Shopify. When it does not — which is every piece while the store is still
 * empty — the piece can be saved in a local design selection without a price or checkout.
 * A concept is never given a button at all.
 *
 * Nothing here invents a variant from a visual form: a form the store does not sell cannot be added.
 */
export function AddToBagButton({ product, formId, className }: { product: Product; formId?: string; className?: string }) {
  const [added, setAdded] = useState<string | null>(null);
  const form = formOf(product, formId);
  const commerceLive = useCommerceLive();
  const { cart, status, error } = useShopifyCart();
  const purchase = purchaseState(product, form.id, commerceLive || cart !== null);

  // A concept, and a piece with no Shopify variant once the store is really selling, have nothing
  // to add. They are presented, and the note beside them says so where the button would be.
  if (!purchase.action) {
    return purchase.note ? (
      <p className={`label-xs text-ash ${className ?? ""}`} data-testid="purchase-unavailable">
        {purchase.note}
      </p>
    ) : null;
  }

  const busy = status === "busy";

  return (
    <div className={className}>
      <button
        type="button"
        data-testid="add-to-bag"
        data-backing={purchase.canSaveSelection ? "demo" : "shopify"}
        disabled={busy || (!purchase.canBuy && !purchase.canSaveSelection)}
        onClick={async () => {
          if (busy) return;
          if (purchase.canBuy && purchase.merchandiseId) {
            await cartActions.add(purchase.merchandiseId);
            bagActions.openDrawer();
            return;
          }
          // A sold-out or unmapped Shopify form must never fall through into local selection storage.
          if (!purchase.canSaveSelection) return;
          bagActions.add(product.id, form.id);
          bagActions.openDrawer();
          setAdded(form.id);
        }}
        className="min-h-12 w-full bg-garnet px-7 text-xs uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-[#a52a41] disabled:opacity-60"
      >
        {busy ? "Adding…" : purchase.action}
      </button>
      <p role="status" className="mt-2 min-h-4 text-xs text-ash">
        {error && !purchase.canSaveSelection
          ? error
          : added === form.id
            ? `${product.title}, ${form.label} form, saved to your selection.`
            : ""}
      </p>
    </div>
  );
}
