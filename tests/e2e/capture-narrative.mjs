// Review the campaign crop and each design's story on desktop, phone and a 320 px phone.
// Run with the development server up. No forms are submitted and no commerce action is taken.
import { chromium, devices } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const out = fileURLToPath(new URL("../../docs/screenshots/narrative-remodel/", import.meta.url));
const families = ["desert-eye-love", "horus-trace", "blade-trace", "crossline", "ankh-trace", "japanese-angel", "ankh-eye"];
const captures = [];
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();

async function session(name, options, allFamilies) {
  const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
  const page = await context.newPage();

  async function settle(url) {
    await page.goto(`${base}${url}`);
    await page.addStyleTag({ content: "nextjs-portal { display: none; }" });
    await page.evaluate(() => document.fonts.ready);
  }

  async function shot(label, region) {
    const target = region ?? page.locator("body");
    const images = region ? target.locator("img") : page.getByTestId("cinema-hero").locator("img");
    for (const image of await images.all()) {
      await image.evaluate((el) => el.scrollIntoView({ block: "center" }));
      await image.evaluate((el) => el.complete && el.naturalWidth > 0 ? undefined : new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Picture did not load: ${el.currentSrc || el.src}`)), 10_000);
        el.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
        el.addEventListener("error", () => { clearTimeout(timer); reject(new Error(`Picture failed: ${el.currentSrc || el.src}`)); }, { once: true });
      }));
    }
    if (region) await region.evaluate((el) => el.scrollIntoView({ block: "start" }));
    else await page.evaluate(() => window.scrollTo(0, 0));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) throw new Error(`Horizontal overflow at ${name} ${label}: ${overflow}px`);
    const file = `${name}-${label}.png`;
    if (region) await region.screenshot({ path: `${out}${file}`, animations: "disabled" });
    else await page.screenshot({ path: `${out}${file}`, animations: "disabled" });
    const hero = page.getByTestId("cinema-hero");
    captures.push({ file, url: page.url(), viewport: page.viewportSize(), hero: await hero.count() ? await hero.getAttribute("data-presentation") : null });
  }

  await settle("/");
  await shot("00-gaara-opening");
  const stories = page.getByTestId("home-stories");
  const chapters = allFamilies ? families : ["desert-eye-love", "blade-trace", "ankh-trace"];
  for (const slug of chapters) {
    await stories.getByRole("tab").nth(families.indexOf(slug)).click();
    await shot(`01-chapter-${slug}`, stories);
  }
  for (const slug of chapters) {
    await settle(`/product/${slug}#design-story`);
    await shot(`02-story-${slug}`, page.getByTestId("product-design-story"));
  }
  await context.close();
}

try {
  await session("desktop", { viewport: { width: 1440, height: 900 } }, true);
  await session("mobile", { ...devices["Pixel 7"] }, true);
  await session("narrow", { viewport: { width: 320, height: 720 }, hasTouch: true, isMobile: true }, false);
  writeFileSync(`${out}manifest.json`, JSON.stringify({ generatedAt: new Date().toISOString(), base, captures }, null, 2) + "\n");
  console.log(`Saved ${captures.length} narrative review frames to ${out}`);
} finally {
  await browser.close();
}
