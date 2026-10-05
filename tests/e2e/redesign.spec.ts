import { expect, test } from "@playwright/test";

// The photographic redesign: complete studio scenes, the browse rail, the shop's audience and
// line filters, and the companion on every page (development server only: his art is internal).

const PRODUCT = "/product/desert-eye-love";

test.describe("photographic presentation", () => {
  test("the complete scene keeps its light and carries no annotations from an older image", async ({ page }) => {
    await page.goto(PRODUCT);
    const stage = page.getByTestId("render-stage");
    await expect(stage).toBeVisible();
    await expect(stage).toHaveAttribute("data-presentation", "photographic");
    await expect(page.getByTestId("render-stage-image")).toHaveAttribute("src", "/products/photographic/desert-eye-love/hero.webp");
    await expect(stage.locator('[data-testid^="hotspot-"]')).toHaveCount(0);
    const imageStyle = await page.getByTestId("render-stage-image").evaluate((image) => ({
      filter: getComputedStyle(image).filter,
      blend: getComputedStyle(image).mixBlendMode,
    }));
    expect(imageStyle).toEqual({ filter: "none", blend: "normal" });
    await expect(page.getByTestId("render-note")).toContainText("not photography of a made piece");
    await expect(page.getByTestId("render-note")).toContainText("materials not yet confirmed");
    const words = (await page.locator("main").innerText()).toLowerCase();
    expect(words).not.toMatch(/\bruby\b|grade 5|implant.grade|certified|\b925\b|\d\s?mm\b/);
  });

  test("the keyboard can switch whole-piece and close views", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard is a desktop matter");
    await page.goto(PRODUCT);
    await page.getByTestId("render-view-detail").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("render-stage")).toHaveAttribute("data-view", "detail");
    await expect(page.getByTestId("render-stage-image")).toHaveAttribute("src", "/products/photographic/desert-eye-love/detail.webp");
    await page.getByTestId("render-view-front").focus();
    await page.keyboard.press("Space");
    await expect(page.getByTestId("render-stage")).toHaveAttribute("data-view", "front");
    await expect(page.getByTestId("render-view-front")).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("the corrected design replaces the older hardware study", () => {
  test("the product offers actual supplied views without the superseded orbit or assembly", async ({ page }) => {
    await page.goto(PRODUCT);
    await expect(page.getByRole("tab", { name: "Assembly", exact: true })).toHaveCount(0);
    await expect(page.getByRole("tab", { name: "Orbit study", exact: true })).toHaveCount(0);
    await expect(page.getByTestId("film-poster")).toHaveCount(0);
    await expect(page.getByTestId("orbit-turn")).toHaveCount(0);
    await expect(page.getByTestId("render-view-front")).toHaveText("Whole piece");
    await expect(page.getByTestId("render-view-detail")).toHaveText("Detail");
    await expect(page.getByTestId("render-note")).toContainText("AI design render");
  });
});

test.describe("the collection browser", () => {
  test("every current family gets the same stage, in the owner's order, and the ways in stay text", async ({ page, isMobile }) => {
    await page.goto("/");
    const selection = page.getByTestId("collection-section");
    const entries = selection.getByTestId("selection-slide");
    await expect(entries).toHaveCount(7);
    const names = (await entries.locator("h2").allInnerTexts()).map((name) => name.replace(/\u00a0/g, " "));
    expect(names).toEqual(["DESERT EYE — LOVE", "HORUS TRACE", "BLADE TRACE", "CROSSLINE", "ANKH TRACE", "JAPANESE ANGEL", "ANKH + EYE"]);

    // Position changes focus, never the physical size of a family's stage.
    const widths = await entries.evaluateAll((els) => els.map((el) => (el as HTMLElement).offsetWidth));
    expect(new Set(widths).size).toBe(1);
    const frames = await entries.locator(".selection-object").evaluateAll((els) => els.map((el) => (el as HTMLElement).offsetHeight));
    expect(new Set(frames).size).toBe(1);
    const current = selection.locator('[data-testid="selection-slide"][data-current="true"]');
    await expect(current).toHaveAttribute("data-product", "desert-eye-love");
    // The light and ground belong to each scene; no synthetic sand or glint overlays it.
    await expect(selection.getByTestId("sand-layer")).toHaveCount(0);
    await expect(selection.locator(".fo-blade, .fo-grain")).toHaveCount(0);
    await expect(selection.locator('[data-presentation="photographic"] > img')).toHaveCount(7);

    // The surrounding page stays DERMAL paper; the scene itself is the opaque image plane.
    const stages = await entries.locator(".selection-object").evaluateAll((els) => els.map((el) => ({
      color: getComputedStyle(el).backgroundColor,
      image: getComputedStyle(el).backgroundImage,
    })));
    for (const stage of stages) {
      expect(stage.color).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
      expect(stage.image).toBe("none");
    }
    const next = (await selection.locator('[data-product="horus-trace"]').boundingBox())!;
    expect(page.viewportSize()!.width - next.x).toBeGreaterThan(page.viewportSize()!.width * 0.08);
    await selection.getByTestId("selection-next").click();
    await expect(current).toHaveAttribute("data-product", "horus-trace");
    if (!isMobile) {
      await selection.getByTestId("selection-rail").focus();
      await page.keyboard.press("ArrowRight");
      await expect(current).toHaveAttribute("data-product", "blade-trace");
    }
    await expect(selection.getByTestId("product-card")).toHaveCount(0);

    const ways = selection.getByTestId("browse-ways");
    const hrefs = await ways.getByRole("link").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs).toEqual(["/shop?browse=men", "/shop?browse=women", "/shop?browse=inspired", "/shop?browse=original", "/shop?browse=limited", "/face-studio"]);
    await expect(page.getByTestId("explore-shop")).toHaveAttribute("href", "/shop");
    const framed = await ways.getByRole("link").evaluateAll((els) =>
      els.filter((el) => !/rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(el).backgroundColor)).length,
    );
    expect(framed).toBe(0);
  });

  test("each configured family opens its real form and try-on, while render-only concepts cannot be tried on", async ({ page }) => {
    await page.goto("/");
    const selection = page.getByTestId("collection-section");
    for (const slug of ["horus-trace", "desert-eye-love"]) {
      const family = selection.locator(`[data-product="${slug}"]`);
      await expect(family.getByTestId("selection-view")).toHaveAttribute("href", `/product/${slug}?form=anti-eyebrow`);
      await expect(family.getByRole("link", { name: "Try on" })).toHaveAttribute("href", `/face-studio?product=${slug}&form=anti-eyebrow`);
      await expect(family.locator(".selection-object")).toHaveAttribute("aria-label", /Anti-eyebrow form$/);
    }
    for (const slug of ["japanese-angel", "ankh-eye"]) {
      const family = selection.locator(`[data-product="${slug}"]`);
      await expect(family.getByTestId("selection-view")).toHaveAttribute("href", `/product/${slug}`);
      await expect(family.getByTestId("selection-concept-note")).toHaveText("Concept · not yet available");
      await expect(family.getByRole("link", { name: "Try on" })).toHaveCount(0);
    }
  });

  test("KIRI stays in the collection archive as a concept, with nothing to buy or try on", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("collection-section").getByTestId("selection-concept")).toHaveCount(0);
    await page.goto("/collections?family=ankh-eye");
    await page.getByTestId("selection-next").click();
    const kiri = page.getByTestId("selection-concept");
    await expect(kiri).toHaveAttribute("data-current", "true");
    await expect(kiri).toContainText("Original / Concept");
    await expect(kiri).toContainText("nothing to order");
    await expect(kiri.getByRole("link")).toHaveCount(0);
    await expect(kiri.getByTestId("add-to-bag")).toHaveCount(0);
    await expect(kiri).not.toContainText("QAR");
  });

  test("the selection page browses the same families without a second rail", async ({ page }) => {
    await page.goto("/collections");
    await expect(page.getByTestId("browse")).toHaveCount(0);
    await expect(page.getByTestId("selection-slide")).toHaveCount(10);
    await expect(page.getByTestId("browse-ways")).toBeVisible();
  });
});

