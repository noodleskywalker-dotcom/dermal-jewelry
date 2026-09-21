import { describe, expect, it } from "vitest";
import { catalog, formOf } from "@/lib/catalog";
import { addToBag, bagCount, bagSubtotal, EMPTY_BAG, MAX_QUANTITY, removeFromBag, sanitizeBag, setQuantity } from "@/lib/cart/bag";

const hero = catalog.getProduct("desert-eye-love")!;
const orbit = catalog.getProduct("crimson-orbit")!;

describe("demo bag", () => {
  it("adds, merges and totals consistently", () => {
    let bag = addToBag(EMPTY_BAG, hero.id, "anti-eyebrow");
    bag = addToBag(bag, hero.id, "anti-eyebrow");
    bag = addToBag(bag, orbit.id, "micro-dermal");
    expect(bag.lines).toHaveLength(2);
    expect(bagCount(bag)).toBe(3);
    expect(bagSubtotal(bag, catalog)).toBe(390 * 2 + 220);
  });

  it("keeps two forms of the same design as separate lines with their own prices", () => {
    let bag = addToBag(EMPTY_BAG, hero.id, "anti-eyebrow");
    bag = addToBag(bag, hero.id, "micro-dermal");
    bag = addToBag(bag, hero.id, "micro-dermal");
    expect(bag.lines).toEqual([
      { productId: hero.id, formId: "anti-eyebrow", quantity: 1 },
      { productId: hero.id, formId: "micro-dermal", quantity: 2 },
    ]);
    expect(bagSubtotal(bag, catalog)).toBe(formOf(hero, "anti-eyebrow").demoPrice + formOf(hero, "micro-dermal").demoPrice * 2);
    bag = removeFromBag(bag, hero.id, "anti-eyebrow");
    expect(bag.lines).toEqual([{ productId: hero.id, formId: "micro-dermal", quantity: 2 }]);
  });

  it("removes a line at zero and caps quantity", () => {
    let bag = addToBag(EMPTY_BAG, hero.id, "anti-eyebrow");
    bag = setQuantity(bag, hero.id, "anti-eyebrow", 99);
    expect(bag.lines[0].quantity).toBe(MAX_QUANTITY);
    bag = setQuantity(bag, hero.id, "anti-eyebrow", 0);
    expect(bag).toEqual(EMPTY_BAG);
  });

  it("ignores tampered, stale or unavailable stored lines", () => {
    expect(sanitizeBag("nonsense", catalog)).toEqual(EMPTY_BAG);
    expect(
      sanitizeBag(
        {
          lines: [
            { productId: hero.id, formId: "anti-eyebrow", quantity: 2 },
            { productId: "gid://shopify/ProductVariant/1", formId: "anti-eyebrow", quantity: 1 },
            { productId: orbit.id, formId: "micro-dermal", quantity: -4 },
            // Concept-pending forms can never be bought.
            { productId: orbit.id, formId: "anti-eyebrow", quantity: 1 },
            { productId: hero.id, quantity: 1 },
          ],
        },
        catalog,
      ),
    ).toEqual({ lines: [{ productId: hero.id, formId: "anti-eyebrow", quantity: 2 }] });
  });

  it("uses demo ids only, so nothing here can be mistaken for a Shopify variant", () => {
    for (const p of catalog.listProducts()) expect(p.id.startsWith("demo-")).toBe(true);
  });
});
