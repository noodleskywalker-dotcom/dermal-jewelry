/**
 * The Storefront API client. Server code only.
 *
 * The token in `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is the Headless channel's **private** token, so it
 * travels in `Shopify-Storefront-Private-Token` and never in `X-Shopify-Storefront-Access-Token`.
 * It must never reach a client bundle, so this module refuses to run in a browser and no variable
 * here is prefixed `NEXT_PUBLIC_`.
 *
 * An HTTP 200 carrying a `errors` array is a failure, not a success: Shopify answers that way for
 * most query problems, and treating it as success is how a storefront starts showing empty shelves.
 */

export type ShopifyFailure =
  | "not-configured" // no store domain or token in the environment
  | "network" // the request never completed
  | "http" // a non-200 answer
  | "graphql" // a 200 carrying errors, or no data
  | "browser"; // someone imported this into client code

export class ShopifyError extends Error {
  readonly kind: ShopifyFailure;
  /** Shopify's own messages, safe to log. Never contains the token. */
  readonly detail: string[];
  readonly status?: number;

  constructor(kind: ShopifyFailure, message: string, detail: string[] = [], status?: number) {
    super(message);
    this.name = "ShopifyError";
    this.kind = kind;
    this.detail = detail;
    this.status = status;
  }
}

export type ShopifyConfig = { domain: string; token: string; apiVersion: string };

/** Reads the environment without ever returning the token to a caller that only wants to know if it is set. */
export function shopifyConfig(): ShopifyConfig | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  const apiVersion = process.env.SHOPIFY_API_VERSION?.trim() || "2026-07";
  if (!domain || !token) return null;
  return { domain, token, apiVersion };
}

export function isShopifyConfigured(): boolean {
  return shopifyConfig() !== null;
}

/** How long a catalogue read may be served from cache before Shopify is asked again. */
export const CATALOGUE_REVALIDATE_SECONDS = 300;
export const CATALOGUE_CACHE_TAG = "shopify-catalogue";

type GraphQLAnswer<T> = { data?: T; errors?: { message: string }[] };

export type StorefrontOptions = {
  variables?: Record<string, unknown>;
  /** Seconds. Omitted, or 0, means the answer is never cached — which is what a cart needs. */
  revalidate?: number;
  tags?: string[];
  signal?: AbortSignal;
};

/**
 * Runs one Storefront operation. Throws `ShopifyError` for every failure, so a caller decides
 * between falling back to editorial presentation and reporting the failure; nothing here guesses.
 */
export async function storefront<T>(query: string, options: StorefrontOptions = {}): Promise<T> {
  if (typeof window !== "undefined") {
    throw new ShopifyError("browser", "The Storefront client may not run in a browser: its token is server-only.");
  }
  const config = shopifyConfig();
  if (!config) {
    throw new ShopifyError("not-configured", "SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set.");
  }

  const endpoint = `https://${config.domain}/api/${config.apiVersion}/graphql.json`;
  const cache = options.revalidate ? undefined : ("no-store" as const);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The private token's header. The public token's header is a different one and 401s here.
        "Shopify-Storefront-Private-Token": config.token,
      },
      body: JSON.stringify({ query, variables: options.variables ?? {} }),
      signal: options.signal,
      ...(cache ? { cache } : { next: { revalidate: options.revalidate, tags: options.tags } }),
    });
  } catch (cause) {
    throw new ShopifyError("network", "The Storefront API could not be reached.", [String(cause)]);
  }

  if (!response.ok) {
    // The body can carry a reason; it is Shopify's text, never the token.
    const body = await response.text().catch(() => "");
    throw new ShopifyError("http", `The Storefront API answered ${response.status}.`, body ? [body.slice(0, 400)] : [], response.status);
  }

  let answer: GraphQLAnswer<T>;
  try {
    answer = (await response.json()) as GraphQLAnswer<T>;
  } catch (cause) {
    throw new ShopifyError("graphql", "The Storefront API answer was not JSON.", [String(cause)], response.status);
  }

  // A 200 with errors is a failure. This is the single most common way a storefront silently empties.
  if (answer.errors?.length) {
    throw new ShopifyError(
      "graphql",
      "The Storefront API answered 200 with GraphQL errors.",
      answer.errors.map((e) => e.message),
      response.status,
    );
  }
  if (!answer.data) {
    throw new ShopifyError("graphql", "The Storefront API answered with no data.", [], response.status);
  }
  return answer.data;
}
