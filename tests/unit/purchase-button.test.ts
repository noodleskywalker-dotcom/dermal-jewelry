import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { catalog } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import type { DermalProduct } from "@/lib/commerce/model";
import { joinCatalogue } from "@/lib/commerce/normalize";
import { AddToBagButton } from "@/components/cart/AddToBagButton";

const state = vi.hoisted(() => ({
  commerceLive: false,
  cart: null as object | null,
  status: "idle",
  error: null,
}));

vi.mock("@/components/commerce/CommerceProvider", () => ({ useCommerceLive: () => state.commerceLive }));
vi.mock("@/lib/cart/shopify-store", () => ({
  useShopifyCart: () => state,
  cartActions: { add: vi.fn() },
}));
vi.mock("@/lib/cart/store", () => ({ bagActions: { add: vi.fn(), openDrawer: vi.fn() } }));

const product = catalog.getProduct("desert-eye-love")!;

function commerceProduct(status: "live" | "sold-out", availableForSale: boolean): DermalProduct {
  const joined = joinCatalogue([product], [], true)[0];
  return {
    ...joined,
    commerce: {
      ...joined.commerce,
      status,
      variants: [{
        id: "gid://shopify/ProductVariant/test",
        title: "Anti-eyebrow",
        formId: "anti-eyebrow",
        availableForSale,
        quantityAvailable: availableForSale ? 2 : 0,
        price: { amount: 410, currencyCode: "QAR" },
        compareAtPrice: null,
        sku: null,
        options: [{ name: "Form", value: "Anti-eyebrow" }],
      }],
    },
  };
}

function render(product: Product, formId = "anti-eyebrow") {
  return renderToStaticMarkup(createElement(AddToBagButton, { product, formId }));
}

beforeEach(() => {
  state.commerceLive = false;
  state.cart = null;
  state.status = "idle";
});

describe("purchase button boundaries", () => {
  it("disables a sold-out Shopify form instead of offering a local selection", () => {
    const html = render(commerceProduct("sold-out", false));
    expect(html).toContain('disabled=""');
    expect(html).toContain('data-backing="shopify"');
    expect(html).toContain("Sold out");
    expect(html).not.toContain("Add to selection");
  });

  it("disables a form missing from an otherwise live Shopify product", () => {
    const html = render(commerceProduct("live", true), "nose");
    expect(html).toContain('disabled=""');
    expect(html).toContain("Not yet available");
  });

  it("keeps the actual live variant actionable", () => {
    const html = render(commerceProduct("live", true));
    expect(html).not.toContain('disabled=""');
    expect(html).toContain('data-backing="shopify"');
    expect(html).toContain("Add to bag");
  });

  it("offers local selection only before Shopify owns the bag", () => {
    expect(render(product)).toContain("Add to selection");
    state.cart = { id: "gid://shopify/Cart/restored", lines: [] };
    const html = render(product);
    expect(html).not.toContain("<button");
    expect(html).toContain("Not yet available");
  });
});
