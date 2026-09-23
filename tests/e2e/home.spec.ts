import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("opens on the piece alone, then the headline and two ways in, and scrolls like a normal page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jewelry for the face you chose.");
    // Paper, not ink, and the navigation matches it.
    const paper = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(paper).toBe("rgb(251, 250, 247)");
    await expect(page.locator("header[data-tone]")).toHaveAttribute("data-tone", "light");

    // The first screen is the piece in low light, full-bleed, with the name, the headline and the two ways in.
    const viewport = page.viewportSize()!;
    const hero = page.getByTestId("cinema-hero");
    const shot = (await hero.boundingBox())!;
    expect(shot.height).toBeGreaterThanOrEqual(viewport.height * 0.95);
    await expect(hero.getByText("DESERT EYE — LOVE")).toBeVisible();
    for (const id of ["cta-face", "cta-selection"]) {
      await expect(page.getByTestId(id)).toBeInViewport();
      const b = (await page.getByTestId(id).boundingBox())!;
      expect(b.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.getByTestId("cta-face")).toHaveAttribute("href", "/face-studio");
    await expect(page.getByTestId("cta-selection")).toHaveAttribute("href", "/collections");
    // No button rectangles: the ways in are text links.
    expect(await page.getByTestId("cta-face").evaluate((el) => getComputedStyle(el).backgroundColor)).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);

    // The pinned moments of the cinematic remake (22 September 2026): the turn, the dunes, the companion on
    // a wide screen, and the push into the stone. Each is a sticky stage in normal scroll; nothing hijacks the wheel.
    await page.evaluate(() => window.scrollTo(0, 0));
    const pinned = await page.evaluate(
      () =>
        [...document.querySelectorAll("main *")].filter((el) => {
          const s = getComputedStyle(el);
          return (s.position === "sticky" || s.position === "fixed") && el.getBoundingClientRect().height >= window.innerHeight * 0.85;
        }).map((el) => el.className.split(" ")[0]),
    );
    const wide = viewport.width >= 768;
    expect(pinned).toEqual(wide ? ["launch-stage", "world-frame", "companion-frame", "macro-stage"] : ["launch-stage", "world-frame", "macro-stage"]);
    await page.mouse.move(200, 300);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(400);
    expect(errors).toEqual([]);
  });

  test("the two actions lead to Face Studio and to the selection", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("cta-face").click();
    await expect(page).toHaveURL(/\/face-studio$/);
    await page.goto("/");
    await page.getByTestId("cta-selection").click();
    await expect(page).toHaveURL(/\/collections$/);
    await expect(page.getByTestId("selection-slide")).toHaveCount(8);
  });

  test("the collection browser on the homepage holds every family, originals beside the anime-inspired one", async ({ page }) => {
    await page.goto("/");
    const section = page.getByTestId("collection-section");
    // The ways in: the worlds (inspired, original, limited) beside the audiences and the full collection.
    await expect(section.getByTestId("browse-entry")).toHaveCount(7);
    await expect(section.locator('[data-entry="kiri"]')).toContainText("Original");
    await expect(section.locator('[data-entry="desert-eye"]')).toContainText("Inspired");
    await expect(section.getByTestId("product-card")).toHaveCount(0);
  });
});

