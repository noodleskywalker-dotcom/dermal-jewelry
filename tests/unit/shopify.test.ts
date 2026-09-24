import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShopifyError, shopifyConfig, storefront } from "@/lib/shopify/client";
import { toSummary } from "@/lib/shopify/cart";
import type { ShopifyCart } from "@/lib/shopify/types";

const ENV = { ...process.env };

function configure(over: Record<string, string | undefined> = {}) {
  process.env.SHOPIFY_STORE_DOMAIN = "example.myshopify.com";
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "shpat_not-a-real-token";
  process.env.SHOPIFY_API_VERSION = "2026-07";
  for (const [key, value] of Object.entries(over)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function answer(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

beforeEach(() => configure());
afterEach(() => {
  process.env = { ...ENV };
  vi.restoreAllMocks();
});

describe("the Storefront client", () => {
  it("sends the private-token header and never the public one", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(answer({ data: { shop: { name: "My Store" } } }));
    await storefront("{ shop { name } }");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://example.myshopify.com/api/2026-07/graphql.json");
    const headers = init.headers as Record<string, string>;
    expect(headers["Shopify-Storefront-Private-Token"]).toBe("shpat_not-a-real-token");
    expect(headers["X-Shopify-Storefront-Access-Token"]).toBeUndefined();
  });

  it("treats a 200 carrying GraphQL errors as a failure, not as an empty shop", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(answer({ errors: [{ message: "Field 'nope' doesn't exist" }] }));
    await expect(storefront("{ nope }")).rejects.toMatchObject({
      name: "ShopifyError",
      kind: "graphql",
      detail: ["Field 'nope' doesn't exist"],
    });
  });

  it("treats a 200 with no data as a failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(answer({}));
    await expect(storefront("{ shop { name } }")).rejects.toMatchObject({ kind: "graphql" });
  });

  it("reports a non-200 with its status, and never leaks the token into the message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("unauthorized", { status: 401 }));
    const error = await storefront("{ shop { name } }").catch((e: ShopifyError) => e);
    expect(error).toBeInstanceOf(ShopifyError);
    expect((error as ShopifyError).kind).toBe("http");
    expect((error as ShopifyError).status).toBe(401);
    expect(JSON.stringify(error)).not.toContain("shpat_");
  });

  it("reports a network failure rather than hanging", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));
    await expect(storefront("{ shop { name } }")).rejects.toMatchObject({ kind: "network" });
  });

  it("refuses to run without configuration instead of calling a half-built URL", async () => {
    configure({ SHOPIFY_STOREFRONT_ACCESS_TOKEN: undefined });
    expect(shopifyConfig()).toBeNull();
    await expect(storefront("{ shop { name } }")).rejects.toMatchObject({ kind: "not-configured" });
  });

  it("caches a catalogue read and never caches a cart call", async () => {
    // A Response body can only be read once, so each call gets its own.
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => answer({ data: { ok: true } }));
    await storefront("{ ok }", { revalidate: 300, tags: ["shopify-catalogue"] });
    expect((fetchMock.mock.calls[0][1] as RequestInit & { next?: unknown }).next).toEqual({
      revalidate: 300,
      tags: ["shopify-catalogue"],
    });
    await storefront("{ ok }");
    expect((fetchMock.mock.calls[1][1] as RequestInit).cache).toBe("no-store");
  });
});

describe("the cart summary", () => {
  const cart: ShopifyCart = {
    id: "gid://shopify/Cart/abc",
    checkoutUrl: "https://example.myshopify.com/cart/c/abc",
    totalQuantity: 2,
    cost: {
      subtotalAmount: { amount: "780.0", currencyCode: "QAR" },
      totalAmount: { amount: "780.0", currencyCode: "QAR" },
      totalTaxAmount: null,
    },
    lines: {
      nodes: [
        {
          id: "gid://shopify/CartLine/1",
          quantity: 2,
          cost: {
            totalAmount: { amount: "780.0", currencyCode: "QAR" },
            amountPerQuantity: { amount: "390.0", currencyCode: "QAR" },
          },
          merchandise: {
            id: "gid://shopify/ProductVariant/1",
            title: "Anti-eyebrow",
            availableForSale: true,
            quantityAvailable: 3,
            price: { amount: "390.0", currencyCode: "QAR" },
            selectedOptions: [{ name: "Form", value: "Anti-eyebrow" }],
            product: { id: "gid://shopify/Product/1", handle: "horus-trace", title: "HORUS TRACE" },
          },
        },
      ],
    },
  };

  it("carries Shopify's own totals through without recalculating them", () => {
    const summary = toSummary(cart);
    expect(summary.subtotal).toEqual({ amount: "780.0", currencyCode: "QAR" });
    expect(summary.total).toEqual({ amount: "780.0", currencyCode: "QAR" });
    expect(summary.totalQuantity).toBe(2);
    expect(summary.lines[0].linePrice.amount).toBe("780.0");
    expect(summary.lines[0].unitPrice.amount).toBe("390.0");
    // The handle is what joins a line back to a design family.
    expect(summary.lines[0].handle).toBe("horus-trace");
    expect(summary.checkoutUrl).toContain("/cart/c/");
  });

  it("carries whether the merchandise on a line can still be sold", () => {
    const gone = structuredClone(cart);
    gone.lines.nodes[0].merchandise.availableForSale = false;
    expect(toSummary(gone).lines[0].availableForSale).toBe(false);
  });

  it("survives a cart with no lines", () => {
    const empty = structuredClone(cart);
    empty.lines.nodes = [];
    expect(toSummary(empty).lines).toEqual([]);
  });
});
