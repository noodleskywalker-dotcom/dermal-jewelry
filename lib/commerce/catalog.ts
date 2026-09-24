import { catalog } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import {
  CATALOGUE_CACHE_TAG,
  CATALOGUE_REVALIDATE_SECONDS,
  isShopifyConfigured,
  ShopifyError,
  storefront,
} from "@/lib/shopify/client";
import { PRODUCTS_QUERY } from "@/lib/shopify/queries";
import type { ShopifyProductsAnswer } from "@/lib/shopify/types";
import type { DermalProduct } from "./model";
import { isPurchasable } from "./model";
import { joinCatalogue, orphanHandles } from "./normalize";

/**
 * The catalogue the pages render: the editorial families, each joined to whatever Shopify knows.
 *
 * Server only. It is read once per render on the server and handed to the interface as plain data,
 * so no client ever fetches the catalogue and the Storefront token never leaves the server.
 *
 * If Shopify is empty, misconfigured, slow or down, this still returns the full editorial catalogue
 * with every piece marked not purchasable. A storefront that cannot reach its commerce backend
 * should look like a catalogue that cannot be bought from, not like a blank page.
 */

export type CatalogueState = {
  products: DermalProduct[];
  /** True when Shopify answered, whatever it answered with. */
  reachable: boolean;
  /** Why the storefront is running without commerce, for the status line and the report. */
  problem: { kind: string; message: string } | null;
  /** Handles present in Shopify that no editorial family claims. */
  orphans: string[];
};

const PRODUCT_LIMIT = 50;

export async function getCatalogue(): Promise<CatalogueState> {
  const products: Product[] = catalog.listProducts();

  if (!isShopifyConfigured()) {
    return {
      products: joinCatalogue(products, [], false),
      reachable: false,
      problem: { kind: "not-configured", message: "Shopify is not configured in this environment." },
      orphans: [],
    };
  }

  try {
    const answer = await storefront<ShopifyProductsAnswer>(PRODUCTS_QUERY, {
      variables: { first: PRODUCT_LIMIT },
      revalidate: CATALOGUE_REVALIDATE_SECONDS,
      tags: [CATALOGUE_CACHE_TAG],
    });
    const nodes = answer.products?.nodes ?? [];
    return {
      products: joinCatalogue(products, nodes, true),
      reachable: true,
      problem: null,
      orphans: orphanHandles(products, nodes),
    };
  } catch (error) {
    const failure = error instanceof ShopifyError ? error : null;
    // Logged on the server, where it is useful, and never rendered as a raw message to a customer.
    console.error("[dermal] the catalogue could not be read from Shopify:", failure?.message ?? error, failure?.detail ?? "");
    return {
      products: joinCatalogue(products, [], false),
      reachable: false,
      problem: { kind: failure?.kind ?? "unknown", message: failure?.message ?? "Shopify could not be read." },
      orphans: [],
    };
  }
}

/** One family by its editorial slug, with the same guarantees. */
export async function getDermalProduct(slug: string): Promise<DermalProduct | undefined> {
  const { products } = await getCatalogue();
  return products.find((p) => p.slug === slug);
}

/**
 * Whether this storefront has real commerce yet: at least one piece with a Shopify variant that is
 * genuinely for sale.
 *
 * It is the switch behind the owner's rule of 24 September 2026. The demo bag is a development
 * fallback and nothing more, so the moment one real variant exists Shopify becomes the only cart on
 * the site — including for pieces that have no Shopify product of their own yet. Two purchasable
 * carts are never maintained side by side, and a demo line can never end up beside a real one.
 *
 * It reuses the same cached catalogue read, so asking costs nothing extra.
 */
export async function getCommerceState(): Promise<{ live: boolean; reachable: boolean }> {
  const { products, reachable } = await getCatalogue();
  return { live: products.some(isPurchasable), reachable };
}
