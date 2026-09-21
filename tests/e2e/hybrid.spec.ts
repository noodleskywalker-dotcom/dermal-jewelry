import { expect, test, type Page } from "@playwright/test";

// The HYBRID visual system: Atelier Paper everywhere, sand and chrome for DESERT EYE alone.

const PAPER = "rgb(251, 250, 247)";
const current = (page: Page) => page.locator('[data-testid="selection-slide"][data-current="true"]');

test.describe("one light system on every page", () => {
  for (const route of ["/", "/collections", "/product/desert-eye-love", "/face-studio", "/shop", "/cart", "/about"]) {
    test(`${route} is paper with a light navigation bar`, async ({ page }) => {
      await page.goto(route);
      expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(PAPER);
      const header = page.locator("header[data-tone]").first();
      await expect(header).toHaveAttribute("data-tone", "light");
      // Near-black words on the bar, never ivory on a dark bar.
      const colour = await header.getByRole("link", { name: "DERMAL home" }).evaluate((el) => getComputedStyle(el).color);
      expect(colour).toBe("rgb(12, 12, 13)");
    });
  }

  test("the shop stands its pieces on the paper: no tinted tiles and no boxed filters", async ({ page }) => {
    await page.goto("/shop");
    const cards = page.getByTestId("product-card");
    await expect(cards).toHaveCount(4);
    for (const card of await cards.all()) {
      const painted = await card.evaluate((li) =>
        [li, ...li.querySelectorAll("*")].filter((el) => {
          const s = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          // A tile is a large filled surface. Light sweeps and shadows are gradients and belong to the jewelry.
          return box.width > 120 && box.height > 120 && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor);
        }).length,
      );
      expect(painted).toBe(0);
    }
    const filter = page.getByRole("navigation", { name: "Filter by placement" }).getByRole("link").first();
    expect(await filter.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe("0px");
  });
});

test.describe("sand belongs to DESERT EYE alone", () => {
  test("the sand layer sits on the DESERT EYE slide and nowhere else", async ({ page }) => {
    await page.goto("/collections");
    await expect(page.getByTestId("sand-layer")).toHaveCount(1);
    const host = page.locator('[data-testid="selection-slide"]', { has: page.getByTestId("sand-layer") });
    await expect(host).toHaveAttribute("data-product", "desert-eye-love");
    await expect
      .poll(() => page.getByTestId("sand-layer").evaluate((el) => Number(getComputedStyle(el).opacity)))
      .toBeGreaterThan(0.9);

    // The next family is centred: the sand has gone with its slide.
    await page.getByTestId("selection-next").click();
    await expect(current(page)).toHaveAttribute("data-product", "crimson-orbit");
    await expect
      .poll(() => page.getByTestId("sand-layer").evaluate((el) => Number(getComputedStyle(el).opacity)))
      .toBeLessThan(0.05);

    // Its own product page stands on the same sand; an original's product page does not.
    await page.goto("/product/desert-eye-love");
    await expect(page.getByTestId("sand-layer")).toHaveCount(1);

    for (const route of ["/shop", "/product/crimson-orbit", "/face-studio", "/cart"]) {
      await page.goto(route);
      await expect(page.getByTestId("sand-layer")).toHaveCount(0);
    }
  });

  test("KIRI is words and one chrome hairline: no artwork, no price, no sand", async ({ page }) => {
    await page.goto("/collections");
    const kiri = page.getByTestId("selection-concept");
    await expect(kiri).toHaveCount(1);
    await expect(kiri.getByRole("heading")).toHaveText("KIRI");
    await expect(kiri.locator("img, svg")).toHaveCount(0);
    await expect(kiri.getByTestId("sand-layer")).toHaveCount(0);
    await expect(kiri).not.toContainText("QAR");
    await expect(page.getByTestId("selection-index")).toHaveText(/Index 01 \/ 05/);
  });
});

test.describe("the selection is dragged with a mouse", () => {
  test("a drag moves to the next family and does not open the product", async ({ page, isMobile }) => {
    test.skip(isMobile, "Touch swipes the rail natively.");
    await page.goto("/collections");
    const rail = page.getByTestId("selection-rail");
    const box = (await rail.boundingBox())!;
    const y = box.y + box.height * 0.3;
    await page.mouse.move(box.x + box.width * 0.62, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.4, y, { steps: 6 });
    await page.mouse.move(box.x + box.width * 0.12, y, { steps: 6 });
    await page.mouse.up();
    await expect(current(page)).toHaveAttribute("data-product", "crimson-orbit");
    await expect(page).toHaveURL(/\/collections$/);
  });
});

test.describe("the piece: assembly, exploded view, replay", () => {
  test("it assembles once, opens out, closes and replays, with the owner's material wording", async ({ page }) => {
    await page.goto("/product/desert-eye-love");
    const piece = page.getByTestId("piece-assembly");
    await expect(piece).toHaveAttribute("data-phase", "assembling");
    await expect(piece).toHaveAttribute("data-phase", "assembled", { timeout: 8000 });

    const notes = page.getByTestId("assembly-notes");
    await expect(notes).toContainText("Titanium");
    await expect(notes).toContainText("Proposed");
    await expect(notes).toContainText("Deep-red faceted gemstone");
    await expect(notes).toContainText("Material not yet confirmed");
    await expect(notes).toContainText("Polished finish");
    await expect(piece).toContainText("Hardware shown conceptually");
    const words = (await page.locator("main").innerText()).toLowerCase();
    for (const banned of ["ruby", "implant-grade", "implant grade", "certified"]) expect(words).not.toContain(banned);

    const explode = page.getByTestId("assembly-explode");
    await explode.click();
    await expect(piece).toHaveAttribute("data-phase", "exploded");
    await expect(explode).toHaveAttribute("aria-pressed", "true");
    await expect(explode).toHaveText("Assemble");
    await explode.click();
    await expect(piece).toHaveAttribute("data-phase", "assembled");

    await page.getByTestId("assembly-replay").click();
    await expect(piece).toHaveAttribute("data-phase", "assembling");
  });

  test("a themed opening is recorded as not produced and nothing is loaded for it", async ({ page }) => {
    const media: string[] = [];
    page.on("request", (r) => /\.(mp4|webm|mov)(\?|$)/.test(r.url()) && media.push(r.url()));
    await page.goto("/product/desert-eye-love");
    await expect(page.getByTestId("piece-assembly")).toHaveAttribute("data-phase", "assembled", { timeout: 8000 });
    expect(media).toEqual([]);
  });
});

test.describe("Face Studio before a photo", () => {
  test("a sculpted head wears the piece, and secondary controls wait for a photo", async ({ page }) => {
    await page.goto("/face-studio?product=desert-eye-love");
    const head = page.getByTestId("studio-head");
    await expect(head).toBeVisible();
    await expect(head.getByTestId("placement-preview")).toHaveAttribute("data-placement", "anti-eyebrow");
    await expect(head.getByTestId("placement-piece")).toHaveCount(2);
    // Shading only: nothing on the head is a drawn line.
    expect(await head.locator("svg [stroke]").count()).toBe(0);

    for (const hidden of ["side-left", "add-piece", "scale", "undo", "look-empty"]) await expect(page.getByTestId(hidden)).toHaveCount(0);
    await expect(page.getByTestId("studio-form-nose")).toBeVisible();

    await page.getByTestId("studio-form-nose").click();
    await expect(head.getByTestId("placement-preview")).toHaveAttribute("data-placement", "nostril");
    await expect(head.getByTestId("placement-piece")).toHaveCount(1);
  });
});
