import { expect, test } from "@playwright/test";

// The homepage as a launch film: the piece turned by scroll with the headline, crafted in sand,
// material detail, the assembly, the forms, on you, the collection, a last frame. Frames are stills
// scrubbed by the page's own scroll. Nothing plays by itself, nothing is locked.

const hero = (page: import("@playwright/test").Page) => page.getByTestId("scrub-hero");

test.describe("the opening", () => {
  test("frames follow the scroll, the name gives way to the headline, and the page is never locked", async ({ page }) => {
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
    await expect.poll(() => section.getAttribute("data-ready"), { timeout: 15000 }).toBe("true");
    // The first fifth holds the beauty frame with the hero words; the turn takes the rest, one true 360.
    const start = await at(0.05);
    expect(start).toBe(0);
    const mid = await at(0.55);
    const late = await at(0.98);
    expect(mid).toBeGreaterThan(20);
    expect(late).toBeGreaterThanOrEqual(66);
    expect(await at(0.55)).toBeLessThan(late);
    // Words: the hero words at the start, "Engineered for the face." mid-turn, the number at the end. Never all at once.
    await at(0.05);
    await expect(page.getByTestId("cta-face")).toBeVisible();
    await expect(section.getByText("Engineered")).toBeHidden();
    await at(0.5);
    await expect(section.getByText("Engineered")).toBeVisible();
    await expect(page.getByTestId("cta-face")).toBeHidden();
    await at(0.9);
    await expect(section.getByText("01 / 04")).toBeVisible();
    // Past the opening the page goes on to the sand.
    await page.evaluate(([y]) => window.scrollTo(0, y), [box.y + box.height + 50]);
    await expect(page.getByTestId("story-section")).toBeInViewport();
    expect(errors).toEqual([]);
  });

  test("the frame set is fetched once, as stills, and no video is on the homepage before a press", async ({ page }) => {
    const frames: string[] = [];
    page.on("request", (r) => r.url().includes("/hero-orbit/desert-eye-love/f-") && frames.push(r.url()));
    await page.goto("/");
    await expect.poll(() => hero(page).getAttribute("data-ready"), { timeout: 15000 }).toBe("true");
    await page.waitForLoadState("networkidle");
    // The opening's 72 frames; later sections reuse two of them and the browser serves those from cache.
    expect(new Set(frames).size).toBe(72);
    const box = (await hero(page).boundingBox())!;
    await page.evaluate(([y]) => window.scrollTo(0, y), [box.y + box.height * 0.5]);
    await page.waitForTimeout(800);
    expect(new Set(frames).size).toBe(72);
    await expect(page.locator("video")).toHaveCount(0);
  });

  test("with reduced motion it is a plain still with the same words", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const section = hero(page);
    await expect(section).toHaveAttribute("data-mode", "still");
    await expect(section.locator("canvas")).toHaveCount(0);
    await expect(section.getByRole("heading", { level: 1 })).toHaveText("Jewelry for the face you chose.");
    await expect(page.getByTestId("cta-face")).toBeVisible();
    const pinned = await page.evaluate(() => [...document.querySelectorAll("main *")].filter((el) => getComputedStyle(el).position === "sticky" && el.getBoundingClientRect().height > window.innerHeight * 0.85).length);
    expect(pinned).toBe(0);
  });

  test("the keyboard scrolls it like any page", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard scrolling is a desktop matter");
    await page.goto("/");
    const section = hero(page);
    const start = Number(await section.getAttribute("data-frame"));
    // Focus the page on an empty part of the stage: its right edge, mid-height, clear of the bar and the words.
    const c = (await page.getByTestId("scrub-canvas").boundingBox())!;
    await page.mouse.click(c.x + c.width - 12, c.y + c.height * 0.6);
    // The first fifth of the section holds the beauty frame; a few pages down, the turn has begun.
    for (let i = 0; i < 5; i++) await page.keyboard.press("PageDown");
    await expect.poll(() => section.getAttribute("data-frame").then(Number), { timeout: 5000 }).toBeGreaterThan(start);
  });
});

test.describe("the sections", () => {
  test("crafted in sand: three words over the sand, and the companion lives there only", async ({ page }) => {
    await page.goto("/");
    const story = page.getByTestId("story-section");
    await expect(story.getByRole("heading")).toHaveText("Crafted in sand");
    for (const word of ["Sand.", "Solitude.", "Identity."]) await expect(story).toContainText(word);
    await expect(story.getByTestId("sand-layer")).toHaveCount(1);
    const words = (await story.innerText()).toLowerCase();
    for (const banned of ["luxury", "timeless", "exquisite", "elevate", "ruby"]) expect(words).not.toContain(banned);
    const mascots = page.getByTestId("mascot");
    if ((await mascots.count()) > 0) {
      await expect(mascots).toHaveCount(1);
      await expect(story.getByTestId("mascot")).toHaveCount(1);
    }
  });

  test("macro detail: full-width close views with four tiny callouts and no claims", async ({ page }) => {
    await page.goto("/");
    const detail = page.getByTestId("detail-section");
    await expect(detail.getByTestId("detail-crop")).toHaveCount(4);
    for (const word of ["Facet", "Openwork", "Polished edge", "Surface form"]) await expect(detail).toContainText(word);
    await expect(detail).toContainText("prototype render");
    const wide = (await detail.locator('[data-detail="facet"]').boundingBox())!;
    expect(wide.width).toBeGreaterThan(page.viewportSize()!.width * 0.9);
    const words = (await detail.innerText()).toLowerCase().split(/\s+/);
    for (const banned of ["ruby", "implant", "certified", "mm", "titanium"]) expect(words).not.toContain(banned);
  });

  test("assembly: the film as a campaign film, the whole width, idle until a press", async ({ page }) => {
    await page.goto("/");
    const assembly = page.getByTestId("assembly-section");
    await expect(assembly.getByTestId("product-film")).toHaveAttribute("data-state", "idle");
    await expect(assembly).toContainText("Assembled with intent");
    const frame = (await assembly.locator(".product-film-frame").boundingBox())!;
    expect(frame.width).toBeGreaterThan(page.viewportSize()!.width * 0.9);
    await expect(assembly.getByTestId("film-captions").locator("div")).toHaveCount(0);
  });

  test("the forms: one stage, the form changes in place and carries to the product page", async ({ page }) => {
    await page.goto("/");
    const forms = page.getByTestId("forms-section");
    await expect(forms).toHaveAttribute("data-form", "anti-eyebrow");
    await expect(forms.locator("img.forms-still")).toHaveCount(1);
    await expect(forms.getByTestId("piece-assembly")).toHaveCount(0);
    await page.locator("label", { has: page.getByTestId("home-form-nose") }).click();
    await expect(forms).toHaveAttribute("data-form", "nose");
    await expect(forms.getByTestId("piece-assembly")).toHaveAttribute("data-hardware", "stud");
    await expect(forms).toContainText("QAR 190");
    await expect(forms.getByTestId("forms-explore")).toHaveAttribute("href", "/product/desert-eye-love?form=nose");
    await forms.getByTestId("forms-explore").click();
    await expect(page.getByTestId("family")).toHaveAttribute("data-form", "nose");
  });

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
