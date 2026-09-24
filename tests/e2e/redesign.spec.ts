import { expect, test } from "@playwright/test";

// The final master redesign: material hotspots on the piece, the browse rail of worlds, the
// shop's audience and line filters, the jewelry poster for the film, the 360° rear note, and the
// companion on every page (development server only: his art is internal).

const PRODUCT = "/product/desert-eye-love";

test.describe("material hotspots on the piece", () => {
  test("each part opens a refined annotation with the owner's wording, and nothing is invented", async ({ page }) => {
    await page.goto(PRODUCT);
    await expect(page.getByTestId("pdp-beauty")).toBeVisible();
    for (const id of ["gemstone", "bar", "symbol"]) await expect(page.getByTestId(`hotspot-${id}`)).toBeVisible();

    await page.getByTestId("hotspot-gemstone").click();
    const gem = page.getByTestId("hotspot-note-gemstone");
    await expect(gem).toBeVisible();
    await expect(gem).toContainText("Deep-red faceted gemstone");
    await expect(gem).toContainText("Not yet confirmed");
    await expect(gem).toContainText("Four-prong concept");
    await expect(gem).toContainText("Pending supplier confirmation");
    await expect(page.getByTestId("hotspot-gemstone")).toHaveAttribute("aria-expanded", "true");

    // One at a time.
    await page.getByTestId("hotspot-bar").click();
    await expect(gem).toBeHidden();
    const bar = page.getByTestId("hotspot-note-bar");
    await expect(bar).toContainText("Titanium");
    await expect(bar).toContainText("Proposed · pending confirmation");
    await expect(bar).toContainText("Prototype surface-bar concept");

    await page.getByTestId("hotspot-symbol").click();
    const symbol = page.getByTestId("hotspot-note-symbol");
    await expect(symbol).toContainText("Openwork symbol");
    await expect(symbol).toContainText("manufacturing geometry pending");

    const words = (await page.locator("main").innerText()).toLowerCase();
    expect(words).not.toMatch(/\bruby\b|grade 5|implant.grade|certified|\b925\b|\d\s?mm\b/);
    await page.keyboard.press("Escape");
    await expect(symbol).toBeHidden();
  });

  test("the keyboard reaches every hotspot and opens it", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard is a desktop matter");
    await page.goto(PRODUCT);
    await page.getByTestId("hotspot-gemstone").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("hotspot-note-gemstone")).toBeVisible();
    await page.getByTestId("hotspot-bar").focus();
    await page.keyboard.press("Space");
    await expect(page.getByTestId("hotspot-note-bar")).toBeVisible();
  });
});

test.describe("assembly and 360°", () => {
  test("the film opens on the finished jewelry, never the creature, and the rear note shows only at the rear", async ({ page }) => {
    await page.goto(PRODUCT);
    await page.getByRole("tab", { name: "Assembly" }).click();
    await expect(page.getByTestId("film-poster")).toHaveAttribute("src", /final\.jpg$/);
    await page.getByRole("tab", { name: "360°" }).click();
    await expect(page.getByTestId("orbit-rear-note")).toHaveCount(0);
    await page.getByTestId("orbit-turn").fill("36");
    await expect(page.getByTestId("orbit-rear-note")).toContainText("Rear geometry conceptual");
    await page.getByTestId("orbit-turn").fill("70");
    await expect(page.getByTestId("orbit-rear-note")).toHaveCount(0);
  });
});

test.describe("the collection browser", () => {
  test("every family gets the same stage, in the owner's order, and the ways in stay text", async ({ page, isMobile }) => {
    // The rail is the homepage's turn out of the launch and into the brand. It is one rail, and
    // every design family stands on the same stage: DESERT EYE is not given a larger frame.
    await page.goto("/");
    const entries = page.getByTestId("browse-entry");
    await expect(entries).toHaveCount(6);
    const names = await entries.locator("h3").allInnerTexts();
    expect(names).toEqual(["DESERT EYE — LOVE", "HORUS TRACE", "BLADE TRACE", "CROSSLINE", "ANKH TRACE", "KIRI"]);

    // The same stage for every family. Laid-out size, not the painted size: the centred entry is
    // scaled up a little and its neighbours down, which is focus and not a larger frame.
    const widths = await entries.evaluateAll((els) => els.map((el) => (el as HTMLElement).offsetWidth));
    expect(new Set(widths).size).toBe(1);
    const frames = await entries
      .locator(".browse-visual")
      .evaluateAll((els) => els.map((el) => (el as HTMLElement).offsetHeight));
    expect(new Set(frames).size).toBe(1);

    // Each family carries its own small world; the sand belongs to DESERT EYE alone.
    const current = page.locator('[data-testid="browse-entry"][data-current="true"]');
    await expect(current).toHaveAttribute("data-entry", "desert-eye-love");
    for (const [entry, world] of [
      ["desert-eye-love", "sand"],
      ["horus-trace", "trace"],
      ["blade-trace", "blade"],
      ["crossline", "line"],
      ["ankh-trace", "symbol"],
      ["kiri", "chrome"],
    ]) {
      await expect(page.locator(`[data-entry="${entry}"]`)).toHaveAttribute("data-world", world);
    }
    await expect(page.getByTestId("browse").getByTestId("sand-layer")).toHaveCount(1);

    // The neighbour is well into the frame.
    const next = (await page.locator('[data-entry="horus-trace"]').boundingBox())!;
    expect(page.viewportSize()!.width - next.x).toBeGreaterThan(page.viewportSize()!.width * 0.08);
    await page.getByTestId("browse-next").click();
    await expect(current).toHaveAttribute("data-entry", "horus-trace");
    if (!isMobile) {
      await page.getByTestId("browse-rail").focus();
      await page.keyboard.press("ArrowRight");
      await expect(current).toHaveAttribute("data-entry", "blade-trace");
    }
    await expect(page.getByTestId("browse").getByTestId("product-card")).toHaveCount(0);

    // The ways into the catalogue are text under the rail, never a stage of their own.
    const ways = page.getByTestId("browse-ways");
    const hrefs = await ways.getByRole("link").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs).toEqual(["/shop", "/shop?browse=men", "/shop?browse=women", "/shop?browse=inspired", "/shop?browse=original", "/face-studio"]);
    // They are links on the paper, with no frame of their own.
    const framed = await ways.getByRole("link").evaluateAll((els) =>
      els.filter((el) => {
        const s = getComputedStyle(el);
        return !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor);
      }).length,
    );
    expect(framed).toBe(0);
  });

  test("a family opens its own page, and KIRI stays a concept with nothing to buy", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-entry="horus-trace"] [data-testid="browse-go"]')).toHaveAttribute("href", "/product/horus-trace");
    await expect(page.locator('[data-entry="desert-eye-love"] [data-testid="browse-go"]')).toHaveAttribute("href", "/product/desert-eye-love");
    const kiri = page.locator('[data-entry="kiri"]');
    await expect(kiri).toContainText("Original / Concept");
    await expect(kiri.getByTestId("browse-go")).toHaveAttribute("href", "/shop?browse=original");
  });

  test("the selection page browses the same families without a second rail", async ({ page }) => {
    await page.goto("/collections");
    await expect(page.getByTestId("browse")).toHaveCount(0);
    await expect(page.getByTestId("selection-slide")).toHaveCount(8);
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
    await expect(page.getByTestId("product-card")).toHaveCount(8);
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
