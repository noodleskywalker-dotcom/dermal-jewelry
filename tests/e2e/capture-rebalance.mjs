// Captures the owner's review set for the catalogue rebalance (brief of 24 September 2026, review
// list confirmed the same day). Browser emulation only, never a real face, nothing generated.
// Run while a dev server is up:  node tests/e2e/capture-rebalance.mjs
import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = fileURLToPath(new URL("../../docs/screenshots/rebalance/", import.meta.url));
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();

async function session(name, options, steps) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const shot = async (file, full = false) => {
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}${name}-${file}.png`, fullPage: full });
  };
  const settle = async (url) => {
    await page.goto(`${base}${url}`);
    await page.waitForLoadState("networkidle").catch(() => undefined);
  };
  await steps({ page, shot, settle });
  await context.close();
}

// Steps a horizontal rail to a given slide and waits for it to settle in the middle.
async function stepTo(page, nextTestId, currentSelector, entry) {
  for (let i = 0; i < 10; i += 1) {
    if ((await page.locator(`${currentSelector}[data-current="true"]`).getAttribute(entry.attr)) === entry.value) return;
    await page.getByTestId(nextTestId).click();
    await page.waitForTimeout(600);
  }
}

const desktop = async ({ page, shot, settle }) => {
  // 01 the homepage turn out of the launch and into the brand.
  await settle("/");
  await page.getByTestId("collection-section").evaluate((el) => el.scrollIntoView({ block: "start" }));
  await shot("01-home-explore-dermal");

  // 02 and 03 the catalogue, in both views, whole page.
  await settle("/shop");
  await shot("02-shop-editorial", true);
  await settle("/shop?view=even");
  await shot("03-shop-grid", true);

  // 04 the selection.
  await settle("/collections");
  await shot("04-collections", true);

  // 05 DESERT EYE and HORUS TRACE on the same stage, side by side on the rail.
  await settle("/");
  await page.getByTestId("browse-rail").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await stepTo(page, "browse-next", '[data-testid="browse-entry"]', { attr: "data-entry", value: "horus-trace" });
  await shot("05-rail-desert-eye-and-horus-trace");

  // 06 to 08 the other families, each on its own page.
  for (const [file, slug] of [
    ["06-blade-trace", "blade-trace"],
    ["07-crossline", "crossline"],
    ["08-ankh-trace", "ankh-trace"],
  ]) {
    await settle(`/product/${slug}`);
    await shot(file);
  }

  // 09 KIRI, as a concept and nothing else: on the rail, and named in words in the catalogue.
  await settle("/");
  await page.getByTestId("browse-rail").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await stepTo(page, "browse-next", '[data-testid="browse-entry"]', { attr: "data-entry", value: "kiri" });
  await shot("09a-kiri-concept-rail");
  await settle("/shop");
  await page.getByTestId("catalogue-concepts").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await shot("09b-kiri-concept-catalogue");

  // 10 to 14 the browsing views, including the empty limited edition.
  for (const [file, url] of [
    ["10-men", "/shop?browse=men"],
    ["11-women", "/shop?browse=women"],
    ["12-inspired", "/shop?browse=inspired"],
    ["13-original", "/shop?browse=original"],
    ["14-limited-edition-empty", "/shop?browse=limited"],
  ]) {
    await settle(url);
    await shot(file, true);
  }
};

const mobile = async ({ shot, settle }) => {
  for (const [file, url] of [
    ["15-shop", "/shop"],
    ["16-collections", "/collections"],
    ["17-men", "/shop?browse=men"],
    ["18-women", "/shop?browse=women"],
    ["19-inspired", "/shop?browse=inspired"],
  ]) {
    await settle(url);
    await shot(file, true);
  }
};

await session("desktop", { viewport: { width: 1440, height: 900 } }, desktop);
await session("mobile", { ...devices["Pixel 7"] }, mobile);

await browser.close();
console.log(`Review frames written to ${out}`);
