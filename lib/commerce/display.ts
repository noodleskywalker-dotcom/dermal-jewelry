import { formatPrice, formOf } from "@/lib/catalog";
import type { FormId, Product } from "@/lib/catalog/types";
import type { CommerceRecord, DermalProduct } from "./model";
import { variantForForm } from "./model";

/**
 * What a surface shows about money and about buying.
 *
 * Every component still receives a `Product`. A product that came through the commerce layer also
 * carries `commerce`; one that did not simply has none, and these helpers answer the same way they
 * always did. That is what keeps the interface from having to know where its data came from.
 */

export function commerceOf(product: Product): CommerceRecord | null {
  return (product as Partial<DermalProduct>).commerce ?? null;
}

export function asDermal(product: Product): DermalProduct | null {
  return commerceOf(product) ? (product as DermalProduct) : null;
}

export type PriceLabel = { caption: string; value: string };

/**
 * The price, said honestly.
 *
 * Shopify's amount whenever Shopify has one; otherwise the demo placeholder, still called a demo
 * price; otherwise that there is no price yet. A demo price is never presented as a selling price,
 * and a concept is never given one at all.
 */
export function priceLabel(product: Product, formId?: FormId): PriceLabel {
  const commerce = commerceOf(product);
  const form = formOf(product, formId);

  if (commerce?.status === "concept") return { caption: "Concept", value: "Not for sale" };

  if (commerce && (commerce.status === "live" || commerce.status === "sold-out")) {
    const dermal = product as DermalProduct;
    const variant = variantForForm(dermal, form.id);
    const money = variant?.price ?? commerce.price;
    if (money) {
      return {
        caption: commerce.status === "sold-out" ? "Sold out" : "Price",
        value: formatPrice(money.amount, money.currencyCode),
      };
    }
  }

  // No commerce record, or one with no price: the demo placeholder, labelled as one.
  if (!form.demoPrice) return { caption: "Price", value: "Price pending" };
  return { caption: "Demo price", value: formatPrice(form.demoPrice, product.currency) };
}

/** The short price a catalogue card shows, where there is no room for a caption. */
export function cardPrice(product: Product): string {
  return priceLabel(product).value;
}

export type PurchaseState = {
  /** True only when Shopify has a variant that is genuinely for sale. */
  canBuy: boolean;
  /** The merchandise id a cart line is built from, when there is one. */
  merchandiseId: string | null;
  /** What the button says. */
  action: string;
  /** One honest line under it. */
  note: string;
};

/**
 * Whether this piece, in this form, can be bought — and if not, why not, in words a customer can
 * read. Nothing here ever guesses: without a Shopify variant the answer is always no.
 */
export function purchaseState(product: Product, formId?: FormId, commerceLive = false): PurchaseState {
  const commerce = commerceOf(product);
  const form = formOf(product, formId);

  // The demo bag exists only while nothing on the storefront can really be bought. Once one real
  // variant is for sale, Shopify is the only cart and a piece without one says so plainly instead
  // of offering a placeholder line beside real ones.
  const fallback: PurchaseState = commerceLive
    ? { canBuy: false, merchandiseId: null, action: "", note: "Not yet available" }
    : { canBuy: false, merchandiseId: null, action: "Add to demo bag", note: "Demo · nothing can be ordered yet" };

  if (!commerce) return fallback;

  switch (commerce.status) {
    case "concept":
      return { canBuy: false, merchandiseId: null, action: "", note: "Concept · not yet available" };
    case "live": {
      const variant = variantForForm(product as DermalProduct, form.id);
      if (variant?.availableForSale) {
        return { canBuy: true, merchandiseId: variant.id, action: "Add to bag", note: "" };
      }
      if (variant) {
        return { canBuy: false, merchandiseId: null, action: "Add to bag", note: "This form is sold out." };
      }
      // The product sells, but not this form. A visual form is not a purchasable variant.
      return { canBuy: false, merchandiseId: null, action: "Add to bag", note: "This form is not for sale yet." };
    }
    case "sold-out":
      return { canBuy: false, merchandiseId: null, action: "Add to bag", note: "Sold out." };
    case "unavailable":
      return commerceLive
        ? { canBuy: false, merchandiseId: null, action: "", note: "The bag is unavailable right now." }
        : { canBuy: false, merchandiseId: null, action: "Add to demo bag", note: "The bag is unavailable right now." };
    case "unmatched":
    default:
      return fallback;
  }
}

/**
 * The material wording. Commerce must never quietly turn a prototype assumption into a product
 * claim, so a status of anything but "confirmed" keeps the pending wording the editorial record
 * already carries. Shopify cannot promote a material by itself.
 */
export function materialsAreConfirmed(product: Product): boolean {
  return commerceOf(product)?.metafields.material_status === "confirmed";
}
