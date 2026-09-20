import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import { addToBag, bagCount, bagSubtotal, EMPTY_BAG, MAX_QUANTITY, removeFromBag, sanitizeBag, setQuantity } from "@/lib/cart/bag";

const hero = catalog.getProduct("desert-eye-love")!;
const orbit = catalog.getProduct("crimson-orbit")!;

describe("demo bag", () => {
  it("adds, merges and totals consistently", () => {
    let bag = addToBag(EMPTY_BAG, hero.id);
    bag = addToBag(bag, hero.id);
    bag = addToBag(bag, orbit.id);
    expect(bag.lines).toHaveLength(2);
    expect(bagCount(bag)).toBe(3);
    expect(bagSubtotal(bag, catalog)).toBe(hero.demoPrice * 2 + orbit.demoPrice);
  });

  it("removes a line at zero and caps quantity", () => {
    let bag = addToBag(EMPTY_BAG, hero.id);
    bag = setQuantity(bag, hero.id, 99);
    expect(bag.lines[0].quantity).toBe(MAX_QUANTITY);
    bag = setQuantity(bag, hero.id, 0);
    expect(bag).toEqual(EMPTY_BAG);
    expect(removeFromBag(addToBag(EMPTY_BAG, hero.id), hero.id)).toEqual(EMPTY_BAG);
  });

  it("ignores tampered or stale stored bags", () => {
    expect(sanitizeBag("nonsense", catalog)).toEqual(EMPTY_BAG);
    expect(
      sanitizeBag(
        {
          lines: [
            { productId: hero.id, quantity: 2 },
            { productId: "gid://shopify/ProductVariant/1", quantity: 1 },
            { productId: orbit.id, quantity: -4 },
          ],
        },
        catalog,
      ),
    ).toEqual({ lines: [{ productId: hero.id, quantity: 2 }] });
  });

  it("uses demo ids only, so nothing here can be mistaken for a Shopify variant", () => {
    for (const p of catalog.listProducts()) expect(p.id.startsWith("demo-")).toBe(true);
  });
});
