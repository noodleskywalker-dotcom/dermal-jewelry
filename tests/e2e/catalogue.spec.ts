import { expect, test } from "@playwright/test";

// The catalogue rebalance (the owner's brief, 24 September 2026). DERMAL is the brand and DESERT EYE
// is one collection inside it: the catalogue is brand-neutral, every family is given a stage of
// roughly equal weight, and discovery comes first. These tests hold that balance in place.

const FAMILIES = ["desert-eye-love", "horus-trace", "blade-trace", "crossline", "ankh-trace"];

test.describe("the catalogue is the brand, not one collection", () => {
  test("no sand, no world and no campaign treatment anywhere on it", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByTestId("sand-layer")).toHaveCount(0);
    // Nothing on the page is painted: the pieces stand on the paper itself.
    const painted = await page.locator("main *").evaluateAll((els) =>
      els.filter((el) => {
        const box = el.getBoundingClientRect();
        if (box.width < 160 || box.height < 160) return false;
        return !/rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(el).backgroundColor);
      }).length,
    );
    expect(painted).toBe(0);
  });

  test("every family has a stage of roughly equal weight, and DESERT EYE is not the largest", async ({ page, isMobile }) => {
    await page.goto("/shop");
    const cards = page.getByTestId("product-card");
    await expect(cards).toHaveCount(8);

    const stages = Object.fromEntries(
      await cards.evaluateAll((els) =>
        els.map((el) => [
          el.getAttribute("data-product"),
          Math.round(el.querySelector(".piece-object")!.getBoundingClientRect().width),
        ]),
      ),
    ) as Record<string, number>;

    const widths = Object.values(stages);
    const largest = Math.max(...widths);
    const smallest = Math.min(...widths);
    // A wide stage is a composition, not a ranking: no piece gets a frame half as big again as another.
    expect(largest / smallest).toBeLessThanOrEqual(1.35);
    // On a phone every stage is the same width.
    if (isMobile) expect(new Set(widths).size).toBe(1);
    // The second hero reads as the equal of the first.
    expect(stages["horus-trace"] / stages["desert-eye-love"]).toBeGreaterThan(0.75);
  });

  test("DESERT EYE is marked featured, not enlarged, and HORUS TRACE carries the same mark", async ({ page }) => {
    await page.goto("/shop");
    for (const slug of ["desert-eye-love", "horus-trace"]) {
      await expect(page.locator(`[data-testid="product-card"][data-product="${slug}"]`).getByTestId("piece-flag")).toHaveText("Featured");
    }
    await expect(page.getByTestId("piece-flag")).toHaveCount(2);
  });

  test("each piece says what it is, what it costs and where it goes, with two ways on", async ({ page }) => {
    await page.goto("/shop");
    const horus = page.locator('[data-testid="product-card"][data-product="horus-trace"]');
    await expect(horus.getByTestId("piece-kind")).toHaveText("Anti-eyebrow · Symbolic · Ancient · Demo");
    await expect(horus).toContainText("Price pending");
    await expect(horus.getByTestId("view-piece")).toHaveAttribute("href", "/product/horus-trace");
    await expect(horus.getByTestId("try-on-button")).toBeVisible();
    // A piece with a demo price shows it as a demo price and never as a selling price.
    const desert = page.locator('[data-testid="product-card"][data-product="desert-eye-love"]');
    await expect(desert).toContainText("QAR 390");
    await expect(desert).toContainText("Demo");
  });
});

