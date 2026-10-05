import { expect, test, type Page } from "@playwright/test";
import { openStudioWithPhoto } from "./helpers";

// The HYBRID visual system: Atelier Paper everywhere, sand and chrome for DESERT EYE alone.

const PAPER = "rgb(251, 250, 247)";
const current = (page: Page) => page.locator('[data-testid="selection-slide"][data-current="true"]');

test.describe("one light system on every page", () => {
  for (const route of ["/", "/collections", "/product/desert-eye-love", "/face-studio", "/shop", "/cart", "/about"]) {
    test(`${route} is paper with a light navigation bar`, async ({ page }) => {
      await page.goto(route);
      expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(PAPER);
      const header = page.locator("header[data-tone]").first();
      await expect(header).toHaveAttribute("data-tone", route === "/" ? "cinematic" : "light");
      // Near-black words on the bar, never ivory on a dark bar.
      // The homepage opens on the dark cinema hero with ivory words; past it, the bar is the paper bar.
      if (route === "/") {
        await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
        await expect(header).toHaveAttribute("data-scrolled", "true");
      }
      // The colour eases over a short transition, so it is polled rather than read once.
      const home = header.getByRole("link", { name: "DERMAL home" });
      await expect.poll(() => home.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(12, 12, 13)");
    });
  }

  test("the homepage opens dark, with ivory words on the bar over the hero", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header[data-tone]").first();
    await expect(header).toHaveAttribute("data-scrolled", "false");
    const colour = await header.getByRole("link", { name: "DERMAL home" }).evaluate((el) => getComputedStyle(el).color);
    expect(colour).toBe("rgb(251, 250, 247)");
  });

  test("the shop preserves each photographic scene, with paper around it and unboxed filters", async ({ page }) => {
    await page.goto("/shop");
    const cards = page.getByTestId("product-card");
    await expect(cards).toHaveCount(10);
    for (const card of await cards.all()) {
      const painted = await card.evaluate((li) =>
        [li, ...li.querySelectorAll("*")].filter((el) => {
          if (el.closest(".product-photograph")) return false;
          const s = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          // Only the photographic frame has its own surface; the card around it stays unpainted.
          return box.width > 120 && box.height > 120 && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor);
        }).length,
      );
      expect(painted).toBe(0);
      await expect(card.locator(".product-photograph")).toHaveCount(1);
    }
    const filter = page.getByRole("navigation", { name: "Filter by placement" }).getByRole("link").first();
    expect(await filter.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe("0px");
  });
});

test.describe("photographic scenes retain their own ground", () => {
  test("photographic browsing and product stages have no synthetic sand overlay", async ({ page }) => {
    await page.goto("/collections");
    const pieces = page.getByTestId("selection-rail");
    await expect(pieces.getByTestId("sand-layer")).toHaveCount(0);
    await expect(current(page)).toHaveAttribute("data-presentation", "photographic");

    // The next family keeps the same photographic treatment.
    await page.getByTestId("selection-next").click();
    await expect(current(page)).toHaveAttribute("data-product", "horus-trace");
    await expect(current(page)).toHaveAttribute("data-presentation", "photographic");

    // A form-specific product photo has its own ground too.
    await page.goto("/product/desert-eye-love?form=micro-dermal");
    await expect(page.getByTestId("render-stage")).toHaveAttribute("data-presentation", "photographic");
    await expect(page.getByTestId("sand-layer")).toHaveCount(0);

    for (const route of ["/shop", "/product/crimson-orbit", "/face-studio", "/cart"]) {
      await page.goto(route);
      await expect(page.getByTestId("sand-layer")).toHaveCount(0);
    }
  });

  test("KIRI is one drawn chrome concept form and words: no product image, no price, no sand, no number", async ({ page }) => {
    await page.goto("/collections");
    const kiri = page.getByTestId("selection-concept");
    await expect(kiri).toHaveCount(1);
    await expect(kiri.getByRole("heading")).toHaveText("KIRI");
    await expect(kiri.locator("img")).toHaveCount(0);
    await expect(kiri.locator("svg.selection-blade")).toHaveCount(1);
    await expect(kiri.getByTestId("sand-layer")).toHaveCount(0);
    await expect(kiri).not.toContainText("QAR");
    await expect(kiri).toContainText("Concept");
    // Ten families are browsable; the concept is named, never counted.
    await expect(page.getByTestId("selection-index")).toHaveText(/Index 01 \/ 10/);
    await page.goto("/collections?family=ankh-eye");
    // The rail slides to the last family first; only then does Next reach the concept.
    await expect(page.getByTestId("selection-index")).toHaveText(/Index 10 \/ 10/);
    // The rail is still easing into place, so the step waits until Next is ready to take the press.
    const next = page.getByTestId("selection-next");
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page.getByTestId("selection-index")).toHaveText(/Concept · KIRI/, { timeout: 10_000 });
  });

  test("the neighbouring photographic frame shows at the edge, softer, and stays above its words", async ({ page }) => {
    await page.goto("/collections");
    const width = page.viewportSize()!.width;
    const next = page.locator('[data-testid="selection-slide"][data-side="after"]').first().locator(".selection-object");
    const box = (await next.boundingBox())!;
    // At least 8% of the window shows the next piece's box, and it is visibly there.
    expect(width - box.x).toBeGreaterThan(width * 0.08);
    expect(await next.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.3);

    const picture = (await current(page).locator(".selection-object").boundingBox())!;
    const title = (await current(page).getByRole("heading").boundingBox())!;
    expect(picture.y + picture.height).toBeLessThanOrEqual(title.y + 1);
  });
});

