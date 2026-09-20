import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import {
  addItem,
  createItem,
  EMPTY_LOOK,
  findConflict,
  previewItems,
  removeItem,
  resetItem,
  setSide,
  switchProduct,
  updateGroup,
  updateTweak,
} from "@/lib/studio/look";

const hero = catalog.getProduct("desert-eye-love")!;
const vortex = catalog.getProduct("sand-vortex")!;
const orbit = catalog.getProduct("crimson-orbit")!;

describe("look", () => {
  it("keeps the customer's placement when switching to another piece for the same placement", () => {
    let look = addItem(EMPTY_LOOK, createItem("a", hero, "left"));
    look = updateGroup(look, "a", { x: 0.61, y: 0.52, scale: 0.2, rotation: 15 });
    look = updateTweak(look, "a", "gem", { dx: 0.3 });
    look = switchProduct(look, "a", vortex);
    expect(look.items[0].productId).toBe(vortex.id);
    expect(look.items[0].group).toEqual({ x: 0.61, y: 0.52, scale: 0.2, rotation: 15 });
    expect(look.items[0].tweaks).toEqual({});
  });

  it("moves to the new placement's default when the placement changes", () => {
    let look = addItem(EMPTY_LOOK, createItem("a", hero, "left"));
    look = switchProduct(look, "a", orbit);
    expect(look.items[0].placement).toBe("dermal");
  });

  it("resets one item to its defaults", () => {
    let look = addItem(EMPTY_LOOK, createItem("a", hero, "right"));
    const original = look.items[0].group;
    look = updateGroup(look, "a", { x: 0.1, rotation: 80 });
    look = resetItem(look, "a", hero);
    expect(look.items[0].group).toEqual(original);
  });

  it("changes side only once", () => {
    let look = addItem(EMPTY_LOOK, createItem("a", hero, "left"));
    const x = look.items[0].group.x;
    look = setSide(look, "a", "left");
    expect(look.items[0].group.x).toBe(x);
    look = setSide(look, "a", "right");
    expect(look.items[0].group.x).toBeCloseTo(1 - x);
  });

  it("detects a piece already on the same placement and side", () => {
    const look = addItem(EMPTY_LOOK, createItem("a", hero, "left"));
    expect(findConflict(look, "anti-eyebrow", "left")?.uid).toBe("a");
    expect(findConflict(look, "anti-eyebrow", "right")).toBeUndefined();
  });

  it("moves the active marker when the active item is removed", () => {
    let look = addItem(EMPTY_LOOK, createItem("a", hero, "left"));
    look = addItem(look, createItem("b", orbit, "right"));
    look = removeItem(look, "b");
    expect(look.activeUid).toBe("a");
    expect(removeItem(look, "a")).toEqual(EMPTY_LOOK);
  });

  it("previews another piece with the customer's own placement", () => {
    let look = addItem(EMPTY_LOOK, createItem("a", hero, "left"));
    look = updateGroup(look, "a", { x: 0.63, y: 0.49 });
    const items = previewItems(look, vortex);
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe(vortex.id);
    expect(items[0].group.x).toBe(0.63);
    // Previewing never edits the real look.
    expect(look.items[0].productId).toBe(hero.id);
  });

  it("previews with a default placement when there is no look yet", () => {
    const items = previewItems(EMPTY_LOOK, orbit);
    expect(items).toHaveLength(1);
    expect(items[0].placement).toBe("dermal");
  });
});