test.describe("finding a piece", () => {
  test("the catalogue opens on everything, and the lines and placements filter it", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByTestId("catalogue-count")).toHaveText("8 pieces");
    // Nothing is preselected: no line and no placement is current until one is chosen.
    const lines = page.getByRole("navigation", { name: "Browse the collection" });
    await expect(lines.locator('[aria-current="true"]')).toHaveText("All");

    await lines.getByRole("link", { name: "Full collection", exact: true }).click();
    await expect(page).toHaveURL(/browse=full/);
    await expect(page.getByTestId("product-card")).toHaveCount(8);

    await page.goto("/shop?browse=original");
    const originals = await page.getByTestId("product-card").evaluateAll((els) => els.map((el) => el.getAttribute("data-product")));
    expect(originals).toContain("crossline");
    expect(originals).toContain("ankh-trace");
    expect(originals).not.toContain("desert-eye-love");

    await page.goto("/shop?placement=anti-eyebrow&browse=women");
    await expect(page.getByTestId("product-card").first()).toBeVisible();
    // A placement keeps the line that was already chosen.
    await expect(page.getByRole("navigation", { name: "Filter by placement" }).locator('[aria-current="true"]')).toHaveText("Anti-eyebrow");
  });

  test("the editorial view and the grid view show the same pieces", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByTestId("catalogue")).toHaveAttribute("data-layout", "editorial");
    await page.getByRole("navigation", { name: "Catalogue view" }).getByRole("link", { name: "Grid", exact: true }).click();
    await expect(page).toHaveURL(/view=even/);
    const grid = page.getByTestId("catalogue");
    await expect(grid).toHaveAttribute("data-layout", "even");
    await expect(page.getByTestId("product-card")).toHaveCount(8);
    // Even means even: every stage in the grid view is the same width.
    const widths = await page.locator(".piece-object").evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
    expect(new Set(widths).size).toBe(1);
    // The view survives a filter.
    await page.getByRole("navigation", { name: "Browse the collection" }).getByRole("link", { name: "Men", exact: true }).click();
    await expect(page).toHaveURL(/view=even/);
  });

  test("every design family is reachable from the catalogue", async ({ page }) => {
    await page.goto("/shop");
    for (const slug of FAMILIES) {
      await expect(page.locator(`[data-testid="product-card"][data-product="${slug}"]`)).toHaveCount(1);
    }
  });
});

test.describe("a concept is named, never sold", () => {
  test("KIRI is words at the end of the catalogue, with no stage, no price and nothing to order", async ({ page }) => {
    await page.goto("/shop");
    const concepts = page.getByTestId("catalogue-concepts");
    await expect(concepts).toContainText("In design");
    const kiri = concepts.locator('[data-concept="KIRI"]');
    await expect(kiri).toContainText("Original · Concept");
    await expect(kiri).toContainText("not a product");
    // No artwork, no price, no way to buy it, and it is not counted among the pieces.
    await expect(kiri.locator("img, svg")).toHaveCount(0);
    await expect(kiri).not.toContainText("QAR");
    await expect(kiri.getByRole("link")).toHaveCount(0);
    await expect(page.getByTestId("catalogue-count")).toHaveText("8 pieces");
    // It is left out where the catalogue is narrowed to something it could not belong to.
    await page.goto("/shop?placement=anti-eyebrow");
    await expect(page.getByTestId("catalogue-concepts")).toHaveCount(0);
    await page.goto("/shop?browse=inspired");
    await expect(page.getByTestId("catalogue-concepts")).toHaveCount(0);
    await page.goto("/shop?browse=original");
    await expect(page.getByTestId("catalogue-concepts")).toBeVisible();
  });
});

test.describe("the companion stays an aside on the catalogue", () => {
  test("he is small, in the corner, and never wraps the pieces in his own collection", async ({ page }) => {
    await page.goto("/shop");
    test.skip((await page.getByTestId("global-mascot").count()) === 0, "internal mascot art is not on this machine");
    const box = (await page.getByTestId("global-mascot").boundingBox())!;
    const view = page.viewportSize()!;
    expect(box.width).toBeLessThan(view.width * 0.25);
    expect(view.width - (box.x + box.width)).toBeLessThan(40);
    // No sand follows him here: a press on the catalogue simply opens DESERT EYE.
    await expect(page.getByTestId("sand-layer")).toHaveCount(0);
  });
});
