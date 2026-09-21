import { expect, test } from "@playwright/test";
import { FIXTURE, mouseDrag, openStudioWithPhoto, relativeCentre, touchDrag } from "./helpers";

test.describe("photo selection", () => {
  test("a supported photo opens locally and places the approved pair", async ({ page }) => {
    await openStudioWithPhoto(page);
    const item = page.getByTestId("placed-item");
    await expect(item).toHaveAttribute("data-product", "desert-eye-love");

    // Upper/outer symbol, lower/inner gemstone on the wearer's left (viewer's right).
    const symbol = await page.getByTestId("piece-symbol").boundingBox();
    const gem = await page.getByTestId("piece-gemstone").boundingBox();
    expect(symbol!.y).toBeLessThan(gem!.y);
    expect(symbol!.x).toBeGreaterThan(gem!.x);

    const src = await page.getByTestId("photo-frame").getByTestId("studio-photo").getAttribute("src");
    expect(src).toMatch(/^blob:/);
  });

  test("invalid files are refused with a clear message", async ({ page }) => {
    await page.goto("/face-studio");
    const input = page.getByTestId("photo-input").first();
    const error = page.getByTestId("photo-error").first();

    await input.setInputFiles({ name: "notes.png", mimeType: "image/png", buffer: Buffer.from("this is not an image") });
    await expect(error).toContainText("isn't a supported photo");

    await input.setInputFiles({ name: "vector.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>") });
    await expect(error).toContainText("isn't a supported photo");

    const heic = Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from("ftypheic"), Buffer.alloc(64)]);
    await input.setInputFiles({ name: "phone.heic", mimeType: "image/heic", buffer: heic });
    await expect(error).toContainText("HEIC");

    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    await input.setInputFiles({ name: "broken.png", mimeType: "image/png", buffer: Buffer.concat([png, Buffer.alloc(200, 7)]) });
    await expect(error).toContainText("couldn't be opened");

    await input.setInputFiles({ name: "huge.png", mimeType: "image/png", buffer: Buffer.concat([png, Buffer.alloc(10 * 1024 * 1024 + 10)]) });
    await expect(error).toContainText("larger than 10 MB");

    await expect(page.getByTestId("photo-frame")).toHaveCount(0);

    // A valid photo still works after errors, and the error clears.
    await input.setInputFiles(FIXTURE);
    await expect(page.getByTestId("photo-frame")).toBeVisible();
  });
});

