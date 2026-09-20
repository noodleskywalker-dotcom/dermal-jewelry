export type PlacementId =
  | "anti-eyebrow"
  | "dermal"
  | "eyebrow"
  | "nostril"
  | "septum"
  | "lip";

export type ArtId = "love-symbol" | "garnet-gem" | "vortex" | "vortex-stud" | "orbit" | "void";

/** One visual piece of a product, laid out in the product's local unit box. */
export type ProductComponent = {
  id: string;
  label: string;
  art: ArtId;
  /**
   * Offset from the group centre in group units, authored for the wearer's LEFT side
   * (which appears on the viewer's right in an unmirrored photo). +x is outward, +y is down.
   */
  x: number;
  y: number;
  /** Width as a fraction of the group unit. */
  size: number;
};

export type SpecStatus = "unverified" | "verified";

export type Product = {
  /** Demo identifiers are prefixed "demo-" and must never be sent to Shopify. */
  id: string;
  slug: string;
  title: string;
  collection: string;
  placements: PlacementId[];
  isDemo: true;
  /** Demo-only placeholder price, not an approved selling price. */
  demoPrice: number;
  currency: "QAR";
  summary: string;
  story: string;
  packageContents: string;
  components: ProductComponent[];
  /** Default group width as a fraction of the photo width. */
  defaultScale: number;
  /** Default group rotation in degrees for the wearer's left side. */
  defaultRotation: number;
  specs: { label: string; value: string; status: SpecStatus }[];
};

export type Placement = {
  id: PlacementId;
  label: string;
  note: string;
};

/** Shared contract for the demo catalog now and a Shopify-backed catalog later. */
export interface CatalogProvider {
  listProducts(): Product[];
  getProduct(slug: string): Product | undefined;
  getProductById(id: string): Product | undefined;
  listByPlacement(placement: PlacementId): Product[];
}
