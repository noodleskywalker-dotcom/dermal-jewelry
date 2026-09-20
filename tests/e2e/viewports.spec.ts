import { expect, test } from "@playwright/test";

// Browser emulation only. None of this replaces checks on physical devices.
const SIZES = [
  { name: "narrow-phone", width: 320, height: 568 },
  { name: "zoom-200", width: 720, height: 450 }, // what a 1440 x 900 window becomes at 200% zoom
  { name: "short-desktop", width: 1280, height: 480 },
  { name: "landscape-phone", width: 844, height: 390 },
  { name: "wide-desktop", width: 2560, height: 1200 },
];

const ROUTES = ["/", "/product/desert-eye-love", "/shop", "/face-studio"];

test.describe("layouts at unusual sizes", () => {
  test.skip(({ browserName, isMobile }) => browserName !== "chromium" || Boolean(isMobile), "sizes are set explicitly, once, in desktop Chromium");

  for (const size of SIZES) {
    test(`${size.name} (${size.width} x ${size.height}) has no sideways overflow and reachable actions`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      for (const route of ROUTES) {
        await page.goto(route);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${route} overflows sideways by ${overflow}px`).toBeLessThanOrEqual(1);
      }

      await page.goto("/product/desert-eye-love");
      const add = page.getByTestId("add-to-bag");
      await add.scrollIntoViewIfNeeded();
      await expect(add).toBeInViewport();
      const box = await add.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(size.width + 1);

      // Keyboard focus is visible on the first control reached.
      await page.keyboard.press("Tab");
      const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
      expect(outline).not.toBe("none");
    });
  }
});
