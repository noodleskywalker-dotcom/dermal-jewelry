import type { FormId, Line, PlacementId, Product } from "@/lib/catalog/types";

/**
 * The one product model the interface reads.
 *
 * Two concerns meet here and are deliberately kept apart:
 *
 * - **Editorial** belongs to DERMAL and stays in the repository: the design family, its forms and
 *   placement geometry, its artwork, its motion, its world, its Face Studio coordinates, and the
 *   honest status of everything not yet confirmed. Shopify never owns any of it.
 * - **Commerce** belongs to Shopify once a product exists there: the price, the variants, what is
 *   actually for sale, and the merchandise ids a cart is built from. The storefront never invents
 *   any of it.
 *
 * A piece that has no Shopify product is not broken and is not hidden. It keeps its whole editorial
 * presentation and is simply not purchasable, which is the truth while the store is still empty.
 */

export type Money = { amount: number; currencyCode: string };

/** One thing that can actually be bought. It exists only because Shopify says it does. */
export type CommerceVariant = {
  /** The merchandise id a cart line is built from. */
  id: string;
  title: string;
  availableForSale: boolean;
  /** Null when Shopify does not track or expose inventory for it. */
  quantityAvailable: number | null;
  sku: string | null;
  price: Money;
  compareAtPrice: Money | null;
  options: { name: string; value: string }[];
  /**
   * The editorial form this variant sells, when the mapping can tell. A visual form and a
   * purchasable variant are separate things: this is null until a real variant says otherwise.
   */
  formId: FormId | null;
};

/**
 * Why a piece can or cannot be bought. It is a closed set so no surface has to guess, and there is
 * deliberately no state that means "probably purchasable".
 */
export type CommerceStatus =
  | "live" // a Shopify product is matched and something on it is for sale
  | "sold-out" // matched, but nothing is available
  | "unmatched" // no Shopify product carries this handle yet
  | "concept" // a direction, not a product: never purchasable
  | "unavailable"; // Shopify could not be reached on this render

export type CommerceRecord = {
  status: CommerceStatus;
  /** Shopify's product id, when there is one. */
  shopifyId: string | null;
  handle: string;
  title: string | null;
  availableForSale: boolean;
  price: Money | null;
  priceMax: Money | null;
  variants: CommerceVariant[];
  /** Shopify tags, kept raw. The taxonomy mapping reads them; the interface does not. */
  tags: string[];
  /** Metafields under the `dermal` namespace, when they exist. None do yet. */
  metafields: Record<string, string>;
};

/** A piece that cannot be bought, and says so plainly rather than pretending to be pending. */
export function unmatchedCommerce(handle: string, status: Extract<CommerceStatus, "unmatched" | "concept" | "unavailable">): CommerceRecord {
  return {
    status,
    shopifyId: null,
    handle,
    title: null,
    availableForSale: false,
    price: null,
    priceMax: null,
    variants: [],
    tags: [],
    metafields: {},
  };
}

/**
 * The editorial product joined to whatever commerce is known about it. Every existing field of
 * `Product` is still here and still means what it did, so no surface had to be rewritten to read it.
 */
export type DermalProduct = Product & {
  /** The Shopify handle this family maps to. It is the join key, never an array position. */
  handle: string;
  commerce: CommerceRecord;
};

/** True when a customer can put this piece in a bag that Shopify will honour. */
export function isPurchasable(product: DermalProduct): boolean {
  return product.commerce.status === "live" && product.commerce.variants.some((v) => v.availableForSale);
}

/** The variant a given editorial form sells, when Shopify has one for it. */
export function variantForForm(product: DermalProduct, formId: FormId): CommerceVariant | null {
  return product.commerce.variants.find((v) => v.formId === formId) ?? null;
}

/**
 * What to show where a price goes. Shopify's amount when Shopify has one; otherwise the honest
 * statement that there is not a price yet. A demo price is never presented as a selling price.
 */
export type PriceDisplay =
  | { kind: "shopify"; money: Money }
  | { kind: "demo"; amount: number; currencyCode: string }
  | { kind: "pending" }
  | { kind: "concept" };

export function priceDisplay(product: DermalProduct, formId?: FormId): PriceDisplay {
  const { commerce } = product;
  if (commerce.status === "concept") return { kind: "concept" };
  if (commerce.status === "live" || commerce.status === "sold-out") {
    const variant = formId ? variantForForm(product, formId) : null;
    const money = variant?.price ?? commerce.price;
    if (money) return { kind: "shopify", money };
  }
  const demo = formId ? product.forms.find((f) => f.id === formId)?.demoPrice : product.demoPrice;
  return demo ? { kind: "demo", amount: demo, currencyCode: product.currency } : { kind: "pending" };
}

/** Browsing taxonomy the interface already uses, restated so a mapping can target it by name. */
export type Taxonomy = {
  lines: Line[];
  placements: PlacementId[];
  audience: Product["audience"];
};
