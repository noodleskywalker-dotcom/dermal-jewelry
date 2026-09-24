import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import {
  audienceFromTags,
  formFromVariantOptions,
  handleFor,
  linesFromTags,
  placementsFromTags,
  SELLABLE_FAMILIES,
  slugForHandle,
} from "@/lib/commerce/mapping";
import { isConceptFamily, joinCatalogue, normalizeProduct, orphanHandles, toMoney } from "@/lib/commerce/normalize";
import { isPurchasable, priceDisplay, variantForForm } from "@/lib/commerce/model";
import { cardPrice, commerceOf, materialsAreConfirmed, priceLabel, purchaseState } from "@/lib/commerce/display";
import type { ShopifyProduct } from "@/lib/shopify/types";

const products = catalog.listProducts();

function shopifyProduct(over: Partial<ShopifyProduct> & { handle: string }): ShopifyProduct {
  return {
    id: `gid://shopify/Product/${over.handle}`,
    title: over.title ?? over.handle.toUpperCase(),
    description: null,
    availableForSale: true,
    totalInventory: 5,
    tags: [],
    productType: null,
    vendor: null,
    priceRange: {
      minVariantPrice: { amount: "390.0", currencyCode: "QAR" },
      maxVariantPrice: { amount: "390.0", currencyCode: "QAR" },
    },
    featuredImage: null,
    images: { nodes: [] },
    variants: {
      nodes: [
        {
          id: `gid://shopify/ProductVariant/${over.handle}-1`,
          title: "Anti-eyebrow",
          availableForSale: true,
          quantityAvailable: 5,
          sku: null,
          price: { amount: "390.0", currencyCode: "QAR" },
          compareAtPrice: null,
          selectedOptions: [{ name: "Form", value: "Anti-eyebrow" }],
        },
      ],
    },
    metafields: [],
    ...over,
  } as ShopifyProduct;
}

describe("money", () => {
  it("reads Shopify's decimal strings and refuses anything that is not a number", () => {
    expect(toMoney({ amount: "390.0", currencyCode: "QAR" })).toEqual({ amount: 390, currencyCode: "QAR" });
    expect(toMoney({ amount: "", currencyCode: "QAR" })).toBeNull();
    expect(toMoney({ amount: "not a price", currencyCode: "QAR" })).toBeNull();
    expect(toMoney(null)).toBeNull();
  });
});

describe("handle mapping", () => {
  it("joins on the handle, never on a position in an array", () => {
    for (const slug of SELLABLE_FAMILIES) expect(handleFor(slug)).toBe(slug);
    const slugs = products.map((p) => p.slug);
    expect(slugForHandle("horus-trace", slugs)).toBe("horus-trace");
    // A handle nothing in the catalogue claims belongs to nothing.
    expect(slugForHandle("a-product-we-never-drew", slugs)).toBeNull();
  });

  it("every family the owner listed as sellable exists in the catalogue, and KIRI is not among them", () => {
    const slugs = products.map((p) => p.slug);
    for (const slug of SELLABLE_FAMILIES) expect(slugs).toContain(slug);
    expect(SELLABLE_FAMILIES as readonly string[]).not.toContain("kiri");
  });
});

describe("tag mapping", () => {
  it("reads bare and namespaced tags, in any case", () => {
    expect(linesFromTags(["Inspired"])).toEqual(["inspired"]);
    expect(linesFromTags(["line:original", "LIMITED EDITION"])).toEqual(["original", "limited"]);
    expect(placementsFromTags(["placement: Anti-Eyebrow"])).toEqual(["anti-eyebrow"]);
    expect(placementsFromTags(["nose"])).toEqual(["nostril"]);
    expect(audienceFromTags(["gender:Women"])).toBe("women");
    expect(audienceFromTags(["nothing-here"])).toBeNull();
  });

  it("ignores a tag it does not know instead of inventing a category", () => {
    expect(linesFromTags(["sparkly", "new-arrival"])).toEqual([]);
    expect(placementsFromTags(["earlobe"])).toEqual([]);
  });
});

describe("variant mapping", () => {
  it("reads the form a variant sells from its options", () => {
    expect(formFromVariantOptions([{ name: "Form", value: "Anti-eyebrow" }])).toBe("anti-eyebrow");
    expect(formFromVariantOptions([{ name: "form", value: "Micro Dermal" }])).toBe("micro-dermal");
    expect(formFromVariantOptions([{ name: "Placement", value: "Nose" }])).toBe("nose");
  });

  it("answers null when nothing says which form it is: a visual form is not a purchasable variant", () => {
    expect(formFromVariantOptions([{ name: "Title", value: "Default Title" }])).toBeNull();
    expect(formFromVariantOptions([{ name: "Finish", value: "Polished" }])).toBeNull();
    expect(formFromVariantOptions([])).toBeNull();
  });
});

