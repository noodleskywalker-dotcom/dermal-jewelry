import { expect, test, type Locator, type Page } from "@playwright/test";
import { existsSync } from "node:fs";
import path from "node:path";
import { EDITORIAL_PORTRAIT_AVAILABLE } from "./helpers";

const families = ["desert-eye-love", "horus-trace", "blade-trace", "crossline", "ankh-trace", "japanese-angel", "ankh-eye"];
const concepts = new Set(["japanese-angel", "ankh-eye"]);
const editorialDetailAvailable = existsSync(path.join(process.cwd(), "assets/editorial-preview/gaara-detail.webp"));
const ankhReferenceAvailable = existsSync(path.join(process.cwd(), "assets/editorial-preview/ankh-reference.webp"));
const crosslineReferenceAvailable = existsSync(path.join(process.cwd(), "assets/editorial-preview/crossline-reference.webp"));

async function loadPictures(region: Locator) {
  for (const picture of await region.locator("img").all()) {
    await picture.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect.poll(() => picture.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), { timeout: 10_000 }).toBe(true);
  }
}

async function noSidewaysScroll(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

test.describe("the design stories", () => {
  test("all seven chapters change at the visitor's pace and lead to their own story", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/");
    const stories = page.getByTestId("home-stories");
    const tabs = stories.getByRole("tab");
    const panel = stories.getByRole("tabpanel");
    await expect(tabs).toHaveCount(7);
    await expect(panel).toHaveCount(1);
    const headings: string[] = [];
    for (const [index, slug] of families.entries()) {
      await tabs.nth(index).click();
      await expect(tabs.nth(index)).toHaveAttribute("aria-selected", "true");
      await expect(stories.getByRole("tab", { selected: true })).toHaveCount(1);
      await expect(panel).toHaveAttribute("data-family", slug);
      await expect(panel).toHaveAttribute("aria-labelledby", `home-story-tab-${slug}`);
      const portrait = (slug === "desert-eye-love" && EDITORIAL_PORTRAIT_AVAILABLE) || (slug === "ankh-trace" && ankhReferenceAvailable) || (slug === "crossline" && crosslineReferenceAvailable);
      await expect(panel).toHaveAttribute("data-mode", portrait ? "portrait" : "product");
      await expect(panel.getByRole("list", { name: "The form and the expression" }).getByRole("listitem")).toHaveCount(2);
      await expect(panel.getByTestId("home-story-link")).toHaveAttribute("href", `/product/${slug}#design-story`);
      if (concepts.has(slug)) await expect(panel).toContainText("Concept study");
      headings.push(await panel.getByRole("heading", { level: 3 }).innerText());
      await loadPictures(panel);
      await noSidewaysScroll(page);
    }
    expect(new Set(headings).size).toBe(7);
    await panel.getByTestId("home-story-link").click();
    await expect(page).toHaveURL(/\/product\/ankh-eye#design-story$/);
    await expect(page.getByTestId("product-design-story")).toBeInViewport();
  });

  test("chapter tabs work from the keyboard and keep one focus stop", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard navigation is a desktop interaction");
    await page.goto("/");
    const stories = page.getByTestId("home-stories");
    const tabs = stories.getByRole("tab");
    await tabs.first().focus();
    for (const [key, index] of [["ArrowLeft", 6], ["ArrowRight", 0], ["End", 6], ["Home", 0], ["ArrowRight", 1]] as const) {
      await page.keyboard.press(key);
      await expect(tabs.nth(index)).toBeFocused();
      await expect(tabs.nth(index)).toHaveAttribute("aria-selected", "true");
      await expect(stories.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
      await expect(stories.getByTestId("home-story-panel")).toHaveAttribute("data-family", families[index]);
    }
    await page.keyboard.press("Tab");
    await expect(stories.getByTestId("home-story-panel")).toBeFocused();
  });

  test("reduced motion retains every story without animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const stories = page.getByTestId("home-stories");
    await stories.getByRole("tab").nth(2).click();
    const panel = stories.getByTestId("home-story-panel");
    await expect(panel).toHaveAttribute("data-family", "blade-trace");
    expect(await panel.evaluate((el) => el.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length)).toBe(0);
    await expect(panel.getByTestId("home-story-link")).toBeVisible();
  });

  for (const slug of [...families, "crimson-orbit", "sand-vortex", "void-stud"]) {
    test(`${slug} has a complete story and a truthful next step`, async ({ page }) => {
      await page.goto(`/product/${slug}`);
      await page.getByRole("link", { name: "Enter the story" }).click();
      const story = page.getByTestId("product-design-story");
      await expect(story).toBeInViewport();
      await expect(story).toHaveAttribute("data-story-family", slug);
      await expect(story.getByRole("heading", { level: 2 })).toHaveCount(1);
      await expect(story.getByRole("heading", { level: 3 })).toHaveCount(2);
      await expect(story).toContainText("01 The atmosphere");
      await expect(story).toContainText("02 The signature");
      await expect(story.getByRole("link", { name: "Another story" })).toHaveAttribute("href", "/collections");
      await loadPictures(story);
      if (concepts.has(slug)) {
        await expect(story).toContainText("03 The next chapter");
        await expect(story.getByRole("link", { name: "Begin a personal design" })).toHaveAttribute("href", "/commission");
        await expect(story.getByRole("link", { name: "See it on you" })).toHaveCount(0);
      } else {
        await expect(story).toContainText("03 Your expression");
        const form = await page.getByTestId("family").getAttribute("data-form");
        await expect(story.getByRole("link", { name: "See it on you" })).toHaveAttribute("href", `/face-studio?product=${slug}&form=${form}`);
      }
      if (slug === "desert-eye-love") {
        await expect(story.getByTestId("product-story-editorial")).toHaveCount(editorialDetailAvailable ? 1 : 0);
        if (editorialDetailAvailable) {
          await expect(story.getByTestId("product-story-editorial")).toHaveAttribute("src", "/api/editorial-preview/gaara-detail");
          await expect(story).toContainText("AI editorial concept / Anti-eyebrow pair");
        }
      }
      if (slug === "ankh-trace") {
        await expect(story.getByTestId("product-story-reference")).toHaveCount(ankhReferenceAvailable ? 1 : 0);
        if (ankhReferenceAvailable) {
          await expect(story.getByTestId("product-story-reference")).toHaveAttribute("src", "/api/editorial-preview/ankh-reference");
          await expect(story).toContainText("Original design reference / ANKH TRACE");
        }
      }
      if (slug === "crossline") {
        const reference = story.getByTestId("product-story-reference");
        await expect(reference).toHaveCount(crosslineReferenceAvailable ? 1 : 0);
        if (crosslineReferenceAvailable) {
          await expect(reference).toHaveAttribute("src", "/api/editorial-preview/crossline-reference");
          await expect(story).toContainText("Original placement reference / CROSSLINE");
          expect((await reference.boundingBox())!.width).toBeLessThanOrEqual(179);
        }
      }
      await noSidewaysScroll(page);
    });
  }

  test("the story keeps the chosen single-piece form in its detail and next step", async ({ page }) => {
    await page.goto("/product/desert-eye-love?form=nose#design-story");
    const story = page.getByTestId("product-design-story");
    const detail = story.locator(".pdp-story-signature figure");
    await expect(detail.locator("img")).toHaveCount(1);
    await expect(detail.locator("img")).toHaveAttribute("src", /desert-eye-gem%2Fdetail\.webp|desert-eye-gem\/detail\.webp/);
    await expect(detail.getByTestId("piece-asset")).toHaveCount(0);
    await loadPictures(detail);
    await expect(story.getByRole("link", { name: "See it on you" })).toHaveAttribute("href", "/face-studio?product=desert-eye-love&form=nose");
    await story.getByRole("link", { name: "See it on you" }).click();
    await expect(page).toHaveURL(/\/face-studio\?product=desert-eye-love&form=nose$/);
  });
});

test.describe("stories at 320 px", () => {
  test.use({ viewport: { width: 320, height: 720 } });
  test("the campaign, all chapter choices and long or tall pieces fit", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/");
    await noSidewaysScroll(page);
    const stories = page.getByTestId("home-stories");
    for (const tab of await stories.getByRole("tab").all()) {
      await tab.click();
      await noSidewaysScroll(page);
    }
    for (const slug of ["blade-trace", "ankh-trace", "desert-eye-love"]) {
      await page.goto(`/product/${slug}#design-story`);
      await loadPictures(page.getByTestId("product-design-story"));
      await noSidewaysScroll(page);
    }
  });
});