test.describe("homepage mascot (internal concept art, development server only)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    test.skip((await page.getByTestId("mascot").count()) === 0, "internal mascot art is not on this machine");
    // Wait until the page is interactive: his pictures are in, and his first idle beat has been scheduled.
    await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('[data-testid="mascot"] img')].every((i) => i.complete && i.naturalWidth > 0));
    // He steps aside over the dark opening shot, so the page is taken past it first.
    await page.getByTestId("forms-section").evaluate((el) => el.scrollIntoView());
    await expect(page.getByTestId("global-mascot")).toHaveAttribute("data-hidden", "false");
    await page.waitForTimeout(400);
  });

  test("he idles quietly, and nothing happens by itself", async ({ page }) => {
    const mascot = page.getByTestId("mascot");
    await expect(mascot).toHaveAttribute("data-pose", "idle");
    await expect(mascot.locator("img")).toHaveCount(5);
    // A blink lasts a sixth of a second, so poses are recorded inside the page rather than polled for.
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="mascot"]')!;
      const seen: string[] = [];
      (window as unknown as { __poses: string[] }).__poses = seen;
      new MutationObserver(() => seen.push(el.getAttribute("data-pose")!)).observe(el, { attributes: true, attributeFilter: ["data-pose"] });
    });
    // Within a few seconds he does something small (a blink, a page, a yawn) and returns to reading.
    // Which one comes first depends on timing, and a busy machine delays timers, so this waits rather than sleeps.
    const seen = () => page.evaluate(() => (window as unknown as { __poses: string[] }).__poses);
    await expect.poll(async () => (await seen()).some((p) => p === "blink" || p === "page" || p === "yawn"), { timeout: 15_000 }).toBe(true);
    await expect(mascot).toHaveAttribute("data-pose", "idle", { timeout: 4000 });
    // He never looks up or starts anything by himself.
    expect(await seen()).not.toContain("look");
    await expect(page.getByTestId("sand-transition")).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
    // Exactly one picture is showing at any time.
    await expect.poll(() => mascot.locator("img").evaluateAll((imgs) => imgs.filter((i) => getComputedStyle(i).opacity === "1").length)).toBe(1);
  });

  test("pressing him makes him look up, then sand from his gourd covers the page and the selection opens under it", async ({ page }) => {
    test.setTimeout(45_000);
    const mascot = page.getByTestId("mascot");
    await mascot.click();
    await expect(mascot).toHaveAttribute("data-pose", "look");
    const sand = page.getByTestId("sand-transition");
    await expect(sand).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("sand-skip")).toBeVisible();

    // While the sand is still a ribbon, it enters at the opening of the mini gourd.
    const handle = await page.waitForFunction(
      () => {
        const fx = document.querySelector<HTMLCanvasElement>('[data-testid="story-effect"]');
        const at = Number(fx?.dataset.time ?? 0);
        const img = document.querySelector<HTMLImageElement>('[data-testid="mascot"] img');
        if (!fx || !img || at < 0.1 || at > 2.2) return null;
        const box = img.getBoundingClientRect();
        const m = new DOMMatrixReadOnly(getComputedStyle(fx).transform);
        return {
          gourd: { x: box.left + 0.668 * box.width, y: box.top + 0.355 * box.height },
          entry: { x: m.e + 0.012 * fx.width * m.a, y: m.f + 0.74 * fx.height * m.d },
        };
      },
      null,
      { timeout: 10_000, polling: "raf" },
    );
    const measured = (await handle.jsonValue())!;
    expect(Math.abs(measured.entry.x - measured.gourd.x)).toBeLessThan(3);
    expect(Math.abs(measured.entry.y - measured.gourd.y)).toBeLessThan(3);

    // The page only changes once the sand covers it.
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("story-effect")).toHaveAttribute("data-covered", "true", { timeout: 10_000 });
    // A development server may still be compiling the next route, so the address is given time.
    await expect(page).toHaveURL(/\/collections\?family=desert-eye-love$/, { timeout: 15_000 });
    await expect(sand).toHaveCount(0, { timeout: 8000 });
    await expect(page.locator('[data-testid="selection-slide"][data-current="true"]')).toHaveAttribute("data-product", "desert-eye-love");
  });

  test("Skip opens the selection at once", async ({ page }) => {
    await page.getByTestId("mascot").click();
    // On a machine too busy to load the clip in time, the link simply opens, which is also correct.
    const skip = page.getByTestId("sand-skip");
    await Promise.race([skip.waitFor({ timeout: 12_000 }), page.waitForURL(/\/collections\?family=desert-eye-love$/, { timeout: 12_000 })]).catch(() => {});
    if (await skip.isVisible()) await skip.click();
    await expect(page).toHaveURL(/\/collections\?family=desert-eye-love$/);
    await expect(page.getByTestId("sand-transition")).toHaveCount(0);
  });

  test("with reduced motion he holds still and the press is simply a link", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByTestId("forms-section").evaluate((el) => el.scrollIntoView());
    const mascot = page.getByTestId("mascot");
    await page.waitForTimeout(2500);
    await expect(mascot).toHaveAttribute("data-pose", "idle");
    await mascot.click();
    await expect(page).toHaveURL(/\/collections\?family=desert-eye-love$/);
    await expect(page.getByTestId("sand-transition")).toHaveCount(0);
  });
});

test.describe("mobile navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "the full-screen menu only exists on small screens");

  test("the menu opens full screen as a dialog and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Collections" }).click();
    await expect(page).toHaveURL(/\/collections$/);
    await expect(menu).toBeHidden();
  });
});