describe("product normalization", () => {
  it("turns a Shopify product into commerce facts", () => {
    const record = normalizeProduct(shopifyProduct({ handle: "horus-trace" }));
    expect(record.status).toBe("live");
    expect(record.handle).toBe("horus-trace");
    expect(record.price).toEqual({ amount: 390, currencyCode: "QAR" });
    expect(record.variants).toHaveLength(1);
    expect(record.variants[0].formId).toBe("anti-eyebrow");
    expect(record.variants[0].id).toMatch(/^gid:\/\/shopify\/ProductVariant\//);
  });

  it("calls a product with no sellable variant sold out, whatever the product flag says", () => {
    const soldOut = normalizeProduct(
      shopifyProduct({
        handle: "crossline",
        availableForSale: true,
        variants: {
          nodes: [
            {
              id: "gid://shopify/ProductVariant/x",
              title: "Micro dermal",
              availableForSale: false,
              quantityAvailable: 0,
              sku: null,
              price: { amount: "120.0", currencyCode: "QAR" },
              compareAtPrice: null,
              selectedOptions: [{ name: "Form", value: "Micro dermal" }],
            },
          ],
        },
      }),
    );
    expect(soldOut.status).toBe("sold-out");
    expect(soldOut.availableForSale).toBe(false);
  });

  it("a product with no variants at all cannot be bought", () => {
    const empty = normalizeProduct(shopifyProduct({ handle: "blade-trace", variants: { nodes: [] } }));
    expect(empty.status).toBe("sold-out");
    expect(empty.variants).toEqual([]);
  });

  it("reads dermal metafields and ignores anything from another namespace", () => {
    const record = normalizeProduct(
      shopifyProduct({
        handle: "ankh-trace",
        metafields: [
          { namespace: "dermal", key: "material_status", value: "pending", type: "single_line_text_field" },
          { namespace: "custom", key: "material_status", value: "confirmed", type: "single_line_text_field" },
          null,
        ],
      }),
    );
    expect(record.metafields).toEqual({ material_status: "pending" });
  });
});

describe("joining the catalogue", () => {
  it("keeps every editorial family, in the catalogue's own order, whatever Shopify holds", () => {
    const joined = joinCatalogue(products, [shopifyProduct({ handle: "horus-trace" })], true);
    expect(joined.map((p) => p.slug)).toEqual(products.map((p) => p.slug));
    expect(joined.find((p) => p.slug === "horus-trace")!.commerce.status).toBe("live");
  });

  it("marks a family with no Shopify product unmatched, and never purchasable", () => {
    const joined = joinCatalogue(products, [], true);
    const desert = joined.find((p) => p.slug === "desert-eye-love")!;
    expect(desert.commerce.status).toBe("unmatched");
    expect(isPurchasable(desert)).toBe(false);
    expect(desert.commerce.variants).toEqual([]);
    // It keeps its whole editorial presentation.
    expect(desert.title).toBe("DESERT EYE — LOVE");
    expect(desert.forms.length).toBeGreaterThan(0);
  });

  it("separates a store that is empty from a store that could not be reached", () => {
    expect(joinCatalogue(products, [], true)[0].commerce.status).toBe("unmatched");
    expect(joinCatalogue(products, [], false)[0].commerce.status).toBe("unavailable");
  });

  it("ignores a Shopify product no editorial family claims, and reports it as an orphan", () => {
    const stray = shopifyProduct({ handle: "a-product-we-never-drew" });
    const joined = joinCatalogue(products, [stray], true);
    expect(joined).toHaveLength(products.length);
    expect(joined.every((p) => p.commerce.shopifyId !== stray.id)).toBe(true);
    expect(orphanHandles(products, [stray])).toEqual(["a-product-we-never-drew"]);
  });

  it("gives every joined product a handle to join on", () => {
    for (const product of joinCatalogue(products, [], true)) expect(product.handle).toBe(product.slug);
  });
});

describe("concept products", () => {
  const conceptFamily: Product = {
    ...products[0],
    id: "demo-concept",
    slug: "a-concept",
    forms: products[0].forms.map((f) => ({ ...f, status: "concept-pending" as const })),
  };

  it("a family with no available form is a concept", () => {
    expect(isConceptFamily(conceptFamily)).toBe(true);
    expect(isConceptFamily(products[0])).toBe(false);
  });

  it("a concept is never purchasable and is never given a price, even if Shopify had one", () => {
    const joined = joinCatalogue([conceptFamily], [shopifyProduct({ handle: "a-concept" })], true);
    const concept = joined[0];
    expect(concept.commerce.status).toBe("concept");
    expect(isPurchasable(concept)).toBe(false);
    expect(priceDisplay(concept)).toEqual({ kind: "concept" });
    expect(priceLabel(concept)).toEqual({ caption: "Concept", value: "Not for sale" });
    // No button at all.
    expect(purchaseState(concept).action).toBe("");
    expect(purchaseState(concept).note).toBe("Concept · not yet available");
  });
});

describe("what a surface shows", () => {
  it("shows Shopify's price when Shopify has one", () => {
    const joined = joinCatalogue(products, [shopifyProduct({ handle: "horus-trace" })], true);
    const horus = joined.find((p) => p.slug === "horus-trace")!;
    expect(priceLabel(horus, "anti-eyebrow")).toEqual({ caption: "Price", value: "QAR 390" });
    expect(cardPrice(horus)).toBe("QAR 390");
  });

  it("falls back to the demo placeholder, still calling it a demo price", () => {
    const joined = joinCatalogue(products, [], true);
    const desert = joined.find((p) => p.slug === "desert-eye-love")!;
    const label = priceLabel(desert);
    expect(label.caption).toBe("Demo price");
    expect(label.value).toBe("QAR 390");
  });

  it("says a price is pending rather than showing a zero", () => {
    const joined = joinCatalogue(products, [], true);
    const pending = joined.find((p) => p.demoPrice === 0);
    if (pending) expect(priceLabel(pending).value).toBe("Price pending");
  });

  it("works on a plain editorial product that never went through the commerce layer", () => {
    const plain = products.find((p) => p.slug === "desert-eye-love")!;
    expect(commerceOf(plain)).toBeNull();
    expect(priceLabel(plain).caption).toBe("Demo price");
    expect(purchaseState(plain)).toMatchObject({ canBuy: false, action: "Add to demo bag" });
  });
});

describe("what can be bought", () => {
  it("a live variant for this form can be added, and carries a merchandise id", () => {
    const joined = joinCatalogue(products, [shopifyProduct({ handle: "horus-trace" })], true);
    const horus = joined.find((p) => p.slug === "horus-trace")!;
    const state = purchaseState(horus, "anti-eyebrow");
    expect(state.canBuy).toBe(true);
    expect(state.merchandiseId).toBe(variantForForm(horus, "anti-eyebrow")!.id);
    expect(state.action).toBe("Add to bag");
  });

  it("a form Shopify does not sell cannot be bought, however the frontend draws it", () => {
    const joined = joinCatalogue(products, [shopifyProduct({ handle: "desert-eye-love" })], true);
    const desert = joined.find((p) => p.slug === "desert-eye-love")!;
    // The Shopify fixture sells the anti-eyebrow form only.
    const other = desert.forms.find((f) => f.id !== "anti-eyebrow" && f.status === "available");
    if (other) {
      const state = purchaseState(desert, other.id);
      expect(state.canBuy).toBe(false);
      expect(state.merchandiseId).toBeNull();
      expect(state.note).toBe("This form is not for sale yet.");
    }
  });

  it("an unavailable merchandise is not purchasable and says why", () => {
    const soldOut = shopifyProduct({
      handle: "crossline",
      variants: {
        nodes: [
          {
            id: "gid://shopify/ProductVariant/sold",
            title: "Micro dermal",
            availableForSale: false,
            quantityAvailable: 0,
            sku: null,
            price: { amount: "120.0", currencyCode: "QAR" },
            compareAtPrice: null,
            selectedOptions: [{ name: "Form", value: "Micro dermal" }],
          },
        ],
      },
    });
    const joined = joinCatalogue(products, [soldOut], true);
    const crossline = joined.find((p) => p.slug === "crossline")!;
    expect(isPurchasable(crossline)).toBe(false);
    expect(purchaseState(crossline, "micro-dermal").canBuy).toBe(false);
    expect(purchaseState(crossline, "micro-dermal").note).toBe("Sold out.");
  });

  it("nothing is purchasable when Shopify could not be reached", () => {
    for (const product of joinCatalogue(products, [], false)) {
      expect(isPurchasable(product)).toBe(false);
      expect(purchaseState(product).canBuy).toBe(false);
    }
  });
});

describe("specifications are never invented by commerce", () => {
  it("a material is only confirmed when a metafield says so in as many words", () => {
    const joined = joinCatalogue(products, [shopifyProduct({ handle: "horus-trace" })], true);
    expect(materialsAreConfirmed(joined.find((p) => p.slug === "horus-trace")!)).toBe(false);

    const withStatus = joinCatalogue(
      products,
      [
        shopifyProduct({
          handle: "horus-trace",
          metafields: [{ namespace: "dermal", key: "material_status", value: "proposed", type: "single_line_text_field" }],
        }),
      ],
      true,
    );
    // "proposed" is an intention, not a confirmation.
    expect(materialsAreConfirmed(withStatus.find((p) => p.slug === "horus-trace")!)).toBe(false);
  });

  it("the unverified wording in the catalogue survives being joined to Shopify", () => {
    const joined = joinCatalogue(products, [shopifyProduct({ handle: "horus-trace" })], true);
    const horus = joined.find((p) => p.slug === "horus-trace")!;
    const specs = horus.specs.map((s) => s.status);
    expect(specs).toContain("unverified");
    // Shopify supplied no material words, and none were invented.
    const text = JSON.stringify(horus).toLowerCase();
    for (const claim of ["implant-grade", "implant grade", "grade 5", "genuine ruby", "hypoallergenic", "nickel-free", "astm"]) {
      expect(text).not.toContain(claim);
    }
  });
});