test.describe("adjusting the jewelry", () => {
  test("drag, scale, rotate, undo, redo and reset", async ({ page }) => {
    await openStudioWithPhoto(page);
    const item = page.getByTestId("placed-item");
    const start = await relativeCentre(page, item);

    await mouseDrag(page, item, -80, 60);
    const dragged = await relativeCentre(page, item);
    expect(dragged.x).toBeLessThan(start.x - 0.05);
    expect(dragged.y).toBeGreaterThan(start.y + 0.03);

    await page.getByTestId("scale").fill("24");
    await expect(page.getByTestId("scale-value")).toHaveText("24.0%");
    const scaled = await relativeCentre(page, item);
    expect(scaled.widthRatio).toBeCloseTo(0.24, 2);

    await page.getByTestId("rotation").fill("35");
    await expect(page.getByTestId("rotation-value")).toHaveText("35°");
    await expect(item).toHaveAttribute("style", /rotate\(35deg\)/);

    // Undo steps back through rotation, scale, then the whole drag as one step.
    await page.getByTestId("undo").click();
    await expect(page.getByTestId("rotation-value")).toHaveText("0°");
    await page.getByTestId("undo").click();
    await expect(page.getByTestId("scale-value")).toHaveText("12.0%");
    await page.getByTestId("undo").click();
    const undone = await relativeCentre(page, item);
    expect(undone.x).toBeCloseTo(start.x, 3);
    expect(undone.y).toBeCloseTo(start.y, 3);
    await expect(page.getByTestId("undo")).toBeDisabled();

    await page.getByTestId("redo").click();
    const redone = await relativeCentre(page, item);
    expect(redone.x).toBeCloseTo(dragged.x, 3);

    await page.getByTestId("reset").click();
    const reset = await relativeCentre(page, item);
    expect(reset.x).toBeCloseTo(start.x, 3);
    expect(reset.y).toBeCloseTo(start.y, 3);
  });

  test("move the pair, the symbol alone and the gemstone alone, then reset to the approved arrangement", async ({ page }) => {
    await openStudioWithPhoto(page);
    const symbol = page.getByTestId("piece-symbol");
    const gemstone = page.getByTestId("piece-gemstone");
    await expect(page.getByTestId("target-group")).toHaveText("Pair");
    await expect(page.getByTestId("target-symbol")).toHaveText("Symbol");
    await expect(page.getByTestId("target-gemstone")).toHaveText("Gemstone");

    // Positions are compared relative to the photo, so page scrolling cannot affect them.
    const where = async () => ({ symbol: await relativeCentre(page, symbol), gemstone: await relativeCentre(page, gemstone) });
    const approved = await where();
    expect(approved.symbol.y).toBeLessThan(approved.gemstone.y);
    expect(approved.symbol.x).toBeGreaterThan(approved.gemstone.x);

    // On a phone the photo stage stays pinned at the top, so bring each control to the lower
    // part of the screen before pressing it, as a customer scrolling the panel would.
    const press = async (testId: string) => {
      const control = page.getByTestId(testId);
      await control.evaluate((el) => el.scrollIntoView({ block: "end" }));
      await control.click();
    };

    // Gemstone alone.
    await press("target-gemstone");
    await mouseDrag(page, gemstone, 30, 20);
    const afterGemstone = await where();
    expect(afterGemstone.gemstone.x).toBeGreaterThan(approved.gemstone.x + 0.02);
    expect(afterGemstone.symbol.x).toBeCloseTo(approved.symbol.x, 3);
    expect(afterGemstone.symbol.y).toBeCloseTo(approved.symbol.y, 3);

    // Symbol alone.
    await press("target-symbol");
    await mouseDrag(page, symbol, -25, -30);
    const afterSymbol = await where();
    expect(afterSymbol.symbol.y).toBeLessThan(afterGemstone.symbol.y - 0.015);
    expect(afterSymbol.gemstone.x).toBeCloseTo(afterGemstone.gemstone.x, 3);
    expect(afterSymbol.gemstone.y).toBeCloseTo(afterGemstone.gemstone.y, 3);

    // The pair as a whole: both pieces travel together and keep their new spacing.
    await press("target-group");
    await mouseDrag(page, page.getByTestId("placed-item"), -60, 40);
    const afterPair = await where();
    expect(afterPair.symbol.x - afterPair.gemstone.x).toBeCloseTo(afterSymbol.symbol.x - afterSymbol.gemstone.x, 3);
    expect(afterPair.symbol.x).toBeLessThan(afterSymbol.symbol.x - 0.03);
    await page.getByTestId("scale").fill("20");
    await page.getByTestId("rotation").fill("15");
    await expect(page.getByTestId("placed-item")).toHaveAttribute("style", /rotate\(15deg\)/);

    // Reset restores the exact approved default arrangement.
    await page.getByTestId("reset").click();
    const reset = await where();
    for (const piece of ["symbol", "gemstone"] as const) {
      expect(reset[piece].x).toBeCloseTo(approved[piece].x, 3);
      expect(reset[piece].y).toBeCloseTo(approved[piece].y, 3);
      expect(reset[piece].widthRatio).toBeCloseTo(approved[piece].widthRatio, 3);
    }
    await expect(page.getByTestId("rotation-value")).toHaveText("0°");
  });

  test("keyboard and buttons work instead of dragging", async ({ page }) => {
    await openStudioWithPhoto(page);
    const item = page.getByTestId("placed-item");
    const start = await relativeCentre(page, item);

    await item.focus();
    for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Shift+ArrowDown");
    const nudged = await relativeCentre(page, item);
    expect(nudged.x).toBeCloseTo(start.x - 0.02, 2);
    expect(nudged.y).toBeCloseTo(start.y + 0.02, 2);

    await page.getByTestId("nudge-right").click();
    const after = await relativeCentre(page, item);
    expect(after.x).toBeGreaterThan(nudged.x);
  });

  test("the jewelry stays on the same point of the photo when the layout resizes", async ({ page }) => {
    await openStudioWithPhoto(page);
    const item = page.getByTestId("placed-item");
    await mouseDrag(page, item, -40, 30);
    const before = await relativeCentre(page, item);

    for (const size of [{ width: 820, height: 1180 }, { width: 390, height: 844 }, { width: 1600, height: 760 }]) {
      await page.setViewportSize(size);
      await expect(async () => {
        const after = await relativeCentre(page, item);
        expect(after.x).toBeCloseTo(before.x, 2);
        expect(after.y).toBeCloseTo(before.y, 2);
        expect(after.widthRatio).toBeCloseTo(before.widthRatio, 2);
      }).toPass({ timeout: 4000 });
    }
  });

  test("side controls mirror the placement, not the symbol", async ({ page }) => {
    await openStudioWithPhoto(page);
    const item = page.getByTestId("placed-item");
    const left = await relativeCentre(page, item);
    expect(left.x).toBeGreaterThan(0.5);

    // The radio is visually hidden; customers press its label.
    await page.locator("label", { has: page.getByTestId("side-right") }).click();
    await expect(page.getByTestId("side-right")).toBeChecked();
    const right = await relativeCentre(page, item);
    expect(right.x).toBeCloseTo(1 - left.x, 2);

    // Symbol stays outer (now towards the viewer's left) and is never flipped.
    const symbol = await page.getByTestId("piece-symbol").boundingBox();
    const gem = await page.getByTestId("piece-gemstone").boundingBox();
    expect(symbol!.x).toBeLessThan(gem!.x);
    const transform = await page.getByTestId("piece-symbol").evaluate((el) => (el as HTMLElement).style.transform);
    expect(transform).not.toMatch(/scale|matrix/);
  });

  test("touch dragging moves the jewelry", async ({ page }) => {
    await openStudioWithPhoto(page);
    const item = page.getByTestId("placed-item");
    const start = await relativeCentre(page, item);
    await touchDrag(item, -50, 40);
    const moved = await relativeCentre(page, item);
    expect(moved.x).toBeLessThan(start.x - 0.03);
    expect(await item.evaluate((el) => getComputedStyle(el).touchAction)).toBe("none");
    // The page around the stage still scrolls normally.
    expect(await page.locator("body").evaluate((el) => getComputedStyle(el).touchAction)).toBe("auto");
  });
});

