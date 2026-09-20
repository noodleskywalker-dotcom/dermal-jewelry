// Captures review screenshots with the geometric fixture (never a real face).
// Run while the dev server is up: node tests/e2e/capture-screenshots.mjs
import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const fixture = fileURLToPath(new URL("../fixtures/geometric-portrait.png", import.meta.url));
const out = fileURLToPath(new URL("../../docs/screenshots/", import.meta.url));
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();

// Homepage frames: [file name, chapter id, progress through that chapter].
const HOME_FRAMES = [
  ["home-1-hero", "piece", 0],
  ["home-2-piece-closeup", "piece", 0.42],
  ["home-3-studio-first", "studio", 0.3],
  ["home-4-studio-adjust", "studio", 0.92],
  ["home-5-collection-start", "collection", 0.02],
  ["home-6-collection-mid", "collection", 0.55],
  ["home-7-ending", "enter", 0],
];

async function capture(name, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const shot = (file) => page.screenshot({ path: `${out}${name}-${file}.png` });

  await page.goto(`${base}/`);
  await page.waitForLoadState("networkidle");
  for (const [file, id, progress] of HOME_FRAMES) {
    await page.evaluate(
      ([chapterId, p]) => {
        const el = document.getElementById(chapterId);
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top + p * Math.max(0, el.offsetHeight - window.innerHeight));
      },
      [id, progress],
    );
    await page.waitForTimeout(1300);
    await shot(file);
  }

  await page.goto(`${base}/shop`);
  await page.waitForLoadState("networkidle");
  await shot("shop");

  await page.goto(`${base}/product/desert-eye-love`);
  await page.waitForLoadState("networkidle");
  await shot("product");

  await page.goto(`${base}/face-studio`);
  await page.waitForLoadState("networkidle");
  await shot("studio-empty");
  await page.getByTestId("photo-input").first().setInputFiles(fixture);
  await page.getByTestId("placed-item").waitFor();
  await page.waitForTimeout(500);
  await shot("studio-photo");

  if (contextOptions.isMobile) await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("link", { name: "Shop", exact: true }).first().click();
  await page.waitForURL("**/shop");
  const card = page.locator('[data-testid="product-card"][data-product="sand-vortex"]');
  if (contextOptions.isMobile) {
    await card.getByTestId("try-on-button").click();
    await page.getByTestId("tryon-sheet").getByTestId("placed-item").waitFor();
  } else {
    await card.hover();
    await page.getByTestId("hover-panel").getByTestId("placed-item").waitFor();
  }
  await page.waitForTimeout(500);
  await shot("shop-preview");
  if (contextOptions.isMobile) await page.keyboard.press("Escape");

  await page.goto(`${base}/product/desert-eye-love`);
  await page.getByTestId("add-to-bag").click();
  await page.getByTestId("bag-line").waitFor();
  await page.waitForTimeout(500);
  await shot("bag");

  await context.close();
}

await capture("desktop", { viewport: { width: 1440, height: 900 } });
await capture("mobile", { ...devices["Pixel 7"] });
await browser.close();
console.log(`screenshots written to ${out}`);
