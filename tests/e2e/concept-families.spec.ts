import { expect, test } from "@playwright/test";
import { openStudioWithPhoto } from "./helpers";

// CROSSLINE, ANKH TRACE and HORUS TRACE (the owner's brief of 23 September 2026). They are concept
// products: drawn from a written description, with no price, no confirmed material and no hardware.
// These tests hold that honesty in place, and check that each one is browsable, has a product page,
// a placement preview and a place in Face Studio.

const FAMILIES = [
  { slug: "crossline", title: "CROSSLINE", lines: "Original · Signature", form: "micro-dermal", motion: "sweep" },
  { slug: "ankh-trace", title: "ANKH TRACE", lines: "Original · Symbolic", form: "micro-dermal", motion: "pendulum" },
  { slug: "horus-trace", title: "HORUS TRACE", lines: "Original · Symbolic · Ancient", form: "anti-eyebrow", motion: "eye" },
];

// Words that must never appear on these pages: the supplied poster's claims and the standing bans.
const BANNED = ["implant-grade", "implant grade", "genuine gemstone", "sterling", "ruby", "official collaboration", "grade 5", "certified"];

test.describe("the three concept families", () => {
  test("all three are in the full collection, the selection and the shop", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByTestId("product-card")).toHaveCount(7);
    for (const f of FAMILIES) {
      await expect(page.locator(`[data-testid="product-card"][data-product="${f.slug}"]`)).toHaveCount(1);
    }
    // Every piece is unisex, so each one shows under men and under women.
    for (const browse of ["men", "women", "original"]) {
      await page.goto(`/shop?browse=${browse}`);
      for (const f of FAMILIES) {
        await expect(page.locator(`[data-testid="product-card"][data-product="${f.slug}"]`)).toHaveCount(1);
      }
    }
    await page.goto("/shop?browse=inspired");
    for (const f of FAMILIES) {
      await expect(page.locator(`[data-testid="product-card"][data-product="${f.slug}"]`)).toHaveCount(0);
    }
    await page.goto("/collections");
    for (const f of FAMILIES) {
      await expect(page.locator(`[data-testid="selection-slide"][data-product="${f.slug}"]`)).toHaveCount(1);
    }
  });

  for (const f of FAMILIES) {
    test(`${f.title}: a concept product page with honest status and no invented specification`, async ({ page }) => {
      await page.goto(`/product/${f.slug}`);
      const family = page.getByTestId("family");
      await expect(family).toHaveAttribute("data-form", f.form);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(f.title);
      await expect(page.getByTestId("family-lines")).toHaveText(f.lines);
      // No price, and nothing can be put in the bag.
      await expect(page.getByTestId("family-price")).toContainText("Price pending");
      await expect(page.getByTestId("concept-notice")).toBeVisible();
      await expect(page.getByTestId("add-to-bag")).toHaveCount(0);
      // The piece, the placement and try-on exist; nothing pretends to be a film or a 360.
      const modes = page.getByRole("tab");
      await expect(modes).toHaveText(["The piece", "Placement", "Try on"]);
      const text = (await page.locator("main").innerText()).toLowerCase();
      for (const word of BANNED) expect(text).not.toContain(word);
    });
  }

  test("HORUS TRACE says what is still undecided, and names no material as a fact", async ({ page }) => {
    await page.goto("/product/horus-trace");
    // Every folded section is opened at once: the specification lives inside them.
    await page.locator("details").first().waitFor();
    await page.locator("details").evaluateAll((els) => els.forEach((el) => ((el as HTMLDetailsElement).open = true)));
    const text = await page.locator("main").innerText();
    for (const line of [
      "Prototype specification",
      "Dark faceted gemstone — material not yet confirmed",
      "Not yet confirmed",
      "Polished — proposed",
      "Surface-bar concept — final specification pending",
    ]) {
      expect(text).toContain(line);
    }
  });

  test("the placement preview puts each piece where the owner asked", async ({ page }) => {
    for (const f of FAMILIES) {
      await page.goto(`/product/${f.slug}`);
      await page.getByRole("tab", { name: "Placement" }).click();
      const preview = page.getByTestId("placement-preview");
      await expect(preview).toHaveAttribute("data-placement", f.form === "anti-eyebrow" ? "anti-eyebrow" : "dermal");
      await expect(preview.getByTestId("placement-piece").first()).toBeVisible();
    }
  });

  test("each family carries its own motion, and none of them carries sand", async ({ page }) => {
    await page.goto("/collections");
    for (const f of FAMILIES) {
      const slide = page.locator(`[data-testid="selection-slide"][data-product="${f.slug}"]`);
      await expect(slide.locator(".fo")).toHaveAttribute("data-motion", f.motion);
      await expect(slide.getByTestId("sand-layer")).toHaveCount(0);
    }
  });

  test("all three are in the Face Studio rail and keep the manual tools", async ({ page }) => {
    await openStudioWithPhoto(page);
    for (const f of FAMILIES) {
      const choice = page.locator(`[data-testid="studio-product"][data-product="${f.slug}"]`);
      await expect(choice).toHaveCount(1);
      await choice.click();
      await expect(choice).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByTestId("placed-item")).toHaveCount(1);
    }
    // The manual adjustments stay: nothing about these pieces is positioned automatically.
    for (const tool of ["tool-move", "tool-scale", "tool-rotate"]) await expect(page.getByTestId(tool)).toBeVisible();
  });
});
