import { expect, test } from "@playwright/test";

// The homepage after the landing: one scrubbed moment, three words of story, the piece assembled.
// Frames are stills scrubbed by the page's own scroll. Nothing plays by itself, nothing is locked.

const scrub = (page: import("@playwright/test").Page) => page.getByTestId("scrub-hero");

test.describe("scrub hero", () => {
  test("frames follow the scroll, the words arrive in order, and the page is never locked", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    const section = scrub(page);
    await expect(section).toHaveAttribute("data-mode", "scrub");
    const box = (await section.boundingBox())!;
    const h = page.viewportSize()!.height;
    const at = async (frac: number) => {
      await page.evaluate(([y]) => window.scrollTo(0, y), [box.y + (box.height - h) * frac]);
      await page.waitForTimeout(400);
      return Number(await section.getAttribute("data-frame"));
    };
    await expect.poll(() => section.getAttribute("data-ready"), { timeout: 15000 }).toBe("true");
    const early = await at(0.05);
    const mid = await at(0.5);
    const late = await at(0.95);
    expect(early).toBeLessThan(mid);
    expect(mid).toBeLessThan(late);
    expect(late).toBeGreaterThanOrEqual(45);
    // Scrolling back turns it back.
    expect(await at(0.5)).toBeLessThan(late);
    // Words: the name early, the second line only past the middle.
    await at(0.3);
    const line2 = section.locator(".scrub-line-2");
    expect(await line2.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(0.1);
    await at(0.9);
    expect(await line2.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.9);
    await expect(section.getByRole("heading")).toHaveText("DESERT EYE — LOVE");
    await expect(section.getByRole("link", { name: /View the piece/ })).toHaveAttribute("href", "/product/desert-eye-love");
    // Past the section the page goes on to the story.
    await page.evaluate(([y]) => window.scrollTo(0, y), [box.y + box.height + 50]);
    await expect(page.getByTestId("story-section")).toBeInViewport();
    expect(errors).toEqual([]);
  });

  test("the frame set is fetched once, as stills, and no video is on the homepage", async ({ page }) => {
    const frames: string[] = [];
    page.on("request", (r) => r.url().includes("/scrub/f-") && frames.push(r.url()));
    await page.goto("/");
    await expect.poll(() => scrub(page).getAttribute("data-ready"), { timeout: 15000 }).toBe("true");
    await page.waitForLoadState("networkidle");
    expect(new Set(frames).size).toBe(48);
    expect(frames.length).toBe(48);
    // Scrubbing fetches nothing more.
    const box = (await scrub(page).boundingBox())!;
    await page.evaluate(([y]) => window.scrollTo(0, y), [box.y + box.height * 0.5]);
    await page.waitForTimeout(800);
    expect(frames.length).toBe(48);
    await expect(page.locator("video")).toHaveCount(0);
  });

  test("with reduced motion it is a plain still with the same words", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const section = scrub(page);
    await expect(section).toHaveAttribute("data-mode", "still");
    await expect(section.locator("canvas")).toHaveCount(0);
    await expect(section.getByRole("heading")).toHaveText("DESERT EYE — LOVE");
    await expect(section.getByText("Crafted for the face.")).toBeVisible();
    const pinned = await page.evaluate(() => [...document.querySelectorAll("main *")].filter((el) => getComputedStyle(el).position === "sticky").length);
    expect(pinned).toBe(0);
  });

  test("the keyboard scrolls it like any page", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard scrolling is a desktop matter");
    await page.goto("/");
    const section = scrub(page);
    const box = (await section.boundingBox())!;
    await page.evaluate(([y]) => window.scrollTo(0, y), [box.y]);
    await page.waitForTimeout(300);
    const start = Number(await section.getAttribute("data-frame"));
    await page.getByTestId("scrub-canvas").click({ position: { x: 10, y: 10 } });
    await page.keyboard.press("PageDown");
    await page.keyboard.press("PageDown");
    await expect.poll(() => section.getAttribute("data-frame").then(Number), { timeout: 5000 }).toBeGreaterThan(start);
  });
});

test.describe("story and assembly", () => {
  test("three words, one still with sand, and the film with its material words", async ({ page }) => {
    await page.goto("/");
    const story = page.getByTestId("story-section");
    await expect(story.getByRole("heading")).toHaveText("DESERT EYE");
    await expect(story).toContainText("Sand.");
    await expect(story).toContainText("Solitude.");
    await expect(story).toContainText("Identity.");
    await expect(story.getByTestId("sand-layer")).toHaveCount(1);
    const words = (await story.innerText()).toLowerCase();
    for (const banned of ["luxury", "timeless", "exquisite", "elevate", "ruby"]) expect(words).not.toContain(banned);

    const assembly = page.getByTestId("assembly-section");
    await expect(assembly.getByTestId("product-film")).toHaveAttribute("data-state", "idle");
    await expect(assembly).toContainText("Titanium");
    await expect(assembly).toContainText("Proposed");
    await expect(assembly).toContainText("Material not yet confirmed");
    await expect(assembly).toContainText("Polished finish");
    await expect(assembly).toContainText("Concept hardware");
    await expect(assembly.getByRole("link", { name: /View the piece/ })).toHaveAttribute("href", "/product/desert-eye-love?form=anti-eyebrow");
  });
});
