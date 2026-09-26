import { formOf, isFormId } from "@/lib/catalog";
import type { CatalogProvider, FormId } from "@/lib/catalog/types";

/** A line is one piercing form of one design. Two forms of the same design are two lines. */
export type BagLine = { productId: string; formId: FormId; quantity: number };
export type Bag = { lines: BagLine[] };

export const EMPTY_BAG: Bag = { lines: [] };
export const MAX_QUANTITY = 10;

const same = (line: BagLine, productId: string, formId: FormId) => line.productId === productId && line.formId === formId;

export function addToBag(bag: Bag, productId: string, formId: FormId, quantity = 1): Bag {
  const existing = bag.lines.find((l) => same(l, productId, formId));
  if (existing) return setQuantity(bag, productId, formId, existing.quantity + quantity);
  return { lines: [...bag.lines, { productId, formId, quantity: Math.min(MAX_QUANTITY, Math.max(1, quantity)) }] };
}

export function setQuantity(bag: Bag, productId: string, formId: FormId, quantity: number): Bag {
  if (quantity <= 0) return removeFromBag(bag, productId, formId);
  const q = Math.min(MAX_QUANTITY, Math.floor(quantity));
  return { lines: bag.lines.map((l) => (same(l, productId, formId) ? { ...l, quantity: q } : l)) };
}

export function removeFromBag(bag: Bag, productId: string, formId: FormId): Bag {
  return { lines: bag.lines.filter((l) => !same(l, productId, formId)) };
}

export function bagCount(bag: Bag): number {
  return bag.lines.reduce((n, l) => n + l.quantity, 0);
}

/** Demo subtotal from each form's demo price. Lines whose product no longer exists are ignored. */
export function bagSubtotal(bag: Bag, catalog: Pick<CatalogProvider, "getProductById">): number {
  return bag.lines.reduce((sum, l) => {
    const product = catalog.getProductById(l.productId);
    return product ? sum + formOf(product, l.formId).demoPrice * l.quantity : sum;
  }, 0);
}

/** Accepts only well-formed lines for known, available forms, so stale or tampered storage can't break the bag. */
export function sanitizeBag(value: unknown, catalog: Pick<CatalogProvider, "getProductById">): Bag {
  if (!value || typeof value !== "object" || !Array.isArray((value as Bag).lines)) return EMPTY_BAG;
  const lines: BagLine[] = [];
  for (const raw of (value as Bag).lines) {
    if (!raw || typeof raw.productId !== "string" || typeof raw.quantity !== "number") continue;
    if (!Number.isFinite(raw.quantity) || raw.quantity < 1) continue;
    const product = catalog.getProductById(raw.productId);
    if (!product || !isFormId(raw.formId)) continue;
    // A concept family's default form resolves but is not available, so it can never become a line.
    const form = formOf(product, raw.formId);
    if (form.id !== raw.formId || form.status !== "available") continue;
    if (lines.some((l) => same(l, raw.productId, raw.formId))) continue;
    lines.push({ productId: raw.productId, formId: raw.formId, quantity: Math.min(MAX_QUANTITY, Math.floor(raw.quantity)) });
  }
  return { lines };
}