test.describe("the selection is dragged with a mouse", () => {
  test("a drag moves to the next family and does not open the product", async ({ page, isMobile }) => {
    test.skip(isMobile, "Touch swipes the rail natively.");
    await page.goto("/collections");
    const rail = page.getByTestId("selection-rail");
    await rail.scrollIntoViewIfNeeded();
    const box = (await rail.boundingBox())!;
    const y = box.y + box.height * 0.3;
    await page.mouse.move(box.x + box.width * 0.62, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.4, y, { steps: 6 });
    await page.mouse.move(box.x + box.width * 0.12, y, { steps: 6 });
    await page.mouse.up();
    await expect(current(page)).toHaveAttribute("data-product", "horus-trace");
    await expect(page).toHaveURL(/\/collections$/);
  });
});

test.describe("photographs and the separate hardware study", () => {
  test("the explicit HORUS hardware study still opens out, closes and replays", async ({ page }) => {
    // Hardware is a separate, labelled concept view; it never replaces the opening photograph.
    await page.goto("/product/horus-trace");
    await expect(page.getByTestId("render-stage")).toHaveAttribute("data-presentation", "photographic");
    await page.getByRole("tab", { name: "Hardware" }).click();
    const piece = page.getByTestId("piece-assembly");
    await expect(piece).toHaveAttribute("data-phase", "assembling");
    await expect(piece).toHaveAttribute("data-phase", "assembled", { timeout: 8000 });

    await expect(piece).toHaveAttribute("data-hardware", "integrated");
    await expect(piece).toContainText("Prototype specification · final production details pending");
    // The integrated study does not invent an additional post or anchor below the design.
    await expect(piece.locator("[data-post]")).toHaveCount(0);
    const stage = (await piece.locator(".assembly").boundingBox())!;
    expect(stage.width).toBeGreaterThan(0);
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

  test("a single-form photograph opens without a synthetic assembly or unsolicited film", async ({ page }) => {
    const media: string[] = [];
    page.on("request", (r) => /\.(mp4|webm|mov)(\?|$)/.test(r.url()) && media.push(r.url()));
    await page.goto("/product/desert-eye-love?form=micro-dermal");
    await expect(page.getByTestId("render-stage")).toHaveAttribute("data-presentation", "photographic");
    await expect(page.getByTestId("render-stage-image")).toHaveAttribute("src", "/products/photographic/desert-eye-symbol/hero.webp");
    await expect(page.getByTestId("piece-assembly")).toHaveCount(0);
    expect(media).toEqual([]);
  });
});

test.describe("homepage: the piece is the hero", () => {
  test("the opening is the piece filling the screen, with no floating teaser pieces, and the bar is transparent until scrolled", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("teaser-piece")).toHaveCount(0);
    const shot = page.getByTestId("cinema-hero");
    await expect(shot.locator("img")).toHaveCount(1);
    await expect(shot.locator("video")).toHaveCount(0);
    await expect(page.getByTestId("scrub-canvas")).toHaveCount(0);
    const header = page.locator("header[data-tone]").first();
    await expect(header).toHaveAttribute("data-scrolled", "false");
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(header).toHaveAttribute("data-scrolled", "true");
  });
});

test.describe("Face Studio with a photo", () => {
  test("the tools are words on paper under the picture, inside the page, and every piece name is whole", async ({ page }) => {
    await openStudioWithPhoto(page, "?product=desert-eye-love");
    const width = page.viewportSize()!.width;
    const toolbar = page.getByRole("toolbar", { name: "Studio actions" });
    const bar = (await toolbar.boundingBox())!;
    const stage = (await page.getByTestId("studio-stage").boundingBox())!;
    expect(bar.x).toBeGreaterThanOrEqual(0);
    expect(bar.x + bar.width).toBeLessThanOrEqual(width + 1);
    expect(bar.y).toBeGreaterThanOrEqual(stage.y + stage.height - 1);
    for (const name of ["Show before", "Clear photo"]) await expect(toolbar.getByRole("button", { name })).toBeInViewport();
    // No pill: the toolbar paints nothing behind the words.
    expect(await toolbar.evaluate((el) => getComputedStyle(el).backgroundColor)).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);

    for (const title of await page.locator('[data-testid="studio-product"] .font-display').all()) {
      expect(await title.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
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
