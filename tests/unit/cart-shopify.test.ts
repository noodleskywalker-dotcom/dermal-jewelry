import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addLines, addToCart, createCart, fetchCart, removeLine, updateLine } from "@/lib/shopify/cart";
import { ShopifyError } from "@/lib/shopify/client";

const ENV = { ...process.env };

function cartPayload(quantity = 1) {
  return {
    id: "gid://shopify/Cart/abc",
    checkoutUrl: "https://example.myshopify.com/cart/c/abc",
    totalQuantity: quantity,
    cost: {
      subtotalAmount: { amount: String(390 * quantity), currencyCode: "QAR" },
      totalAmount: { amount: String(390 * quantity), currencyCode: "QAR" },
      totalTaxAmount: null,
    },
    lines: {
      nodes: [
        {
          id: "gid://shopify/CartLine/1",
          quantity,
          cost: {
            totalAmount: { amount: String(390 * quantity), currencyCode: "QAR" },
            amountPerQuantity: { amount: "390.0", currencyCode: "QAR" },
          },
          merchandise: {
            id: "gid://shopify/ProductVariant/1",
            title: "Anti-eyebrow",
            availableForSale: true,
            quantityAvailable: 9,
            price: { amount: "390.0", currencyCode: "QAR" },
            selectedOptions: [{ name: "Form", value: "Anti-eyebrow" }],
            product: { id: "gid://shopify/Product/1", handle: "horus-trace", title: "HORUS TRACE" },
          },
        },
      ],
    },
  };
}

/** Answers each call in turn, so a sequence of mutations can be checked. */
function respondWith(...bodies: unknown[]) {
  let call = 0;
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    const body = bodies[Math.min(call, bodies.length - 1)];
    call += 1;
    return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
  });
}

function sentQuery(mock: ReturnType<typeof respondWith>, index = 0) {
  return JSON.parse((mock.mock.calls[index][1] as RequestInit).body as string) as {
    query: string;
    variables: Record<string, unknown>;
  };
}

beforeEach(() => {
  process.env.SHOPIFY_STORE_DOMAIN = "example.myshopify.com";
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "shpat_not-a-real-token";
  process.env.SHOPIFY_API_VERSION = "2026-07";
});
afterEach(() => {
  process.env = { ...ENV };
  vi.restoreAllMocks();
});

describe("adding to the cart", () => {
  it("starts a cart when the customer has none", async () => {
    const mock = respondWith({ data: { cartCreate: { cart: cartPayload(), userErrors: [] } } });
    const cart = await createCart([{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 }]);
    expect(cart.id).toBe("gid://shopify/Cart/abc");
    expect(sentQuery(mock).query).toContain("cartCreate");
    expect(sentQuery(mock).variables.lines).toEqual([{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 }]);
  });

  it("adds a line to the cart the customer already has", async () => {
    const mock = respondWith({ data: { cartLinesAdd: { cart: cartPayload(2), userErrors: [] } } });
    const cart = await addLines("gid://shopify/Cart/abc", [{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 }]);
    expect(cart.totalQuantity).toBe(2);
    expect(sentQuery(mock).query).toContain("cartLinesAdd");
  });

  it("starts a fresh cart when the remembered one no longer exists", async () => {
    // Shopify refuses the add because the cart was completed or expired, then the create succeeds.
    const mock = respondWith(
      { data: { cartLinesAdd: { cart: null, userErrors: [{ field: ["cartId"], message: "Cart does not exist" }] } } },
      { data: { cartCreate: { cart: cartPayload(), userErrors: [] } } },
    );
    const cart = await addToCart("gid://shopify/Cart/gone", [{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 }]);
    expect(cart.id).toBe("gid://shopify/Cart/abc");
    expect(sentQuery(mock, 0).query).toContain("cartLinesAdd");
    expect(sentQuery(mock, 1).query).toContain("cartCreate");
  });

  it("does not swallow a network failure by quietly starting a new cart", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    await expect(addToCart("gid://shopify/Cart/abc", [{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 }])).rejects.toMatchObject({
      kind: "network",
    });
  });
});

describe("changing the cart", () => {
  it("updates a line's quantity through Shopify", async () => {
    const mock = respondWith({ data: { cartLinesUpdate: { cart: cartPayload(3), userErrors: [] } } });
    const cart = await updateLine("gid://shopify/Cart/abc", "gid://shopify/CartLine/1", 3);
    expect(cart.lines[0].quantity).toBe(3);
    expect(sentQuery(mock).query).toContain("cartLinesUpdate");
    expect(sentQuery(mock).variables.lines).toEqual([{ id: "gid://shopify/CartLine/1", quantity: 3 }]);
  });

  it("removes a line through Shopify", async () => {
    const empty = cartPayload(0);
    empty.lines.nodes = [];
    const mock = respondWith({ data: { cartLinesRemove: { cart: empty, userErrors: [] } } });
    const cart = await removeLine("gid://shopify/Cart/abc", "gid://shopify/CartLine/1");
    expect(cart.lines).toEqual([]);
    expect(sentQuery(mock).query).toContain("cartLinesRemove");
    expect(sentQuery(mock).variables.lineIds).toEqual(["gid://shopify/CartLine/1"]);
  });

  it("reports a refusal as an error carrying Shopify's reason", async () => {
    respondWith({ data: { cartLinesUpdate: { cart: null, userErrors: [{ field: null, message: "Not enough in stock" }] } } });
    const error = await updateLine("gid://shopify/Cart/abc", "gid://shopify/CartLine/1", 99).catch((e: ShopifyError) => e);
    expect(error).toBeInstanceOf(ShopifyError);
    expect((error as ShopifyError).detail).toEqual(["Not enough in stock"]);
  });
});

describe("restoring the cart", () => {
  it("reads back the cart Shopify still holds", async () => {
    const mock = respondWith({ data: { cart: cartPayload(2) } });
    const cart = await fetchCart("gid://shopify/Cart/abc");
    expect(cart?.totalQuantity).toBe(2);
    expect(cart?.lines[0].handle).toBe("horus-trace");
    expect(sentQuery(mock).variables.id).toBe("gid://shopify/Cart/abc");
  });

  it("answers null for a cart Shopify no longer has, instead of failing", async () => {
    respondWith({ data: { cart: null } });
    expect(await fetchCart("gid://shopify/Cart/gone")).toBeNull();
  });
});
