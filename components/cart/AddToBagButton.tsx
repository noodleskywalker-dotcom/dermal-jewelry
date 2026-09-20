"use client";

import { useState } from "react";
import { formOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { bagActions } from "@/lib/cart/store";

export function AddToBagButton({ product, formId, className }: { product: Product; formId?: string; className?: string }) {
  const [added, setAdded] = useState<string | null>(null);
  const form = formOf(product, formId);
  return (
    <div className={className}>
      <button
        type="button"
        data-testid="add-to-bag"
        onClick={() => {
          bagActions.add(product.id, form.id);
          bagActions.openDrawer();
          setAdded(form.id);
        }}
        className="min-h-12 w-full bg-garnet px-7 text-xs uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-[#a52a41]"
      >
        Add to demo bag
      </button>
      <p role="status" className="mt-2 min-h-4 text-xs text-ash">
        {added === form.id ? `${product.title}, ${form.label} form, added to your demo bag.` : ""}
      </p>
    </div>
  );
}
