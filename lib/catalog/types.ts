export type PlacementId =
  | "anti-eyebrow"
  | "dermal"
  | "eyebrow"
  | "nostril"
  | "septum"
  | "lip";

export type ArtId =
  | "love-symbol"
  | "garnet-gem"
  | "vortex"
  | "vortex-stud"
  | "orbit"
  | "void"
  | "cross-line"
  | "cross-mark"
  | "ankh"
  | "horus-piece"
  | "horus-eye"
  | "dark-gem";

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
  /** Default rotation in degrees. Omitted means 0. */
  rotation?: number;
  /**
   * True when the piece looks the same from either side, so one image serves both.
   * A piece that is not symmetric (the symbol) is still never mirrored: its one approved
   * orientation is reused on the other side unless a dedicated right-side image is supplied.
   */
  symmetric?: boolean;
};

/** How trustworthy the artwork for a form is. It says nothing about the physical product. */
export type ArtClass =
  | "concept-fallback" // code-drawn stand-in
  | "prototype-product-art" // signed-off illustration for the website prototype only
  | "commercial-product-asset"; // manufacturer or CAD render, or photography of the made product

/** The approved default relationship between a form's pieces. The pieces themselves are in `components`. */
export type Composition = {
  approved: boolean;
  artClass: ArtClass;
  note: string;
};

/** A material callout. `stone` is shown only on forms that carry a stone. */
export type MaterialNote = { id: "metal" | "stone" | "finish"; label: string; status: string };

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
  /**
   * "integrated" means the artwork is the whole piercing, hardware included, so no separate post or
   * base is drawn for it. Omitted means the concept hardware is drawn under the decorative tops.
   */
  hardware?: "integrated";
  /** Approval and artwork status of this arrangement. Omitted means unapproved concept fallback. */
  composition?: Composition;
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

/**
 * An approved product animation: prepared media that presents one or more forms of a design. It is
 * storytelling and presentation only. Face Studio never uses it, the jewelry geometry never comes
 * from it, and material words are HTML laid over it at the right moments, never baked into the film.
 */
export type ProductFilm = {
  /** Which forms the film shows. Other forms of the design fall back to the drawn assembly. */
  forms: FormId[];
  /** Web delivery files, listed in order of preference. The original master stays out of the repo. */
  sources: { src: string; type: string }[];
  /** First frame, shown before anything loads. */
  poster: string;
  /** The completed piece, held after the film, and shown instead of it with reduced motion or on failure. */
  final: string;
  durationSeconds: number;
  /** Material words shown over the film from a given second. Only safe, unverified wording. */
  captions: { at: number; label: string; status: string }[];
  classification: "prototype-product-animation";
  approvedForPublication: boolean;
};

/**
 * Prepared media for one piece: a hero still, an optional short ambient clip, and close views.
 * It is generated from the owner's approved reference and keeps the piece's shape; it is never
 * photography of a made product, and `note` says what it is on the page.
 */
export type ProductMedia = {
  hero: string;
  poster?: string;
  film?: { src: string; type: string }[];
  angle?: string;
  macro?: string;
  note: string;
};

/** Who a piece is presented to when browsing. A piece for everyone is "unisex" and shows under men and women. */
export type Audience = "men" | "women" | "unisex";
/**
 * The lines a piece belongs to. "full" is the full collection; "inspired" and "original" follow the
 * design's origin; "limited" is a limited edition and is only ever set when the owner announces one.
 */
export type Line = "full" | "inspired" | "original" | "signature" | "symbolic" | "ancient" | "featured" | "limited";

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
  /** Browsing only. Defaults to unisex until the owner assigns a piece. */
  audience: Audience;
  /** Browsing only. Every piece is in the full collection; inspired or original follows its origin. */
  lines: Line[];
  reveal: RevealConfig;
  /** An approved product animation for some forms. Without one, the drawn assembly is the product view. */
  film?: ProductFilm;
  specs: { label: string; value: string; status: SpecStatus }[];
  /**
   * What each part is made of, as far as anyone has said. "Proposed" is the owner's intention, not a
   * maker's confirmation. Nothing here is a verified fact until a supplier confirms it.
   */
  materials?: MaterialNote[];
  /** Prepared media for the product stage. Without it, the drawn assembly is the product view. */
  media?: ProductMedia;
  /** An optional themed opening for the assembly view. The standard assembly never depends on it. */
  assembly?: { themed?: { id: string; description: string; status: "not-produced" | "available" } };

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
