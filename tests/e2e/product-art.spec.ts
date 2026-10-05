import { expect, test, type Locator, type Page } from "@playwright/test";
import { openStudioWithPhoto } from "./helpers";

const SYMBOL = /\/products\/desert-eye-love\/[a-z-]+\/symbol\.webp$/;
const GEMSTONE = /\/products\/desert-eye-love\/[a-z-]+\/gemstone\.webp$/;

/** Every prototype image inside a region: loaded, never flipped, never recoloured. */
async function inspect(region: Locator) {
  const images = region.getByTestId("piece-asset");
  await expect(images.first()).toBeVisible();
  return images.evaluateAll((nodes) =>
    (nodes as HTMLImageElement[]).map((img) => {
      // A flip anywhere up the tree would show as a negative horizontal scale.
      let flipped = false;
      for (let el: HTMLElement | null = img; el; el = el.parentElement) {
        const t = getComputedStyle(el).transform;
        if (t && t !== "none" && new DOMMatrixReadOnly(t).a < 0) flipped = true;
      }
      return {
        component: img.dataset.component,
        src: new URL(img.currentSrc || img.src).pathname,
        loaded: img.complete && img.naturalWidth > 0,
        natural: [img.naturalWidth, img.naturalHeight],
        width: img.getBoundingClientRect().width,
        flipped,
        filter: getComputedStyle(img).filter,
      };
    }),
  );
}

const waitForArt = (page: Page) => page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('[data-testid="piece-asset"]')].every((i) => i.complete && i.naturalWidth > 0));

test.describe("prototype product art", () => {
  test("photographic scenes follow each form while placement retains exact symbol and gemstone assets", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("response", (r) => r.url().includes("/products/") && r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));

    // Collection scenes use each form's own photograph; geometry stays in Placement and Face Studio.
    await page.goto("/collections/desert-eye");
    for (const [form, slot] of [["anti-eyebrow", "desert-eye-love"], ["micro-dermal", "desert-eye-symbol"], ["nose", "desert-eye-gem"]]) {
      const scene = page.locator(`[data-testid="story-piece"][data-form="${form}"][data-product="desert-eye-love"]`);
      await expect(scene).toHaveAttribute("data-presentation", "photographic");
      await expect(scene.locator("img")).toHaveAttribute("src", `/products/photographic/${slot}/thumb.webp`);
      await expect(scene.getByTestId("piece-asset")).toHaveCount(0);
    }

    await page.goto("/product/desert-eye-love");
    await expect(page.getByTestId("render-stage")).toBeVisible();
    await page.getByRole("tab", { name: "Placement" }).click();
    await waitForArt(page);
    const pair = await inspect(page.getByTestId("placement-preview"));
    expect(pair.map((p) => p.component)).toEqual(["symbol", "gemstone"]);
    expect(pair[0].src).toMatch(SYMBOL);
    expect(pair[1].src).toMatch(GEMSTONE);
    expect(pair[0].natural).toEqual([1600, 1656]);
    expect(pair[1].natural).toEqual([800, 800]);
    expect(pair[1].width / pair[0].width).toBeGreaterThan(0.34);
    expect(pair[1].width / pair[0].width).toBeLessThan(0.42);

    await page.goto("/product/desert-eye-love?form=micro-dermal");
    await expect(page.getByTestId("render-stage-image")).toHaveAttribute("src", "/products/photographic/desert-eye-symbol/hero.webp");
    await page.getByRole("tab", { name: "Placement" }).click();
    await waitForArt(page);
    const dermal = await inspect(page.getByTestId("placement-preview"));
    expect(dermal.map((p) => p.src)).toEqual(["/products/desert-eye-love/micro-dermal/symbol.webp"]);

    await page.goto("/product/desert-eye-love?form=nose");
    await expect(page.getByTestId("render-stage-image")).toHaveAttribute("src", "/products/photographic/desert-eye-gem/hero.webp");
    await page.getByRole("tab", { name: "Placement" }).click();
    await waitForArt(page);
    const nose = await inspect(page.getByTestId("placement-preview"));
    expect(nose.map((p) => p.src)).toEqual(["/products/desert-eye-love/nose/gemstone.webp"]);

    // Shop grid and bag thumbnail.
    await page.goto("/shop");
    await waitForArt(page);
    // Shopping imagery follows the selected form without borrowing another form's geometry.
    const card = page.locator('[data-testid="product-card"][data-product="desert-eye-love"]');
    await expect(card.getByTestId("piece-render")).toHaveAttribute("src", "/products/photographic/desert-eye-love/thumb.webp");
    await expect(card.getByTestId("piece-asset")).toHaveCount(0);
    await expect(card).toContainText("Design render");
    await expect(page.locator('[data-testid="product-card"][data-product="sand-vortex"]')).toContainText("Design render");
    await page.goto("/product/desert-eye-love?form=nose");
    await page.getByTestId("add-to-bag").click();
    const line = page.locator('[data-testid="bag-line"][data-form="nose"]');
    await expect(line.locator('[data-presentation="photographic"] img')).toHaveAttribute("src", "/products/photographic/desert-eye-gem/thumb.webp");

    for (const group of [pair, dermal, nose]) {
      for (const piece of group) {
        expect(piece.loaded, `${piece.src} loaded`).toBe(true);
        expect(piece.flipped, `${piece.src} is never flipped`).toBe(false);
        expect(piece.filter, "the image is never recoloured").not.toMatch(/hue-rotate|invert|sepia|grayscale/);
      }
    }
    expect(errors).toEqual([]);
  });

  test("Face Studio uses the same images, keeps the three controls, and mirrors position only", async ({ page }) => {
    await openStudioWithPhoto(page);
    await waitForArt(page);
    const stage = page.getByTestId("studio-stage");
    const left = await inspect(stage);
    expect(left.map((p) => p.component)).toEqual(["symbol", "gemstone"]);
    for (const id of ["target-group", "target-symbol", "target-gemstone"]) await expect(page.getByTestId(id)).toBeVisible();

    const symbolBox = async () => (await stage.getByTestId("piece-symbol").boundingBox())!;
    const gemBox = async () => (await stage.getByTestId("piece-gemstone").boundingBox())!;
    const before = { symbol: await symbolBox(), gem: await gemBox() };
    expect(before.symbol.x).toBeGreaterThan(before.gem.x); // wearer's left: the symbol is the outer piece, on the viewer's right

    await page.locator("label", { has: page.getByTestId("side-right") }).click();
    await expect(page.getByTestId("side-right")).toBeChecked();
    const right = await inspect(stage);
    const after = { symbol: await symbolBox(), gem: await gemBox() };
    // Positions swap sides. The pictures do not: same files, same size, no negative scale anywhere.
    expect(after.symbol.x).toBeLessThan(after.gem.x);
    expect(after.symbol.y).toBeLessThan(after.gem.y);
    expect(right.map((p) => p.src)).toEqual(left.map((p) => p.src));
    expect(right.every((p) => !p.flipped)).toBe(true);
    expect(after.symbol.width).toBeCloseTo(before.symbol.width, 0);

    // The symbol alone can still be selected and nudged, and the stone stays where it was.
    await page.getByTestId("target-symbol").click();
    const gemStill = await gemBox();
    await stage.getByTestId("piece-symbol").focus();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    expect((await symbolBox()).y).toBeLessThan(after.symbol.y);
    expect((await gemBox()).y).toBeCloseTo(gemStill.y, 0);
  });
});
