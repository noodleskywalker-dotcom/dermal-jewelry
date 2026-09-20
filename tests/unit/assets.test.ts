import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { catalog, formOf } from "@/lib/catalog";
import { componentAsset, formAssets } from "@/lib/catalog/assets";
import committedManifest from "@/lib/catalog/asset-manifest.json";
import { resolveComponents } from "@/lib/studio/geometry";
import { scanProductAssets } from "../../scripts/sync-product-assets.mjs";

const hero = catalog.getProduct("desert-eye-love")!;
const BASE = "/products/desert-eye-love/anti-eyebrow";
const SYMBOL = { "desert-eye-love:anti-eyebrow:symbol:left": `${BASE}/symbol.webp` };
const GEMSTONE = { "desert-eye-love:anti-eyebrow:gemstone:left": `${BASE}/gemstone.webp` };

const root = mkdtempSync(path.join(tmpdir(), "dermal-assets-"));
afterAll(() => rmSync(root, { recursive: true, force: true }));

describe("approved default composition", () => {
  const form = formOf(hero, "anti-eyebrow");

  it("is recorded as approved metadata with two separately addressable pieces", () => {
    expect(form.composition?.approved).toBe(true);
    expect(form.components.map((c) => c.id)).toEqual(["symbol", "gemstone"]);
    expect(form.components.map((c) => c.rotation)).toEqual([0, 0]);
    expect(form.defaultScale).toBe(0.12);
  });

  it("puts the symbol upper and outer and the gemstone lower and inner, on a diagonal", () => {
    const [symbol, gemstone] = form.components;
    expect(symbol.x).toBeGreaterThan(0);
    expect(symbol.y).toBeLessThan(0);
    expect(gemstone.x).toBeLessThan(0);
    expect(gemstone.y).toBeGreaterThan(0);
    expect(symbol.size).toBeGreaterThan(gemstone.size);
  });

  it("classifies today's artwork honestly as the concept fallback", () => {
    expect(form.composition?.artClass).toBe("concept-fallback");
  });
});

describe("separate component assets", () => {
  it("falls back to the drawn artwork while the slot is empty", () => {
    expect(committedManifest).toEqual({});
    expect(formAssets(hero, "anti-eyebrow", "left")).toBeNull();
  });

  it("falls back for the whole form when either piece is missing, never mixing exact and drawn art", () => {
    expect(formAssets(hero, "anti-eyebrow", "left", SYMBOL)).toBeNull();
    expect(formAssets(hero, "anti-eyebrow", "left", GEMSTONE)).toBeNull();
    expect(formAssets(hero, "anti-eyebrow", "left", { ...SYMBOL, ...GEMSTONE })).toEqual({
      symbol: `${BASE}/symbol.webp`,
      gemstone: `${BASE}/gemstone.webp`,
    });
    // Another form of the same design is unaffected.
    expect(formAssets(hero, "micro-dermal", "left", { ...SYMBOL, ...GEMSTONE })).toBeNull();
  });

  it("reuses the one approved symbol on the right without any mirrored variant", () => {
    const manifest = { ...SYMBOL, ...GEMSTONE };
    expect(componentAsset(hero, "anti-eyebrow", "symbol", "right", manifest)).toBe(`${BASE}/symbol.webp`);
    // Only positions mirror. The piece keeps its orientation: no flip exists anywhere in the layout.
    const left = resolveComponents(hero, { side: "left", tweaks: {}, formId: "anti-eyebrow" });
    const right = resolveComponents(hero, { side: "right", tweaks: {}, formId: "anti-eyebrow" });
    expect(right[0].leftPct).toBeCloseTo(100 - left[0].leftPct);
    expect(right[0].topPct).toBe(left[0].topPct);
    expect(right[0].rotation).toBe(0);
    expect(Object.keys(right[0])).not.toContain("flip");
  });

  it("prefers a dedicated right-side image when one is supplied", () => {
    const manifest = { ...SYMBOL, ...GEMSTONE, "desert-eye-love:anti-eyebrow:symbol:right": `${BASE}/symbol.right.webp` };
    expect(componentAsset(hero, "anti-eyebrow", "symbol", "right", manifest)).toBe(`${BASE}/symbol.right.webp`);
    expect(componentAsset(hero, "anti-eyebrow", "symbol", "left", manifest)).toBe(`${BASE}/symbol.webp`);
    expect(componentAsset(hero, "anti-eyebrow", "gemstone", "right", manifest)).toBe(`${BASE}/gemstone.webp`);
  });

  it("finds files dropped into the slot, prefers WebP, and ignores anything else", () => {
    const dir = path.join(root, "desert-eye-love", "anti-eyebrow");
    mkdirSync(dir, { recursive: true });
    for (const name of ["symbol.png", "symbol.webp", "gemstone.png", "symbol.right.webp", "notes.txt", "Symbol FINAL v2.png"]) {
      writeFileSync(path.join(dir, name), "x");
    }
    writeFileSync(path.join(root, "desert-eye-love", "stray.webp"), "x");
    expect(scanProductAssets(root)).toEqual({
      "desert-eye-love:anti-eyebrow:symbol:left": `${BASE}/symbol.webp`,
      "desert-eye-love:anti-eyebrow:symbol:right": `${BASE}/symbol.right.webp`,
      "desert-eye-love:anti-eyebrow:gemstone:left": `${BASE}/gemstone.png`,
    });
    expect(scanProductAssets(path.join(root, "missing"))).toEqual({});
  });
});
