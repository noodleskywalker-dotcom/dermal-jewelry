import { expect, test } from "@playwright/test";

// The homepage as a short film (the cinematic remake of 22 September 2026): the opening shot, the turn,
// the world and its companion, the push into the stone, the close views, the meaning, the assembly,
// the forms, on you, the collection, a last frame. Only two muted ambient loops play by themselves,
// the opening shot has a pause control, and nothing locks the page.

const hero = (page: import("@playwright/test").Page) => page.getByTestId("scrub-hero");

test.describe("the opening shot", () => {
  test("a muted ambient loop of the piece in low light, with a pause control and the headline", async ({ page, browserName }) => {
    // The test WebKit build on Windows has no video decoder, so it shows the poster and honestly offers Play.
    test.skip(browserName === "webkit", "no media decoder in the test WebKit build");
    await page.goto("/");
    const shot = page.getByTestId("cinema-hero");
    await expect(shot.getByRole("heading", { level: 1 })).toHaveText("Jewelry for the face you chose.");
    const video = shot.getByTestId("cinema-hero-video");
    expect(await video.evaluate((v: HTMLVideoElement) => [v.muted, v.loop, v.controls])).toEqual([true, true, false]);
    const pause = shot.getByTestId("cinema-hero-pause");
    await expect(pause).toHaveAttribute("aria-pressed", "false");
    await pause.click();
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    await expect(pause).toHaveText("Play");
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    const box = (await pause.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test("with reduced motion it is the still, with the same words and no pause control", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const shot = page.getByTestId("cinema-hero");
    await expect(shot.locator("video")).toHaveCount(0);
    await expect(shot.locator("img")).toHaveCount(1);
    await expect(shot.getByRole("heading", { level: 1 })).toHaveText("Jewelry for the face you chose.");
    await expect(shot.getByTestId("cinema-hero-pause")).toHaveCount(0);
    await expect(page.getByTestId("cta-face")).toBeVisible();
  });
});

test.describe("the turn", () => {
  test("frames follow the scroll, the words arrive at their moments, and the page is never locked", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    const section = hero(page);
    await expect(section).toHaveAttribute("data-mode", "scrub");
    const box = (await section.boundingBox())!;
    const h = page.viewportSize()!.height;
    const at = async (frac: number) => {
      await page.evaluate(([y]) => window.scrollTo(0, y), [box.y + (box.height - h) * frac]);
      await page.waitForTimeout(400);
      return Number(await section.getAttribute("data-frame"));
    };
    await expect.poll(() => section.getAttribute("data-ready"), { timeout: 20000 }).toBe("true");
    expect(await at(0.05)).toBe(0);
    const mid = await at(0.55);
    const late = await at(0.98);
    expect(mid).toBeGreaterThan(20);
    expect(late).toBeGreaterThanOrEqual(66);
    await at(0.05);
    await expect(section.getByText("Turn it in the light.")).toBeVisible();
    await expect(section.getByText("Engineered")).toBeHidden();
    await at(0.5);
    await expect(section.getByText("Engineered")).toBeVisible();
    await expect(section.getByText("Turn it in the light.")).toBeHidden();
    await at(0.9);
    await expect(section.getByText("01 / 04")).toBeVisible();
    await page.evaluate(([y]) => window.scrollTo(0, y), [box.y + box.height + 50]);
    // Past the turn the page hands over to the selection, which is where the launch ends.
    await expect(page.getByTestId("collection-section")).toBeInViewport();
    expect(errors).toEqual([]);
  });

  test("the turn is fetched once as stills, and the assembly film waits for a press", async ({ page }) => {
    const frames: string[] = [];
    page.on("request", (r) => r.url().includes("/media/cinema/orbit/f-") && frames.push(r.url()));
    await page.goto("/");
    await expect.poll(() => hero(page).getAttribute("data-ready"), { timeout: 20000 }).toBe("true");
    expect(new Set(frames).size).toBe(72);
    // Only the two ambient loops (the opening shot and the dunes) play by themselves; the product film
    // is idle. The mascot's own clip is left out: it is internal art and gives way to these anyway.
    const loops = await page.locator("video[autoplay]:not([data-testid='mascot-clip'])").evaluateAll((vs) => vs.map((v) => v.className.split(" ")[0]));
    expect(loops.sort()).toEqual(["cinema-hero-media"]);
  });

  test("with reduced motion the turn is a plain still and nothing is pinned", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(hero(page)).toHaveAttribute("data-mode", "still");
    await expect(hero(page).locator("canvas")).toHaveCount(0);
    const pinned = await page.evaluate(() => [...document.querySelectorAll("main *")].filter((el) => getComputedStyle(el).position === "sticky" && el.getBoundingClientRect().height > window.innerHeight * 0.85).length);
    expect(pinned).toBe(0);
  });

  test("the keyboard scrolls it like any page", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard scrolling is a desktop matter");
    await page.goto("/");
    const section = hero(page);
    await section.evaluate((el) => el.scrollIntoView());
    await page.waitForTimeout(300);
    const start = Number(await section.getAttribute("data-frame"));
    // Focus the page on an empty part of the stage: its right edge, low, clear of the bar and the words.
    await page.mouse.click(page.viewportSize()!.width - 12, page.viewportSize()!.height * 0.6);
    for (let i = 0; i < 5; i++) await page.keyboard.press("PageDown");
    await expect.poll(() => section.getAttribute("data-frame").then(Number), { timeout: 5000 }).toBeGreaterThan(start);
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
    await expect(final.getByRole("heading")).toContainText("Your face.");
    await expect(final.getByTestId("final-studio")).toHaveAttribute("href", "/face-studio");
    await expect(final.getByTestId("final-shop")).toHaveAttribute("href", "/collections");
  });
});
