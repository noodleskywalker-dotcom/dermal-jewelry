import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

  it("classifies the installed artwork as prototype product art, never as a commercial asset", () => {
    for (const id of ["anti-eyebrow", "micro-dermal", "nose"]) {
      const composition = formOf(hero, id).composition!;
      expect(composition.artClass).toBe("prototype-product-art");
      expect(composition.note).not.toMatch(/ruby|sapphire|garnet\b|titanium|steel|gold/i);
    }
    expect(form.composition!.note).toMatch(/not manufacturing geometry/i);
  });

  it("keeps the approved proportions now that the images are cropped tight to each piece", () => {
    const [symbol, gemstone] = form.components;
    // Offsets and the symbol are untouched. Only the stone's width changed, to hold its approved share of the symbol.
    expect([symbol.x, symbol.y, symbol.size]).toEqual([0.3, -0.2, 0.48]);
    expect([gemstone.x, gemstone.y]).toEqual([-0.28, 0.2]);
    expect(gemstone.size / symbol.size).toBeGreaterThan(0.34);
    expect(gemstone.size / symbol.size).toBeLessThan(0.42);
  });
});

describe("separate component assets", () => {
  it("has the prototype symbol and gemstone installed for every form of the design, and nothing else", () => {
    expect(committedManifest).toEqual({
      "desert-eye-love:anti-eyebrow:gemstone:left": `${BASE}/gemstone.webp`,
      "desert-eye-love:anti-eyebrow:symbol:left": `${BASE}/symbol.webp`,
      "desert-eye-love:micro-dermal:symbol:left": "/products/desert-eye-love/micro-dermal/symbol.webp",
      "desert-eye-love:nose:gemstone:left": "/products/desert-eye-love/nose/gemstone.webp",
    });
    expect(formAssets(hero, "anti-eyebrow", "left")).toEqual({ symbol: `${BASE}/symbol.webp`, gemstone: `${BASE}/gemstone.webp` });
    expect(Object.keys(formAssets(hero, "micro-dermal", "left")!)).toEqual(["symbol"]);
    expect(Object.keys(formAssets(hero, "nose", "left")!)).toEqual(["gemstone"]);
    // Other designs keep their drawn artwork. No art was invented for them.
    expect(formAssets(catalog.getProduct("sand-vortex")!, "anti-eyebrow", "left")).toBeNull();
  });

  it("ships real WebP files with their source masters, and no dedicated mirrored symbol", () => {
    const at = (...parts: string[]) => path.join(process.cwd(), ...parts);
    for (const url of Object.values(committedManifest as Record<string, string>)) {
      const bytes = readFileSync(at("public", url));
      expect(bytes.subarray(0, 4).toString("latin1")).toBe("RIFF");
      expect(bytes.subarray(8, 12).toString("latin1")).toBe("WEBP");
    }
    // One image serves both sides. The symbol is never flipped, so no right-hand variant exists.
    expect(Object.keys(committedManifest).some((key) => key.endsWith(":right"))).toBe(false);
    expect(componentAsset(hero, "anti-eyebrow", "symbol", "right")).toBe(`${BASE}/symbol.webp`);
    for (const piece of ["symbol", "gemstone"]) {
      expect(existsSync(at("art", "product-masters", "desert-eye-love", `${piece}.svg`))).toBe(true);
      expect(readFileSync(at("art", "product-masters", "desert-eye-love", `${piece}.png`)).subarray(1, 4).toString("latin1")).toBe("PNG");
    }
    // The symbol master is drawn from the repository's own outline, not from a redrawn one.
    const glyph = readFileSync(at("lib", "studio", "love-glyph.ts"), "utf8").match(/"(M[^"]+)"/)![1];
    expect(readFileSync(at("art", "product-masters", "desert-eye-love", "symbol.svg"), "utf8")).toContain(glyph);
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
    // With an empty slot every form still has its drawn fallback.
    expect(formAssets(hero, "anti-eyebrow", "left", {})).toBeNull();
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
