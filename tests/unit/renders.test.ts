import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeBag } from "@/lib/cart/bag";
import { catalog, isConceptFamily, presentationScale } from "@/lib/catalog";
import { priceLabel, purchaseState } from "@/lib/commerce/display";
import { SELLABLE_FAMILIES } from "@/lib/commerce/mapping";

const publicFile = (src: string) => path.join(process.cwd(), "public", src);

// The owner's renders of 26 September 2026: which family each one belongs to.
const RENDERED = ["desert-eye-love", "horus-trace", "japanese-angel", "ankh-eye"];

describe("design renders", () => {
  it("are attached to exactly the four families they show", () => {
    expect(catalog.listProducts().filter((p) => p.render).map((p) => p.slug).sort()).toEqual([...RENDERED].sort());
  });

  it("point at files that exist, with the sizes the files really have", async () => {
    const sharp = (await import("sharp")).default;
    for (const product of catalog.listProducts()) {
      if (!product.render) continue;
      for (const image of [product.render.hero, product.render.catalogue, product.render.detail]) {
        if (!image) continue;
        expect(image.src).toMatch(/^\/products\/[a-z-]+\/(hero|catalogue|detail)\.webp$/);
        const file = publicFile(image.src);
        expect(fs.existsSync(file), image.src).toBe(true);
        const meta = await sharp(file).metadata();
        expect([meta.width, meta.height], image.src).toEqual([image.width, image.height]);
        // Transparent, so the piece stands on DERMAL's paper and not in a box.
        expect(meta.hasAlpha, image.src).toBe(true);
      }
      expect(product.render.catalogue.width).toBe(product.render.catalogue.height);
    }
  });

  it("are called design renders, and claim nothing about the material", () => {
    for (const product of catalog.listProducts()) {
      if (!product.render) continue;
      expect(product.render.note).toMatch(/design render/i);
      expect(product.render.note).toMatch(/not photography/i);
      const words = `${product.render.alt} ${product.render.note} ${product.summary} ${product.story}`.toLowerCase();
      for (const claim of ["implant grade", "ruby", "925", "18k", "certified", "titanium", "hand polished", "gaara"]) {
        expect(words, `${product.slug}: ${claim}`).not.toContain(claim);
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
