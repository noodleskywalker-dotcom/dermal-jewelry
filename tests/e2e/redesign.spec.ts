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

test.describe("browsing the worlds", () => {
  test("the rail holds the worlds and the ways in, steps with arrows and keys, and never shows a card", async ({ page, isMobile }) => {
    await page.goto("/collections");
    const entries = page.getByTestId("browse-entry");
    await expect(entries).toHaveCount(7);
    const names = await entries.locator("h3").allInnerTexts();
    expect(names).toEqual(["DESERT EYE", "KIRI", "LIMITED EDITION", "FULL COLLECTION", "MEN", "WOMEN", "TRY ON YOUR FACE"]);
    const current = page.locator('[data-testid="browse-entry"][data-current="true"]');
    await expect(current).toHaveAttribute("data-entry", "desert-eye");
    await expect(page.locator('[data-entry="desert-eye"]')).toHaveAttribute("data-world", "sand");
    await expect(page.locator('[data-entry="kiri"]')).toHaveAttribute("data-world", "chrome");
    await expect(page.locator('[data-entry="limited"]')).toHaveAttribute("data-world", "dark");
    await expect(page.locator('[data-entry="kiri"]').getByTestId("sand-layer")).toHaveCount(0);
    // The neighbour is well into the frame.
    const next = (await page.locator('[data-entry="kiri"]').boundingBox())!;
    expect(page.viewportSize()!.width - next.x).toBeGreaterThan(page.viewportSize()!.width * 0.08);
    await page.getByTestId("browse-next").click();
    await expect(current).toHaveAttribute("data-entry", "kiri");
    if (!isMobile) {
      await page.getByTestId("browse-rail").focus();
      await page.keyboard.press("ArrowRight");
      await expect(current).toHaveAttribute("data-entry", "limited");
    }
    await expect(page.getByTestId("browse").getByTestId("product-card")).toHaveCount(0);
  });

  test("the homepage reaches the same worlds", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("collection-section").getByTestId("browse-entry")).toHaveCount(7);
  });
});

test.describe("shop filters", () => {
  test("men and women show the unisex pieces, inspired shows DESERT EYE, and no limited edition is invented", async ({ page }) => {
    await page.goto("/shop");
    const nav = page.getByRole("navigation", { name: "Filter by placement" });
    for (const label of ["All", "Men", "Women", "Anti-eyebrow", "Dermal", "Nose", "Eyebrow", "Septum", "Lip", "Inspired", "Limited edition"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await nav.getByRole("link", { name: "Men", exact: true }).click();
    await expect(page).toHaveURL(/browse=men/);
    await expect(page.getByTestId("product-card")).toHaveCount(4);
    await page.goto("/shop?browse=inspired");
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await expect(page.getByTestId("product-card")).toHaveAttribute("data-product", "desert-eye-love");
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
    await expect(page.getByTestId("mascot")).toHaveAttribute("data-pose", "look");
    await expect(page.getByTestId("mascot")).toHaveAttribute("data-pose", "idle", { timeout: 4000 });
    await expect(page).toHaveURL(/\/about$/);
  });
});
