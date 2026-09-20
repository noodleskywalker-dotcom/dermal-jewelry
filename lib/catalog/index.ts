import { demoProducts, placements } from "./demo-products";
import type { CatalogProvider, FormId, PlacementId, Product, ProductForm } from "./types";

export type { Product, Placement, PlacementId, ProductComponent, ArtId, FormId, ProductForm, RevealConfig } from "./types";
export { placements };

// Milestone 1 uses the demo provider only. A Shopify provider will implement the same interface.
// A family page is one customer-facing page; how its forms map to Shopify products or variants
// is deliberately left open.
const demoProvider: CatalogProvider = {
  listProducts: () => demoProducts,
  getProduct: (slug) => demoProducts.find((p) => p.slug === slug),
  getProductById: (id) => demoProducts.find((p) => p.id === id),
  listByPlacement: (placement: PlacementId) => demoProducts.filter((p) => p.placements.includes(placement)),
};

export const catalog: CatalogProvider = demoProvider;

export function formatPrice(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US")}`;
}

export function placementLabel(id: PlacementId): string {
  return placements.find((p) => p.id === id)?.label ?? id;
}

export function isFormId(value: unknown): value is FormId {
  return value === "anti-eyebrow" || value === "micro-dermal" || value === "nose";
}

/**
 * The requested form when it exists and is available, otherwise the product's default form.
 * Unknown or concept-pending forms never leak into previews, Face Studio or the bag.
 */
export function formOf(product: Product, formId?: string | null): ProductForm {
  const match = product.forms.find((f) => f.id === formId && f.status === "available");
  return match ?? product.forms.find((f) => f.id === product.defaultFormId)!;
}

export function availableForms(product: Product): ProductForm[] {
  return product.forms.filter((f) => f.status === "available");
}
