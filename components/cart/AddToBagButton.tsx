"use client";

import { useState } from "react";
import { formOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { purchaseState } from "@/lib/commerce/display";
import { bagActions } from "@/lib/cart/store";
import { cartActions, useShopifyCart } from "@/lib/cart/shopify-store";

/**
 * One button, two backings.
 *
 * When Shopify has a variant that is genuinely for sale, this adds a real Shopify cart line and the
 * bag's totals come from Shopify. When it does not — which is every piece while the store is still
 * empty — the piece keeps its editorial presentation and the demo bag, which says it is a demo.
 * A concept is never given a button at all.
 *
 * Nothing here invents a variant from a visual form: a form the store does not sell cannot be added.
 */
export function AddToBagButton({ product, formId, className }: { product: Product; formId?: string; className?: string }) {
  const [added, setAdded] = useState<string | null>(null);
  const form = formOf(product, formId);
  const purchase = purchaseState(product, form.id);
  const { status, error } = useShopifyCart();

  // A concept has nothing to add. It is presented, and says so where the button would be.
  if (!purchase.action) return null;

  const busy = status === "busy";

  return (
    <div className={className}>
      <button
        type="button"
        data-testid="add-to-bag"
        data-backing={purchase.canBuy ? "shopify" : "demo"}
        disabled={busy || (!purchase.canBuy && !!purchase.merchandiseId)}
        onClick={async () => {
          if (purchase.canBuy && purchase.merchandiseId) {
            await cartActions.add(purchase.merchandiseId);
            bagActions.openDrawer();
            setAdded(form.id);
            return;
          }
          bagActions.add(product.id, form.id);
          bagActions.openDrawer();
          setAdded(form.id);
        }}
        className="min-h-12 w-full bg-garnet px-7 text-xs uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-[#a52a41] disabled:opacity-60"
      >
        {busy ? "Adding…" : purchase.action}
      </button>
      <p role="status" className="mt-2 min-h-4 text-xs text-ash">
        {error
          ? error
          : added === form.id
            ? `${product.title}, ${form.label} form, added to your ${purchase.canBuy ? "bag" : "demo bag"}.`
            : ""}
      </p>
    </div>
  );
}
