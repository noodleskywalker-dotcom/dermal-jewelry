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

export type FormId = "anti-eyebrow" | "micro-dermal" | "nose";

/**
 * One piercing form of a design family. A family page shows several forms of the same design.
 * Only forms whose demo configuration really exists are "available".
 */
export type ProductForm = {
  id: FormId;
  label: string;
  status: "available" | "concept-pending";
  /** Placement profile used for previews and Face Studio defaults. */
  placement: PlacementId;
  components: ProductComponent[];
  /** Default group width as a fraction of the photo width. */
  defaultScale: number;
  /** Demo-only placeholder price, not an approved selling price. */
  demoPrice: number;
  packageContents: string;
  /** Honest note about how final this form's design is. */
  note: string;
};

export type RevealMode = "none" | "loop" | "mini-scene";

/** Each readiness step is tracked on its own so nothing is reported as finished early. */
export type RevealReadiness = {
  playerImplemented: boolean;
  storyboardPrepared: boolean;
  sourceVideo: "missing" | "available";
  approvedForPublication: boolean;
};

export type RevealConfig = {
  mode: RevealMode;
  /** Motion language. Anime-inspired pieces get their own; originals use product-led motion. */
  identity: "sand-impact" | "metal-sweep" | "none";
  title: string;
  /** Prepared media file. Reveals are never generated while a customer shops. */
  src?: string;
  /** Hard ceiling for a mini-scene, including its final jewelry reveal. */
  maxSeconds: number;
  readiness: RevealReadiness;
};

export type Product = {
  /** Demo identifiers are prefixed "demo-" and must never be sent to Shopify. */
  id: string;
  slug: string;
  title: string;
  collection: string;
  /** "anime-inspired" is a design influence only. It never means an official collaboration. */
  origin: "anime-inspired" | "original";
  isDemo: true;
  currency: "QAR";
  summary: string;
  story: string;
  forms: ProductForm[];
  defaultFormId: FormId;
  reveal: RevealConfig;
  specs: { label: string; value: string; status: SpecStatus }[];

  // Convenience copies of the default form, used by listings and filters.
  placements: PlacementId[];
  demoPrice: number;
  packageContents: string;
  components: ProductComponent[];
  defaultScale: number;
  defaultRotation: number;
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
