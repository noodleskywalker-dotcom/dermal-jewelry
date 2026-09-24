"use client";

import { createContext, useContext } from "react";

/**
 * Whether this storefront has real commerce, told once at the top of the tree.
 *
 * The owner's rule of 24 September 2026: the demo bag is a development fallback and nothing more.
 * The moment Shopify has one variant that is genuinely for sale, Shopify is the only cart on the
 * site — including on a piece that has no Shopify product of its own yet, which then reads as not
 * yet available instead of offering a demo line. Two purchasable carts are never run side by side.
 */
const CommerceLive = createContext(false);

export function CommerceProvider({ live, children }: { live: boolean; children: React.ReactNode }) {
  return <CommerceLive.Provider value={live}>{children}</CommerceLive.Provider>;
}

/** False while the store holds nothing for sale, which is the state today. */
export function useCommerceLive(): boolean {
  return useContext(CommerceLive);
}