test.describe("products, previews and clearing", () => {
  test("switching pieces keeps the photo and the placement", async ({ page }) => {
    await openStudioWithPhoto(page);
    const item = page.getByTestId("placed-item");
    await mouseDrag(page, item, -60, 40);
    const placed = await relativeCentre(page, item);
    const src = await page.getByTestId("photo-frame").getByTestId("studio-photo").getAttribute("src");

    await page.locator('[data-testid="studio-product"][data-product="sand-vortex"]').click();
    await expect(item).toHaveAttribute("data-product", "sand-vortex");
    const switched = await relativeCentre(page, item);
    expect(switched.x).toBeCloseTo(placed.x, 2);
    expect(switched.y).toBeCloseTo(placed.y, 2);
    expect(await page.getByTestId("photo-frame").getByTestId("studio-photo").getAttribute("src")).toBe(src);
  });

  test("a product link opens the Studio on that piece", async ({ page }) => {
    await openStudioWithPhoto(page, "?product=crimson-orbit");
    await expect(page.getByTestId("placed-item")).toHaveAttribute("data-product", "crimson-orbit");
  });

  test("the photo follows the customer into product previews and clears everywhere", async ({ page, isMobile }) => {
    await openStudioWithPhoto(page);

    // Client-side navigation keeps the in-memory photo.
    if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("link", { name: "Shop", exact: true }).first().click();
    await expect(page).toHaveURL(/\/shop$/);

    const card = page.locator('[data-testid="product-card"][data-product="sand-vortex"]');
    await card.getByTestId("try-on-button").click();
    const sheet = page.getByTestId("tryon-sheet");
    await expect(sheet.getByTestId("photo-frame")).toBeVisible();
    await expect(sheet.getByTestId("placed-item")).toHaveAttribute("data-product", "sand-vortex");
    await sheet.getByRole("link", { name: "Open in Face Studio" }).click();

    await expect(page).toHaveURL(/face-studio\?product=sand-vortex/);
    await expect(page.getByTestId("studio-stage").getByTestId("photo-frame")).toBeVisible();

    await page.getByTestId("clear-photo").click();
    await expect(page.getByTestId("photo-frame")).toHaveCount(0);
    // Without a photo the look panel is put away, and the sculpted head stands in again.
    await expect(page.getByTestId("look-list")).toHaveCount(0);
    await expect(page.getByTestId("studio-head")).toBeVisible();

    if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("link", { name: "Shop", exact: true }).first().click();
    await page.locator('[data-testid="product-card"][data-product="sand-vortex"]').getByTestId("try-on-button").click();
    await expect(page.getByTestId("tryon-sheet").getByTestId("photo-frame")).toHaveCount(0);
    await expect(page.getByTestId("tryon-sheet")).toContainText("Add a photo once");
  });

  test("a reload does not bring the photo back", async ({ page }) => {
    await openStudioWithPhoto(page);
    await page.reload();
    await expect(page.getByTestId("photo-frame")).toHaveCount(0);
    const stored = await page.evaluate(async () => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
      databases: indexedDB.databases ? (await indexedDB.databases()).map((d) => d.name) : [],
      caches: "caches" in window ? await caches.keys() : [],
    }));
    expect(stored.local.filter((k) => !k.startsWith("dermal.demo-bag"))).toEqual([]);
    expect(stored.session).toEqual([]);
    // The Next.js dev server keeps its own debug database; the app itself must create none.
    expect(stored.databases.filter((name) => !name?.startsWith("__next"))).toEqual([]);
    expect(stored.caches).toEqual([]);
  });
});

