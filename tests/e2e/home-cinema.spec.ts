import { expect, test } from "@playwright/test";
import { EDITORIAL_PORTRAIT_AVAILABLE, OPENING_HEADLINE } from "./helpers";

// Every visible DESERT scene follows the current separate-top design. The retired orbit and
// connected-bar movie are never fetched, and browsing uses ordinary document scrolling.
const hero = (page: import("@playwright/test").Page) => page.getByTestId("scrub-hero");

test.describe("the opening story", () => {
  test("the opening shows the prepared portrait or the current product photograph", async ({ page }) => {
    await page.goto("/");
    const shot = page.getByTestId("cinema-hero");
    await expect(shot.getByRole("heading", { level: 1 })).toHaveText(OPENING_HEADLINE);
    await expect(shot).toHaveAttribute("data-presentation", EDITORIAL_PORTRAIT_AVAILABLE ? "portrait" : "product");
    const image = shot.locator("img");
    await expect(image).toHaveAttribute("src", EDITORIAL_PORTRAIT_AVAILABLE ? "/api/editorial-preview/gaara-portrait" : "/products/photographic/desert-eye-love/hero.webp");
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    await expect(shot.locator("video")).toHaveCount(0);
    await expect(shot.getByTestId("cinema-hero-pause")).toHaveCount(0);
  });

  test("the second scene shows the current pair and a story link without a scroll illusion", async ({ page }) => {
    await page.goto("/");
    const section = hero(page);
    await expect(section).toHaveAttribute("data-mode", "still");
    await expect(section.locator("canvas, video")).toHaveCount(0);
    await expect(section.getByTestId("launch-product-image")).toHaveAttribute("src", /desert-eye-love%2Fhero\.webp|desert-eye-love\/hero\.webp/);
    await expect(section).toContainText("Two separate tops");
    await expect(section.getByRole("link", { name: /Explore DESERT EYE/ })).toHaveAttribute("href", "/product/desert-eye-love#design-story");
    await section.getByRole("link").click();
    await expect(page).toHaveURL(/\/product\/desert-eye-love#design-story$/);
  });

  test("neither opening scene fetches retired connected-bar imagery", async ({ page }) => {
    const retired: string[] = [];
    page.on("request", (r) => /\/media\/(cinema|hero-orbit\/desert-eye-love|product-animation\/desert-eye-love)\//.test(r.url()) && retired.push(r.url()));
    await page.goto("/");
    await hero(page).scrollIntoViewIfNeeded();
    await page.getByTestId("collection-section").scrollIntoViewIfNeeded();
    expect(retired).toEqual([]);
    await expect(page.locator("video[autoplay]:not([data-testid='mascot-clip'])")).toHaveCount(0);
  });

  test("reduced motion keeps the same current design with nothing pinned", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(hero(page)).toHaveAttribute("data-mode", "still");
    await expect(page.getByTestId("cinema-hero").locator("video")).toHaveCount(0);
    const pinned = await page.evaluate(() => [...document.querySelectorAll("main *")].filter((el) => getComputedStyle(el).position === "sticky" && el.getBoundingClientRect().height > window.innerHeight * 0.85).length);
    expect(pinned).toBe(0);
    await expect(page.getByTestId("cta-piece")).toBeVisible();
  });

  test("the keyboard scrolls directly from the still into the collection", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard scrolling is a desktop matter");
    await page.goto("/");
    await hero(page).scrollIntoViewIfNeeded();
    const start = await page.evaluate(() => window.scrollY);
    await page.mouse.click(page.viewportSize()!.width - 12, page.viewportSize()!.height * 0.6);
    await page.keyboard.press("PageDown");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(start);
  });
});

test.describe("the sections", () => {
  test("see it on you: a close crop around the placement, the piece on it, and one way in", async ({ page }) => {
    await page.goto("/");
    const onyou = page.getByTestId("onyou-section");
    await expect(onyou.getByTestId("placement-preview")).toHaveAttribute("data-placement", "anti-eyebrow");
    await expect(onyou.getByTestId("placement-piece")).toHaveCount(2);
    // Cropped: the head's figure is larger than the frame that shows it.
    const crop = (await onyou.getByTestId("onyou-crop").boundingBox())!;
    const head = (await onyou.getByTestId("placement-preview").boundingBox())!;
    expect(head.height).toBeGreaterThan(crop.height * 1.5);
    await expect(onyou).toContainText("not a person");
    await expect(onyou.getByTestId("onyou-try")).toHaveAttribute("href", "/face-studio?product=desert-eye-love");
  });

  test("the last frame: three lines and two ways in", async ({ page }) => {
    await page.goto("/");
    const final = page.getByTestId("final-section");
    await expect(final.getByRole("heading")).toContainText("A small piece.");
    await expect(final.getByTestId("final-studio")).toHaveAttribute("href", "/face-studio");
    await expect(final.getByTestId("final-shop")).toHaveAttribute("href", "/shop");
  });
});
