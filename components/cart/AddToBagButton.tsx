"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog/types";
import { bagActions } from "@/lib/cart/store";

export function AddToBagButton({ product, className }: { product: Product; className?: string }) {
  const [added, setAdded] = useState(false);
  return (
    <div className={className}>
      <button
        type="button"
        data-testid="add-to-bag"
        onClick={() => {
          bagActions.add(product.id);
          bagActions.openDrawer();
          setAdded(true);
        }}
        className="min-h-12 w-full bg-garnet px-7 text-xs uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-[#a52a41]"
      >
        Add to demo bag
      </button>
      <p role="status" className="mt-2 min-h-4 text-xs text-ash">
        {added ? `${product.title} added to your demo bag.` : ""}
      </p>
    </div>
  );
}
