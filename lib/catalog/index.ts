import { demoProducts, placements } from "./demo-products";
import type { CatalogProvider, FormId, PlacementId, Product, ProductFilm, ProductForm } from "./types";

export type { Product, Placement, PlacementId, ProductComponent, ArtId, FormId, ProductFilm, ProductForm, RevealConfig } from "./types";
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

/**
 * A title for display: the dash in "DESERT EYE — LOVE" is tied to the words around it, so a narrow
 * column breaks as "DESERT / EYE — LOVE" and never leaves a dash on its own. The stored title is unchanged.
 */
export function displayTitle(title: string): string {
  return title.replace(/ — /g, " — ");
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

/** Browse filters beyond placement: audience and line. */
export type BrowseFilter = "men" | "women" | "inspired" | "original" | "limited";

export function matchesBrowse(product: Product, filter: BrowseFilter): boolean {
  if (filter === "men" || filter === "women") return product.audience === filter || product.audience === "unisex";
  return product.lines.includes(filter);
}

export function availableForms(product: Product): ProductForm[] {
  return product.forms.filter((f) => f.status === "available");
}

/**
 * The approved product animation for a form, when one exists and may be shown. A form the film does
 * not cover, or a film not approved for publication, gets nothing: the drawn assembly stands instead.
 */
export function filmFor(product: Product, formId?: string | null): ProductFilm | undefined {
  const form = formOf(product, formId);
  const film = product.film;
  return film && film.approvedForPublication && film.forms.includes(form.id) ? film : undefined;
}
