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
    await expect(slides).toHaveCount(4);
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
    await expect(current(page)).toHaveAttribute("data-product", "crimson-orbit");
    await page.getByTestId("selection-rail").focus();
    await page.keyboard.press("ArrowRight");
    await expect(current(page)).toHaveAttribute("data-product", "sand-vortex");
    await page.keyboard.press("ArrowLeft");
    await expect(current(page)).toHaveAttribute("data-product", "crimson-orbit");

    await page.goto("/collections?family=void-stud");
    await expect(current(page)).toHaveAttribute("data-product", "void-stud");
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
    await expect(current(page)).toHaveAttribute("data-product", "crimson-orbit");
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
    await expect(slide).toContainText("01 / 04");
    await expect(slide).toContainText("Story-driven");
    await expect(slide.getByTestId("add-to-bag")).toHaveCount(0);
    await expect(slide).not.toContainText("QAR");
    await slide.getByTestId("selection-view").click();
    await expect(page).toHaveURL(/\/product\/desert-eye-love\?form=anti-eyebrow$/);
    await expect(page.getByTestId("family")).toHaveAttribute("data-form", "anti-eyebrow");
  });
});

test.describe("product page: the whole piece", () => {
  test("opens on the full piercing, assembled, with honest material notes", async ({ page }) => {
    // The anti-eyebrow form opens on its film; the nose form opens on the drawn piece with every note.
    await page.goto("/product/desert-eye-love?form=nose");
    await expect(page.getByRole("tab", { name: "Piece" })).toHaveAttribute("aria-selected", "true");
    const assembly = page.getByTestId("piece-assembly");
    await expect(assembly).toHaveAttribute("data-hardware", "stud");
    // Top, post and base are all there.
    for (const part of ["base", "posts", "gemstone"]) await expect(assembly.locator(`[data-part="${part}"]`)).toHaveCount(1);
    await expect(assembly.locator('[data-part="posts"] [data-post]')).toHaveCount(1);

    // It comes together by itself and ends fully visible.
    await expect.poll(async () => assembly.locator('[data-part="gemstone"]').evaluate((el) => getComputedStyle(el).opacity), { timeout: 6000 }).toBe("1");
    const notes = page.getByTestId("assembly-notes");
    await expect(notes).toContainText("Titanium");
    await expect(notes).toContainText("Proposed");
    await expect(notes).toContainText("Deep-red faceted gemstone");
    await expect(notes).toContainText("Material not yet confirmed");
    // The stone is never named, and nothing is called verified.
    await expect(assembly).not.toContainText(/ruby|sapphire|garnet|verified|certified/i);
    await expect(assembly).toContainText(/concept hardware/i);

    // Replay runs it again, and shopping is never blocked by it.
    await page.getByTestId("assembly-replay").click();
    await expect(page.getByTestId("add-to-bag")).toBeEnabled();

    // Each form shows its own hardware. The bar, a pair on one base, is checked on a design without a film.
    await page.locator("label", { has: page.getByTestId("form-micro-dermal") }).click();
    await expect(assembly).toHaveAttribute("data-hardware", "anchor");
    await expect(assembly.locator('[data-part="posts"] [data-post]')).toHaveCount(1);
    await page.goto("/product/sand-vortex");
    const bar = page.getByTestId("piece-assembly");
    await expect(bar).toHaveAttribute("data-hardware", "bar");
    for (const part of ["base", "posts"]) await expect(bar.locator(`[data-part="${part}"]`)).toHaveCount(1);
    await expect(bar.locator('[data-part="posts"] [data-post]')).toHaveCount(2);
  });

  test("with reduced motion the piece is simply assembled", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/product/desert-eye-love?form=micro-dermal");
    const symbol = page.getByTestId("piece-assembly").locator('[data-part="symbol"]');
    await expect.poll(async () => symbol.evaluate((el) => getComputedStyle(el).opacity), { timeout: 1500 }).toBe("1");
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
