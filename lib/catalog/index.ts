import { demoProducts, placements } from "./demo-products";
import type { CatalogProvider, PlacementId } from "./types";

export type { Product, Placement, PlacementId, ProductComponent, ArtId } from "./types";
export { placements };

// Milestone 1 uses the demo provider only. A Shopify provider will implement the same interface.
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
