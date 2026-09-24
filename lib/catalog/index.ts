import { demoProducts, placements } from "./demo-products";
import type { CatalogProvider, FormId, Line, PlacementId, Product, ProductFilm, ProductForm } from "./types";

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
  // A concept product has no price yet. Zero is never a real demo price, so it reads as undecided.
  if (!amount) return "Price pending";
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

/** Browse filters beyond placement: audience and line. "full" is the whole collection. */
export type BrowseFilter = "men" | "women" | "full" | "inspired" | "original" | "limited";

const LINE_LABELS: Record<Exclude<Line, "full">, string> = {
  inspired: "Inspired",
  original: "Original",
  signature: "Signature",
  symbolic: "Symbolic",
  ancient: "Ancient",
  weapon: "Weapon form",
  featured: "Featured",
  limited: "Limited edition",
};

/** The lines a piece is browsed under, without the full collection, which holds everything. */
export function lineLabels(product: Product): string[] {
  return product.lines.filter((l): l is Exclude<Line, "full"> => l !== "full").map((l) => LINE_LABELS[l]);
}

/**
 * The kind of piece, for a catalogue label: its lines without the launch marker, which is shown
 * separately so a featured piece is marked once and never twice.
 */
export function kindLabels(product: Product): string[] {
  return product.lines
    .filter((l): l is Exclude<Line, "full" | "featured"> => l !== "full" && l !== "featured")
    .map((l) => LINE_LABELS[l]);
}

/** A featured piece carries one small marker in the catalogue. It never earns a larger stage. */
export function isFeatured(product: Product): boolean {
  return product.lines.includes("featured");
}

export function matchesBrowse(product: Product, filter: BrowseFilter): boolean {
  if (filter === "men" || filter === "women") return product.audience === filter || product.audience === "unisex";
  return product.lines.includes(filter);
}

/**
 * How much a family's artwork is scaled **for presentation only**, inside the equal stage it shares
 * with every other family (the owner's polish pass, 24 September 2026).
 *
 * Equal stages are right, but a thin bar and a broad symbol do not read as equals when both are
 * drawn at their authored size: measured as a share of its stage, CROSSLINE's ink came to 33% and
 * DESERT EYE's to 96%, so one vanished and the other shouted. These multipliers bring the perceived
 * mass into a band without flattening the pieces: a thin form stays thin, it simply stops
 * disappearing. They were chosen from measurements, not by eye — see docs/TEST_REPORT.md.
 *
 * Each multiplier is capped so the piece's ink still fits inside its own stage, because a form that
 * reaches past the stage is clipped at the edge of the page rather than made to look larger.
 *
 * This is presentation and nothing else. It never touches a form's `defaultScale` or a component's
 * size, so Face Studio, the placement preview, the bag and every physical measurement are unchanged.
 */
const PRESENTATION_SCALE: Record<string, number> = {
  "desert-eye-love": 0.76,
  "horus-trace": 1.05,
  "blade-trace": 1.08,
  crossline: 1.3,
  "ankh-trace": 1.15,
  "crimson-orbit": 0.9,
  "void-stud": 0.88,
};

export function presentationScale(product: Product): number {
  return PRESENTATION_SCALE[product.slug] ?? 1;
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
