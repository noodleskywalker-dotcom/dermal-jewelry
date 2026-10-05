import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeBag } from "@/lib/cart/bag";
import { catalog, isConceptFamily, presentationScale, renderFor } from "@/lib/catalog";
import type { Product, ProductRender } from "@/lib/catalog/types";
import photographicManifest from "@/lib/catalog/photographic-manifest.json";
import { priceLabel, purchaseState } from "@/lib/commerce/display";
import { SELLABLE_FAMILIES } from "@/lib/commerce/mapping";

const publicFile = (src: string) => path.join(process.cwd(), "public", src);

// Existing render families stay visible while new opaque delivery sets arrive incrementally.
const RENDERED = ["desert-eye-love", "horus-trace", "japanese-angel", "ankh-eye", "blade-trace", "crossline", "ankh-trace"];
const photographicSlots = Object.keys(photographicManifest);
const familySlots = photographicSlots.filter((slot) => !["desert-eye-symbol", "desert-eye-gem"].includes(slot));
const allRenders = (product: Product): ProductRender[] => [product.render, ...Object.values(product.formRenders ?? {})].filter((render): render is ProductRender => !!render);

describe("design renders", () => {
  it("retain existing renders and attach completed photographic sets to their own families", () => {
    expect(catalog.listProducts().filter((p) => p.render).map((p) => p.slug).sort()).toEqual([...new Set([...RENDERED, ...familySlots])].sort());
    for (const slot of familySlots) {
      expect(catalog.getProduct(slot)?.render?.hero.src).toBe(`/products/photographic/${slot}/hero.webp`);
    }
  });

  it("point at files that exist, with the sizes the files really have", async () => {
    const sharp = (await import("sharp")).default;
    for (const product of catalog.listProducts()) {
      for (const render of allRenders(product)) {
        for (const image of [render.hero, render.catalogue, render.detail]) {
          if (!image) continue;
          expect(image.src).toMatch(/^\/products\/(?:photographic\/)?[a-z-]+\/(hero|catalogue|thumb|detail)\.webp$/);
          const file = publicFile(image.src);
          expect(fs.existsSync(file), image.src).toBe(true);
          const meta = await sharp(file).metadata();
          expect([meta.width, meta.height], image.src).toEqual([image.width, image.height]);
          // Photographic lighting stays opaque; earlier cutouts retain their existing alpha.
          expect(meta.hasAlpha, image.src).toBe(render.presentation !== "photographic");
        }
        expect(render.catalogue.width).toBe(render.catalogue.height);
      }
    }
  });

  it("are called design renders, and claim nothing about the material", () => {
    for (const product of catalog.listProducts()) {
      for (const render of allRenders(product)) {
        expect(render.note).toMatch(/design render/i);
        expect(render.note).toMatch(/not photography/i);
        const words = `${render.alt} ${render.note} ${product.summary} ${product.story}`.toLowerCase();
        for (const claim of ["implant grade", "ruby", "925", "18k", "certified", "titanium", "hand polished", "gaara"]) {
          expect(words, `${product.slug}: ${claim}`).not.toContain(claim);
        }
      }
    }
  });

  it("keep a presentation scale of their own, without touching geometry", () => {
    for (const slug of RENDERED) {
      const scale = presentationScale(catalog.getProduct(slug)!);
      expect(scale).toBeGreaterThan(0.6);
      expect(scale).toBeLessThanOrEqual(1);
    }
    // Face Studio's geometry is the drawn form's, unchanged.
    expect(catalog.getProduct("desert-eye-love")!.forms.find((f) => f.id === "anti-eyebrow")!.components.map((c) => c.id)).toEqual(["symbol", "gemstone"]);
  });
});

describe("form-specific render selection", () => {
  const desert = catalog.getProduct("desert-eye-love")!;
  const symbol: ProductRender = { ...desert.render!, hero: { src: "/symbol.webp", width: 800, height: 800 }, forms: ["micro-dermal"] };
  const stone: ProductRender = { ...desert.render!, hero: { src: "/stone.webp", width: 800, height: 800 }, forms: ["nose"] };

  it("shows the separate symbol and stone for their own forms, keeping the pair as default", () => {
    const product = { ...desert, formRenders: { "micro-dermal": symbol, nose: stone } };
    expect(renderFor(product, "micro-dermal")).toBe(symbol);
    expect(renderFor(product, "nose")).toBe(stone);
    expect(renderFor(product, "anti-eyebrow")).toBe(desert.render);
    expect(renderFor(product)).toBe(desert.render);
    expect(product.forms).toBe(desert.forms);
  });

  it("never substitutes the pair when a single-point render has not arrived", () => {
    const product = { ...desert, formRenders: undefined };
    expect(renderFor(product, "micro-dermal")).toBeUndefined();
    expect(renderFor(product, "nose")).toBeUndefined();
  });

  it("does not let an image make an unconfigured form available", () => {
    const blade = catalog.getProduct("blade-trace")!;
    const product = { ...blade, formRenders: { nose: stone } };
    expect(renderFor(product, "nose")).toBe(blade.render);
    expect(product.forms.find((form) => form.id === "nose")?.status).toBe("concept-pending");
  });

  it("maps delivered single-point slots only to their intended DESERT EYE forms", () => {
    for (const [slot, form] of [["desert-eye-symbol", "micro-dermal"], ["desert-eye-gem", "nose"]] as const) {
      if (photographicSlots.includes(slot)) {
        expect(renderFor(desert, form)?.hero.src).toBe(`/products/photographic/${slot}/hero.webp`);
      } else {
        expect(renderFor(desert, form)).toBeUndefined();
      }
    }
  });
});

describe("families known only from a render", () => {
  const concepts = ["japanese-angel", "ankh-eye"].map((slug) => catalog.getProduct(slug)!);

  it("are concepts: no form available, no price, nothing to buy", () => {
    for (const product of concepts) {
      expect(isConceptFamily(product)).toBe(true);
      expect(product.placements).toEqual([]);
      expect(priceLabel(product)).toEqual({ caption: "Concept", value: "Not for sale" });
      expect(purchaseState(product).action).toBe("");
      expect(SELLABLE_FAMILIES as readonly string[]).not.toContain(product.slug);
    }
  });

  it("can never become a bag line, even from tampered storage", () => {
    const bag = sanitizeBag({ lines: concepts.map((p) => ({ productId: p.id, formId: p.defaultFormId, quantity: 1 })) }, catalog);
    expect(bag.lines).toEqual([]);
  });

  it("leave the existing families available", () => {
    for (const slug of ["desert-eye-love", "horus-trace", "blade-trace", "crossline", "ankh-trace"]) {
      expect(isConceptFamily(catalog.getProduct(slug)!)).toBe(false);
    }
  });
});
