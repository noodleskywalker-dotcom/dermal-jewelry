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

  test("after the launch the page turns into the brand and shows every family on one stage", async ({ page }) => {
    await page.goto("/");
    const section = page.getByTestId("collection-section");
    // The turn: the campaign has ended and the collection begins, said in words before it is shown.
    await expect(section.getByRole("heading", { name: "Explore DERMAL" })).toBeVisible();
    await expect(section.getByTestId("explore-lede")).toContainText("DESERT EYE is the current launch");
    await expect(section.getByTestId("explore-lede")).toContainText("one collection inside DERMAL");
    await expect(section.getByTestId("explore-shop")).toHaveAttribute("href", "/shop");
    // Six design families, none of them given a larger frame than the others.
    await expect(section.getByTestId("browse-entry")).toHaveCount(6);
    await expect(section.locator('[data-entry="kiri"]')).toContainText("Original");
    await expect(section.locator('[data-entry="desert-eye-love"]')).toContainText("Inspired");
    await expect(section.locator('[data-entry="horus-trace"]')).toContainText("Symbolic");
    await expect(section.getByTestId("product-card")).toHaveCount(0);
  });

  test("the turn comes after the launch story and before the last frame", async ({ page }) => {
    await page.goto("/");
    const top = async (id: string) => (await page.getByTestId(id).evaluate((el) => el.getBoundingClientRect().top + window.scrollY)) as number;
    const [onyou, turn, final] = [await top("onyou-section"), await top("collection-section"), await top("final-section")];
    expect(turn).toBeGreaterThan(onyou);
    expect(final).toBeGreaterThan(turn);
    // Below the turn, the only sand on the page is DESERT EYE's own slide on the rail.
    const rail = page.getByTestId("browse");
    await expect(rail.getByTestId("sand-layer")).toHaveCount(1);
    const host = rail.locator('[data-testid="browse-entry"]', { has: page.getByTestId("sand-layer") });
    await expect(host).toHaveAttribute("data-entry", "desert-eye-love");
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

  test("he idles quietly on his looping clip, and nothing happens by itself", async ({ page }) => {
    const clip = page.getByTestId("mascot-clip");
    test.skip((await clip.count()) === 0, "the animated clips are not on this machine");
    // The clip loops silently and never starts anything.
    expect(await clip.evaluate((v: HTMLVideoElement) => [v.loop, v.muted])).toEqual([true, true]);
    await expect(clip).toHaveAttribute("data-clip", "idle");
    // The homepage's own opening loop is playing, and the mascot gives way to it rather than decoding
    // a second video beside it.
    await expect.poll(() => clip.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await expect(page.getByTestId("sand-transition")).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test("on a quiet page his clip runs, and it stops again when a film starts", async ({ page }) => {
    const clip = page.getByTestId("mascot-clip");
    test.skip((await clip.count()) === 0, "the animated clips are not on this machine");
    await page.goto("/about");
    await expect(page.getByTestId("mascot-clip")).toHaveCount(1);
    const quiet = page.getByTestId("mascot-clip");
    await expect.poll(() => quiet.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
    const before = await quiet.evaluate((v: HTMLVideoElement) => v.currentTime);
    await page.waitForTimeout(900);
    expect(await quiet.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(before);
    // A film of any kind takes precedence: the mascot pauses while it plays.
    await page.evaluate(() => {
      const v = document.createElement("video");
      v.muted = true;
      v.loop = true;
      v.src = "/media/horus-trace/film.mp4";
      v.setAttribute("data-testid", "fake-film");
      document.body.appendChild(v);
      return v.play();
    });
    await expect.poll(() => quiet.evaluate((v: HTMLVideoElement) => v.paused), { timeout: 5000 }).toBe(true);
  });

  test("with the clips absent he is still the five stills", async ({ page }) => {
    const mascot = page.getByTestId("mascot");
    test.skip((await page.getByTestId("mascot-clip").count()) > 0, "this machine has the animated clips");
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

  test("pressing him plays his reaction, then sand from his gourd covers the page and the selection opens under it", async ({ page }) => {
    test.setTimeout(45_000);
    const mascot = page.getByTestId("mascot");
    const clip = page.getByTestId("mascot-clip");
    const animated = (await clip.count()) > 0;
    await mascot.click();
    if (animated) {
      // The reaction runs once instead of looping, and he holds it while the sand travels.
      await expect(clip).toHaveAttribute("data-clip", "react");
      expect(await clip.evaluate((v: HTMLVideoElement) => v.loop)).toBe(false);
    } else {
      await expect(mascot).toHaveAttribute("data-pose", "look");
    }
    const sand = page.getByTestId("sand-transition");
    await expect(sand).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("sand-skip")).toBeVisible();

    // While the sand is still a ribbon, it enters at the opening of the mini gourd.
    const handle = await page.waitForFunction(
      () => {
        const fx = document.querySelector<HTMLCanvasElement>('[data-testid="story-effect"]');
        const at = Number(fx?.dataset.time ?? 0);
        // Whichever of the two he is drawn with, the sand is aimed at the picture on screen.
        const picture = document.querySelector<HTMLElement>('[data-testid="mascot"] video, [data-testid="mascot"] img');
        if (!fx || !picture || at < 0.1 || at > 0.9) return null;
        const box = picture.getBoundingClientRect();
        const m = new DOMMatrixReadOnly(getComputedStyle(fx).transform);
        return {
          gourd: { x: box.left + 0.668 * box.width, y: box.top + 0.355 * box.height },
          // The composed local clip's stream enters at (0.17, 0.02) of the footage.
          entry: { x: m.e + 0.17 * fx.width * m.a, y: m.f + 0.02 * fx.height * m.d },
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