test.describe("desktop preview", () => {
  test.skip(({ isMobile }) => isMobile, "hover and keyboard previews are desktop behaviour");

  test("hover shows the piece on the customer's photo, inside the viewport", async ({ page }) => {
    await openStudioWithPhoto(page);
    await page.getByRole("link", { name: "Shop", exact: true }).first().click();

    const cards = page.getByTestId("product-card");
    for (const index of [0, 3]) {
      await cards.nth(index).hover();
      const panel = page.getByTestId("hover-panel");
      await expect(panel).toBeVisible();
      await expect(panel.getByTestId("photo-frame")).toBeVisible();
      await expect(page.getByTestId("hover-panel")).toHaveCount(1);
      const box = await panel.boundingBox();
      const viewport = page.viewportSize()!;
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    }

    // The panel stays open while the pointer is inside it.
    await page.getByTestId("hover-panel").hover();
    await expect(page.getByTestId("hover-panel")).toBeVisible();

    await page.mouse.move(5, 5);
    await expect(page.getByTestId("hover-panel")).toHaveCount(0);
  });

  test("keyboard focus opens the preview and Escape closes it", async ({ page, browserName }) => {
    // Safari only tabs to links with Option held, unless the user changes a system setting.
    const tab = browserName === "webkit" ? "Alt+Tab" : "Tab";
    await page.goto("/shop");
    await page.getByRole("button", { name: "Search" }).focus();
    await page.keyboard.press(tab);
    await expect(page.getByTestId("hover-panel")).toBeVisible();
    await expect(page.getByTestId("hover-panel")).toContainText("Add a photo once");
    // Escape closes the panel and keyboard focus stays where it was, inside the card.
    // (Chromium lands on the product link; WebKit's Option+Tab lands on the card's Try on button.)
    await page.evaluate(() => document.activeElement?.setAttribute("data-had-focus", "true"));
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("hover-panel")).toHaveCount(0);
    const card = page.getByTestId("product-card").first();
    expect(await card.evaluate((el) => el.contains(document.activeElement) && document.activeElement?.getAttribute("data-had-focus") === "true")).toBe(true);
  });
});
