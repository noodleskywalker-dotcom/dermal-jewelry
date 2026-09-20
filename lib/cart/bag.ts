import type { CatalogProvider } from "@/lib/catalog/types";

export type BagLine = { productId: string; quantity: number };
export type Bag = { lines: BagLine[] };

export const EMPTY_BAG: Bag = { lines: [] };
export const MAX_QUANTITY = 10;

export function addToBag(bag: Bag, productId: string, quantity = 1): Bag {
  const existing = bag.lines.find((l) => l.productId === productId);
  if (existing) return setQuantity(bag, productId, existing.quantity + quantity);
  return { lines: [...bag.lines, { productId, quantity: Math.min(MAX_QUANTITY, Math.max(1, quantity)) }] };
}

export function setQuantity(bag: Bag, productId: string, quantity: number): Bag {
  if (quantity <= 0) return removeFromBag(bag, productId);
  const q = Math.min(MAX_QUANTITY, Math.floor(quantity));
  return { lines: bag.lines.map((l) => (l.productId === productId ? { ...l, quantity: q } : l)) };
}

export function removeFromBag(bag: Bag, productId: string): Bag {
  return { lines: bag.lines.filter((l) => l.productId !== productId) };
}

export function bagCount(bag: Bag): number {
  return bag.lines.reduce((n, l) => n + l.quantity, 0);
}

/** Demo subtotal from demo prices. Lines whose product no longer exists are ignored. */
export function bagSubtotal(bag: Bag, catalog: Pick<CatalogProvider, "getProductById">): number {
  return bag.lines.reduce((sum, l) => {
    const product = catalog.getProductById(l.productId);
    return product ? sum + product.demoPrice * l.quantity : sum;
  }, 0);
}

/** Accepts only well-formed lines for known products, so stale or tampered storage can't break the bag. */
export function sanitizeBag(value: unknown, catalog: Pick<CatalogProvider, "getProductById">): Bag {
  if (!value || typeof value !== "object" || !Array.isArray((value as Bag).lines)) return EMPTY_BAG;
  const lines: BagLine[] = [];
  for (const raw of (value as Bag).lines) {
    if (!raw || typeof raw.productId !== "string" || typeof raw.quantity !== "number") continue;
    if (!Number.isFinite(raw.quantity) || raw.quantity < 1) continue;
    if (!catalog.getProductById(raw.productId)) continue;
    if (lines.some((l) => l.productId === raw.productId)) continue;
    lines.push({ productId: raw.productId, quantity: Math.min(MAX_QUANTITY, Math.floor(raw.quantity)) });
  }
  return { lines };
}
