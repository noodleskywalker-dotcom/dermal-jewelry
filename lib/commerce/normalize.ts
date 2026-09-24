import type { Product } from "@/lib/catalog/types";
import type { ShopifyMoney, ShopifyProduct, ShopifyVariant } from "@/lib/shopify/types";
import { formFromVariantOptions, handleFor, slugForHandle } from "./mapping";
import type { CommerceRecord, CommerceStatus, CommerceVariant, DermalProduct, Money } from "./model";
import { unmatchedCommerce } from "./model";

/**
 * Shopify sends money as a decimal string. Anything that is not a readable number is not a price,
 * and is never treated as one: `Number("")` is zero, and a blank amount shown as a price of zero
 * would offer a piece for free.
 */
export function toMoney(money: ShopifyMoney | null | undefined): Money | null {
  if (!money || typeof money.amount !== "string" || money.amount.trim() === "") return null;
  const amount = Number(money.amount);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return { amount, currencyCode: money.currencyCode };
}

function toVariant(variant: ShopifyVariant): CommerceVariant {
  const price = toMoney(variant.price);
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    quantityAvailable: variant.quantityAvailable,
    sku: variant.sku,
    // A variant without a readable price is treated as having none, never as free.
    price: price ?? { amount: 0, currencyCode: variant.price?.currencyCode ?? "QAR" },
    compareAtPrice: toMoney(variant.compareAtPrice),
    options: variant.selectedOptions.map((o) => ({ name: o.name, value: o.value })),
    formId: formFromVariantOptions(variant.selectedOptions),
  };
}

function readMetafields(product: ShopifyProduct): Record<string, string> {
  const found: Record<string, string> = {};
  for (const field of product.metafields ?? []) {
    if (field && field.namespace === "dermal" && typeof field.value === "string") found[field.key] = field.value;
  }
  return found;
}

/** One Shopify product as commerce facts. Nothing editorial is read out of it. */
export function normalizeProduct(product: ShopifyProduct): CommerceRecord {
  const variants = (product.variants?.nodes ?? []).map(toVariant);
  const sellable = variants.some((v) => v.availableForSale);
  // "availableForSale" on the product can be true while every variant is out of stock, so the
  // variants decide. A product with no variants at all cannot be bought whatever the flag says.
  const status: CommerceStatus = variants.length > 0 && sellable && product.availableForSale ? "live" : "sold-out";
  return {
    status,
    shopifyId: product.id,
    handle: product.handle,
    title: product.title,
    availableForSale: sellable && product.availableForSale,
    price: toMoney(product.priceRange?.minVariantPrice),
    priceMax: toMoney(product.priceRange?.maxVariantPrice),
    variants,
    tags: product.tags ?? [],
    metafields: readMetafields(product),
  };
}

/**
 * Whether a family is a concept rather than a product. A concept never becomes purchasable, however
 * the store is configured: KIRI is a direction, and a Shopify record would not change that.
 */
export function isConceptFamily(product: Product): boolean {
  return product.forms.every((form) => form.status !== "available");
}

/**
 * Joins one editorial family to the Shopify records, by handle.
 *
 * `shopifyAvailable` is false when Shopify could not be reached at all. The difference matters: a
 * piece nobody has created yet is `unmatched`, a piece we simply could not ask about is
 * `unavailable`, and neither is presented as being for sale.
 */
export function joinProduct(
  product: Product,
  byHandle: Map<string, CommerceRecord>,
  shopifyAvailable: boolean,
): DermalProduct {
  const handle = handleFor(product.slug);
  if (isConceptFamily(product)) return { ...product, handle, commerce: unmatchedCommerce(handle, "concept") };
  const matched = byHandle.get(handle);
  if (matched) return { ...product, handle, commerce: matched };
  return { ...product, handle, commerce: unmatchedCommerce(handle, shopifyAvailable ? "unmatched" : "unavailable") };
}

/** The whole catalogue, joined. Order and membership come from the editorial catalogue, never from Shopify. */
export function joinCatalogue(
  products: Product[],
  shopifyProducts: ShopifyProduct[],
  shopifyAvailable: boolean,
): DermalProduct[] {
  const slugs = products.map((p) => p.slug);
  const byHandle = new Map<string, CommerceRecord>();
  for (const raw of shopifyProducts) {
    const record = normalizeProduct(raw);
    // A Shopify product nothing in the catalogue claims is ignored rather than shown: the
    // storefront's shelves are the editorial catalogue, not whatever happens to exist in the store.
    if (slugForHandle(record.handle, slugs)) byHandle.set(record.handle, record);
  }
  return products.map((product) => joinProduct(product, byHandle, shopifyAvailable));
}

/**
 * Shopify products that no editorial family claims. They are never rendered; this exists so the
 * report can say plainly what is in the store and unused, instead of it going unnoticed.
 */
export function orphanHandles(products: Product[], shopifyProducts: ShopifyProduct[]): string[] {
  const slugs = products.map((p) => p.slug);
  return shopifyProducts.filter((raw) => !slugForHandle(raw.handle, slugs)).map((raw) => raw.handle);
}
