import { expect, test, type Page } from "@playwright/test";

const current = (page: Page) => page.locator('[data-testid="selection-slide"][data-current="true"]');

test.describe("the selection: sideways browsing", () => {
  test("families sit side by side and are stepped with the arrows, the keyboard and the address", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/collections");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("The selection");
    const slides = page.getByTestId("selection-slide");
    await expect(slides).toHaveCount(10);
    await expect(current(page)).toHaveAttribute("data-product", "desert-eye-love");

    // Side by side: every slide shares a row and each starts to the right of the one before.
    const boxes = [];
    for (const slide of await slides.all()) boxes.push((await slide.boundingBox())!);
    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i].x).toBeGreaterThan(boxes[i - 1].x + boxes[i - 1].width * 0.9);
      expect(Math.abs(boxes[i].y - boxes[0].y)).toBeLessThan(2);
    }
    // The page itself never scrolls sideways; only the rail does.
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    await expect(page.getByTestId("selection-prev")).toBeDisabled();
    await page.getByTestId("selection-next").click();
    await expect(current(page)).toHaveAttribute("data-product", "horus-trace");
    await page.getByTestId("selection-rail").focus();
    await page.keyboard.press("ArrowRight");
    await expect(current(page)).toHaveAttribute("data-product", "blade-trace");
    await page.keyboard.press("ArrowLeft");
    await expect(current(page)).toHaveAttribute("data-product", "horus-trace");

    // ANKH + EYE is the last family in the rail (26 September 2026); the concept follows it and the rail ends there.
    await page.goto("/collections?family=ankh-eye");
    await expect(current(page)).toHaveAttribute("data-product", "ankh-eye");
    // The last family is followed by one design that exists only as a direction, and the rail ends there.
    await page.getByTestId("selection-next").click();
    await expect(page.locator('[data-testid="selection-concept"][data-current="true"]')).toHaveCount(1);
    await expect(page.getByTestId("selection-index")).toHaveText(/Concept · KIRI/);
    await expect(page.getByTestId("selection-next")).toBeDisabled();
    expect(errors).toEqual([]);
  });

  test("a finger swipes it, and vertical scrolling is left alone", async ({ page, isMobile }) => {
    await page.goto("/collections");
    const rail = page.getByTestId("selection-rail");
    // A swipe is an ordinary sideways scroll of the rail, with snap points.
    const style = await rail.evaluate((el) => ({ overflowX: getComputedStyle(el).overflowX, snap: getComputedStyle(el).scrollSnapType, touch: getComputedStyle(el).touchAction }));
    expect(style.overflowX).toBe("auto");
    expect(style.snap).toContain("x");
    expect(style.touch).toBe("auto");
    await rail.evaluate((el) => {
      const second = el.children[1] as HTMLElement;
      el.scrollTo({ left: second.offsetLeft - (el.clientWidth - second.clientWidth) / 2, behavior: "auto" });
    });
    await expect(current(page)).toHaveAttribute("data-product", "horus-trace");
    // The wheel still moves the page, not the rail.
    if (!isMobile) {
      const before = await rail.evaluate((el) => el.scrollLeft);
      await page.mouse.move(400, 400);
      await page.mouse.wheel(0, 300);
      await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(0);
      expect(await rail.evaluate((el) => el.scrollLeft)).toBe(before);
    }
  });

  test("each family is a gallery label, not a card: number, name, kind, and two ways in", async ({ page }) => {
    await page.goto("/collections");
    const slide = current(page);
    await expect(slide).toContainText("01 / 10");
    // The kind line now names the lines the piece is browsed under.
    await expect(slide).toContainText("Inspired · Featured");
    await expect(slide.getByTestId("add-to-bag")).toHaveCount(0);
    await expect(slide).not.toContainText("QAR");
    await slide.getByTestId("selection-view").click();
    await expect(page).toHaveURL(/\/product\/desert-eye-love\?form=anti-eyebrow$/);
    await expect(page.getByTestId("family")).toHaveAttribute("data-form", "anti-eyebrow");
  });
});

test.describe("product page: the whole piece", () => {
  test("opens on the chosen form's photograph and keeps materials and hardware unconfirmed", async ({ page }) => {
    await page.goto("/product/desert-eye-love?form=nose");
    await expect(page.getByRole("tab", { name: "The piece" })).toHaveAttribute("aria-selected", "true");
    const stage = page.getByTestId("render-stage");
    const image = page.getByTestId("render-stage-image");
    await expect(stage).toHaveAttribute("data-presentation", "photographic");
    await expect(image).toHaveAttribute("src", "/products/photographic/desert-eye-gem/hero.webp");
    await expect(page.getByTestId("piece-assembly")).toHaveCount(0);
    await expect(page.getByTestId("assembly-explode")).toHaveCount(0);
    // Material proposals remain in readable details; the photograph does not certify them.
    await page.locator("details").evaluateAll((els) => els.forEach((el) => ((el as HTMLDetailsElement).open = true)));
    const notes = page.locator(".pdp-details");
    await expect(notes).toContainText("Titanium — proposed");
    await expect(notes).toContainText("Deep-red faceted gemstone — material not yet confirmed");
    await expect(notes).toContainText("Polished — proposed");
    await expect(notes).not.toContainText(/ruby|sapphire|garnet|certified/i);
    await expect(page.getByTestId("spec-status")).toContainText("final production details pending");
    await expect(page.getByTestId("add-to-bag")).toBeEnabled();

    // Switching forms changes the image itself, rather than shrinking the pair or inventing hardware.
    await page.locator("label", { has: page.getByTestId("form-micro-dermal") }).click();
    await expect(image).toHaveAttribute("src", "/products/photographic/desert-eye-symbol/hero.webp");
    await page.locator("label", { has: page.getByTestId("form-anti-eyebrow") }).click();
    await expect(image).toHaveAttribute("src", "/products/photographic/desert-eye-love/hero.webp");
    await page.goto("/product/sand-vortex");
    await expect(image).toHaveAttribute("src", "/products/photographic/sand-vortex/hero.webp");
    await expect(page.getByTestId("piece-assembly")).toHaveCount(0);
  });

  test("with reduced motion the chosen form's photograph is immediately visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/product/desert-eye-love?form=micro-dermal");
    const symbol = page.getByTestId("render-stage-image");
    await expect(symbol).toHaveAttribute("src", "/products/photographic/desert-eye-symbol/hero.webp");
    await expect(symbol).toBeVisible();
    await expect(page.getByTestId("piece-assembly")).toHaveCount(0);
  });

  test("the sculpted head is built from soft shading only, with no drawn lines", async ({ page }) => {
    await page.goto("/product/desert-eye-love");
    await page.getByRole("tab", { name: "Placement" }).click();
    const head = page.getByTestId("placement-preview");
    await expect(head).toContainText("not a person");
    const strokes = await head.locator("svg").first().evaluate((svg) => [...svg.querySelectorAll("*")].filter((el) => el.getAttribute("stroke") && el.getAttribute("stroke") !== "none").length);
    expect(strokes).toBe(0);
    await expect(head.getByTestId("placement-piece")).toHaveCount(2);
  });
});
