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
  test("the real symbol and gemstone are drawn on every surface that shows DESERT EYE — LOVE", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("response", (r) => r.url().includes("/products/") && r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));

    // Collection stage: three floating forms of the design.
    await page.goto("/collections/desert-eye");
    await waitForArt(page);
    const pair = await inspect(page.locator('[data-testid="story-piece"][data-form="anti-eyebrow"][data-product="desert-eye-love"]'));
    expect(pair.map((p) => p.component)).toEqual(["symbol", "gemstone"]);
    expect(pair[0].src).toMatch(SYMBOL);
    expect(pair[1].src).toMatch(GEMSTONE);
    expect(pair[0].natural).toEqual([1600, 1656]);
    expect(pair[1].natural).toEqual([800, 800]);
    // The approved proportion: the stone is a little over a third of the symbol's width.
    expect(pair[1].width / pair[0].width).toBeGreaterThan(0.34);
    expect(pair[1].width / pair[0].width).toBeLessThan(0.42);
    const dermal = await inspect(page.locator('[data-testid="story-piece"][data-form="micro-dermal"]'));
    expect(dermal.map((p) => p.src)).toEqual(["/products/desert-eye-love/micro-dermal/symbol.webp"]);
    const nose = await inspect(page.locator('[data-testid="story-piece"][data-form="nose"]'));
    expect(nose.map((p) => p.src)).toEqual(["/products/desert-eye-love/nose/gemstone.webp"]);
    // A design without supplied art keeps its drawn artwork. Nothing was invented for it.
    await expect(page.locator('[data-testid="story-piece"][data-product="sand-vortex"]').getByTestId("piece-asset")).toHaveCount(0);

    // Product page: still, placement head, and the honest label.
    // The anti-eyebrow form opens on its product animation; the film is presentation, so the exact art
    // is checked on the placement head, and the assembly is checked on a form without a film.
    await page.goto("/product/desert-eye-love");
    await expect(page.getByTestId("product-film")).toBeVisible();
    await page.getByRole("tab", { name: "Placement preview" }).click();
    await waitForArt(page);
    const placed = await inspect(page.getByTestId("placement-preview"));
    expect(placed.map((p) => p.component)).toEqual(["symbol", "gemstone"]);
    expect(placed.every((p) => p.loaded && !p.flipped)).toBe(true);
    await page.goto("/product/desert-eye-love?form=micro-dermal");
    await waitForArt(page);
    const assembled = await inspect(page.getByTestId("piece-assembly"));
    expect(assembled.map((p) => p.component)).toEqual(["symbol"]);
    expect(assembled.every((p) => p.loaded && !p.flipped)).toBe(true);

    // Shop grid and bag thumbnail.
    await page.goto("/shop");
    await waitForArt(page);
    const card = page.locator('[data-testid="product-card"][data-product="desert-eye-love"]');
    expect((await inspect(card)).length).toBe(2);
    await expect(card).toContainText("Prototype artwork");
    await expect(page.locator('[data-testid="product-card"][data-product="sand-vortex"]')).toContainText("Concept artwork");
    await page.goto("/product/desert-eye-love?form=nose");
    await page.getByTestId("add-to-bag").click();
    const line = page.locator('[data-testid="bag-line"][data-form="nose"]');
    expect((await inspect(line)).map((p) => p.src)).toEqual(["/products/desert-eye-love/nose/gemstone.webp"]);

    for (const group of [pair, dermal, nose, placed]) {
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