test.describe("shop filters", () => {
  test("men and women show the unisex pieces, inspired shows DESERT EYE, and no limited edition is invented", async ({ page }) => {
    await page.goto("/shop");
    // Discovery first: the lines on one row, the placements on a quieter row under them.
    const nav = page.getByRole("navigation", { name: "Browse the collection" });
    for (const label of ["All", "Men", "Women", "Full collection", "Inspired", "Original", "Limited edition"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    const placements = page.getByRole("navigation", { name: "Filter by placement" });
    for (const label of ["Anti-eyebrow", "Dermal", "Nose", "Eyebrow", "Septum", "Lip"]) {
      await expect(placements.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await nav.getByRole("link", { name: "Men", exact: true }).click();
    await expect(page).toHaveURL(/browse=men/);
    // Every piece is unisex, so men and women both show the whole collection.
    await expect(page.getByTestId("product-card")).toHaveCount(10);
    await page.goto("/shop?browse=inspired");
    // DESERT EYE and BLADE TRACE are the inspired pieces; the rest are originals or symbolic.
    await expect(page.getByTestId("product-card")).toHaveCount(2);
    await expect(page.getByTestId("product-card").first()).toHaveAttribute("data-product", "desert-eye-love");
    await page.goto("/shop?browse=limited");
    await expect(page.getByTestId("product-card")).toHaveCount(0);
    await expect(page.getByTestId("shop-empty")).toContainText("No limited edition has been announced.");
    await page.goto("/shop");
    await expect(page.getByTestId("product-card").first().getByTestId("view-piece")).toHaveAttribute("href", "/product/desert-eye-love");
  });
});

test.describe("the companion on every page", () => {
  test("he stays in the same corner on every page, small, and a press elsewhere simply opens DESERT EYE", async ({ page }) => {
    await page.goto("/shop");
    test.skip((await page.getByTestId("global-mascot").count()) === 0, "internal mascot art is not on this machine");
    const sizes: number[] = [];
    for (const route of ["/", "/collections", "/shop", PRODUCT, "/face-studio", "/cart", "/about"]) {
      await page.goto(route);
      const box = (await page.getByTestId("global-mascot").boundingBox())!;
      expect(page.viewportSize()!.width - (box.x + box.width)).toBeLessThan(40);
      expect(page.viewportSize()!.height - (box.y + box.height)).toBeLessThan(40);
      sizes.push(Math.round(box.width));
      expect(box.width).toBeLessThan(page.viewportSize()!.width * 0.3);
      await expect(page.getByTestId("mascot")).toHaveCount(1);
    }
    expect(new Set(sizes).size).toBe(1);
    await page.goto("/shop");
    await page.getByTestId("mascot").click();
    await expect(page).toHaveURL(/\/collections\?family=desert-eye-love$/);
    await expect(page.getByTestId("sand-transition")).toHaveCount(0);
  });

  test("a hover is only a glance, never the transition", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover is a desktop matter");
    await page.goto("/about");
    test.skip((await page.getByTestId("global-mascot").count()) === 0, "internal mascot art is not on this machine");
    await page.getByTestId("mascot").hover();
    // Animated, he slows his clip for the glance; on the stills he changes pose. Either way he stays put.
    const clip = page.getByTestId("mascot-clip");
    if ((await clip.count()) > 0) {
      await expect.poll(() => clip.evaluate((v: HTMLVideoElement) => v.playbackRate)).toBeLessThan(1);
      await expect.poll(() => clip.evaluate((v: HTMLVideoElement) => v.playbackRate), { timeout: 4000 }).toBe(1);
    } else {
      await expect(page.getByTestId("mascot")).toHaveAttribute("data-pose", "look");
      await expect(page.getByTestId("mascot")).toHaveAttribute("data-pose", "idle", { timeout: 4000 });
    }
    await expect(page).toHaveURL(/\/about$/);
  });
});
