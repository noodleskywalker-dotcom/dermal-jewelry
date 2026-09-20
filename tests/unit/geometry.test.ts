import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import {
  clampGroup,
  containRect,
  defaultGroup,
  mirrorItem,
  normalizeRotation,
  pxDeltaToGroupUnits,
  pxDeltaToNormalized,
  resolveComponents,
  zoomedRect,
} from "@/lib/studio/geometry";
import { createItem } from "@/lib/studio/look";

const hero = catalog.getProduct("desert-eye-love")!;

describe("containRect", () => {
  it("letterboxes a portrait photo inside a wide stage", () => {
    const r = containRect(1000, 500, 600, 800);
    expect(r.height).toBe(500);
    expect(r.width).toBeCloseTo(375);
    expect(r.left).toBeCloseTo(312.5);
    expect(r.top).toBe(0);
  });

  it("pillarboxes a landscape photo inside a tall stage", () => {
    const r = containRect(400, 800, 1600, 800);
    expect(r.width).toBe(400);
    expect(r.height).toBe(200);
    expect(r.top).toBe(300);
  });

  it("returns an empty rect before the stage has a size", () => {
    expect(containRect(0, 0, 600, 800)).toEqual({ left: 0, top: 0, width: 0, height: 0 });
  });
});

describe("resize stability", () => {
  it("keeps the jewelry at the same relative point of the photo at any stage size", () => {
    const item = createItem("a", hero, "left");
    const relativeCentre = (stageW: number, stageH: number) => {
      const r = containRect(stageW, stageH, 1200, 1600);
      const px = { x: r.left + item.group.x * r.width, y: r.top + item.group.y * r.height };
      return { x: (px.x - r.left) / r.width, y: (px.y - r.top) / r.height };
    };
    const desktop = relativeCentre(1400, 800);
    const phone = relativeCentre(390, 480);
    expect(phone.x).toBeCloseTo(desktop.x, 10);
    expect(phone.y).toBeCloseTo(desktop.y, 10);
  });
});

describe("approved pair arrangement", () => {
  it("places the symbol upper and outer, the gemstone lower and inner, on the wearer's left", () => {
    const [symbol, gem] = resolveComponents(hero, { side: "left", tweaks: {} });
    expect(symbol.art).toBe("love-symbol");
    expect(gem.art).toBe("garnet-gem");
    expect(symbol.topPct).toBeLessThan(gem.topPct);
    // Wearer's left is on the viewer's right, so outer means a larger x.
    expect(symbol.leftPct).toBeGreaterThan(gem.leftPct);
  });

  it("keeps the symbol outer on the wearer's right by mirroring positions only", () => {
    const [symbol, gem] = resolveComponents(hero, { side: "right", tweaks: {} });
    expect(symbol.topPct).toBeLessThan(gem.topPct);
    expect(symbol.leftPct).toBeLessThan(gem.leftPct);
    // The artwork itself is never flipped: there is no flip flag, and rotation stays untouched.
    expect(symbol.rotation).toBe(0);
  });

  it("never uses a grey ball for the hero product", () => {
    expect(hero.components.map((c) => c.art)).toEqual(["love-symbol", "garnet-gem"]);
  });
});

describe("mirrorItem", () => {
  it("reflects the position and rotation and swaps the side", () => {
    const item = { ...createItem("a", hero, "left"), group: { x: 0.7, y: 0.4, scale: 0.1, rotation: 12 } };
    const mirrored = mirrorItem(item);
    expect(mirrored.side).toBe("right");
    expect(mirrored.group.x).toBeCloseTo(0.3);
    expect(mirrored.group.y).toBe(0.4);
    expect(mirrored.group.rotation).toBe(-12);
    expect(mirrorItem(mirrored).group.x).toBeCloseTo(item.group.x);
  });

  it("reflects per-piece offsets", () => {
    const item = { ...createItem("a", hero, "left"), tweaks: { gem: { dx: 0.2, dy: 0.1, scale: 1.2, rotation: 10 } } };
    expect(mirrorItem(item).tweaks.gem).toEqual({ dx: -0.2, dy: 0.1, scale: 1.2, rotation: -10 });
  });
});

describe("defaults and clamps", () => {
  it("starts on the correct side of the photo", () => {
    expect(defaultGroup(hero.forms[0], "left").x).toBeGreaterThan(0.5);
    expect(defaultGroup(hero.forms[0], "right").x).toBeLessThan(0.5);
  });

  it("keeps the group inside the photo and within size limits", () => {
    const g = clampGroup({ x: 1.4, y: -0.2, scale: 5, rotation: 270 });
    expect(g).toEqual({ x: 1, y: 0, scale: 0.6, rotation: -90 });
  });

  it("wraps rotation into -180..180", () => {
    expect(normalizeRotation(190)).toBe(-170);
    expect(normalizeRotation(-190)).toBe(170);
    expect(normalizeRotation(360)).toBe(0);
  });
});

describe("pointer conversion", () => {
  it("converts pixels to photo-normalized units", () => {
    expect(pxDeltaToNormalized(50, 100, { width: 500, height: 1000 })).toEqual({ dx: 0.1, dy: 0.1 });
  });

  it("converts pixels to group units, undoing the group rotation", () => {
    const d = pxDeltaToGroupUnits(100, 0, { width: 1000 }, { scale: 0.1, rotation: 90 });
    expect(d.dx).toBeCloseTo(0);
    expect(d.dy).toBeCloseTo(-1);
  });
});

describe("zoomedRect", () => {
  it("centres the focus point when the photo is large enough", () => {
    const r = zoomedRect(300, 375, 900, 1200, { x: 0.5, y: 0.5 }, 2);
    expect(r.width).toBeCloseTo(562.5);
    expect(r.left + 0.5 * r.width).toBeCloseTo(150);
    expect(r.top + 0.5 * r.height).toBeCloseTo(187.5);
  });

  it("never pulls the photo edge inside the container", () => {
    const r = zoomedRect(300, 375, 900, 1200, { x: 0.98, y: 0.02 }, 2);
    expect(r.left + r.width).toBeCloseTo(300);
    expect(r.top).toBeCloseTo(0);
  });

  it("falls back to contain geometry without zoom", () => {
    expect(zoomedRect(300, 375, 900, 1200, { x: 0.5, y: 0.5 }, 1)).toEqual(containRect(300, 375, 900, 1200));
  });
});
