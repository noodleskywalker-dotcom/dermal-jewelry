import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { catalog, formOf } from "@/lib/catalog";
import { assetFor, layoutBounds } from "@/lib/catalog/assets";
import committedManifest from "@/lib/catalog/asset-manifest.json";
import { scanProductAssets } from "../../scripts/sync-product-assets.mjs";

const hero = catalog.getProduct("desert-eye-love")!;
const root = mkdtempSync(path.join(tmpdir(), "dermal-assets-"));
afterAll(() => rmSync(root, { recursive: true, force: true }));

describe("exact product asset slot", () => {
  it("falls back to concept artwork while no file has been supplied", () => {
    expect(committedManifest).toEqual({});
    expect(assetFor(hero, "anti-eyebrow", "left")).toBeUndefined();
  });

  it("uses one asset for a form, and never mirrors it onto the other side", () => {
    const manifest = { "desert-eye-love:anti-eyebrow:left": "/products/desert-eye-love/anti-eyebrow.webp" };
    expect(assetFor(hero, "anti-eyebrow", "left", manifest)).toBe("/products/desert-eye-love/anti-eyebrow.webp");
    // Flipping the left image would flip the symbol, so the right side needs its own file.
    expect(assetFor(hero, "anti-eyebrow", "right", manifest)).toBeUndefined();
    expect(assetFor(hero, "micro-dermal", "left", manifest)).toBeUndefined();
    // A concept-pending form resolves to the default form, exactly as everywhere else.
    expect(assetFor(hero, "nose", "left", manifest)).toBe("/products/desert-eye-love/anti-eyebrow.webp");
  });

  it("fits the asset to the same place and size as the artwork it replaces", () => {
    const left = layoutBounds(formOf(hero, "anti-eyebrow").components, "left");
    expect(left.width).toBeCloseTo(0.92);
    expect(left.height).toBeCloseTo(0.74);
    expect(left.centerX).toBeCloseTo(0.58);
    expect(left.centerY).toBeCloseTo(0.43);
    const right = layoutBounds(formOf(hero, "anti-eyebrow").components, "right");
    expect(right.centerX).toBeCloseTo(1 - left.centerX);
    expect(right.width).toBeCloseTo(left.width);
  });

  it("finds files dropped into the slot, prefers WebP, and ignores anything else", () => {
    const dir = path.join(root, "desert-eye-love");
    mkdirSync(dir, { recursive: true });
    for (const name of ["anti-eyebrow.png", "anti-eyebrow.webp", "anti-eyebrow.right.png", "notes.txt", "Anti Eyebrow FINAL.png"]) {
      writeFileSync(path.join(dir, name), "x");
    }
    expect(scanProductAssets(root)).toEqual({
      "desert-eye-love:anti-eyebrow:left": "/products/desert-eye-love/anti-eyebrow.webp",
      "desert-eye-love:anti-eyebrow:right": "/products/desert-eye-love/anti-eyebrow.right.png",
    });
    expect(scanProductAssets(path.join(root, "missing"))).toEqual({});
  });
});
