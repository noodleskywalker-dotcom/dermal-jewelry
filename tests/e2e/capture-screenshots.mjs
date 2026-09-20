// Captures review screenshots with the geometric fixture (never a real face).
// Browser emulation only. Run while the dev server is up: node tests/e2e/capture-screenshots.mjs
import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const fixture = fileURLToPath(new URL("../fixtures/geometric-portrait.png", import.meta.url));
const out = fileURLToPath(new URL("../../docs/screenshots/", import.meta.url));
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const FAMILY = "/product/desert-eye-love";

async function session(name, options, steps) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const shot = async (file) => {
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}${name}-${file}.png` });
  };
  const toSection = (id) => page.evaluate((target) => document.getElementById(target).scrollIntoView({ block: "start" }), id);
  const chooseForm = (formId) => page.locator("label", { has: page.getByTestId(`form-${formId}`) }).click();
  await steps({ page, shot, toSection, chooseForm });
  await context.close();
}

const fullTour = async ({ page, shot, toSection, chooseForm }) => {
  await page.goto(`${base}/`);
  await page.waitForLoadState("networkidle");
  await shot("home-1-hero");
  await toSection("piece");
  await shot("home-2-family");
  await toSection("studio");
  await shot("home-3-studio");
  await toSection("collection");
  await shot("home-4-pieces");

  await page.goto(`${base}${FAMILY}`);
  await page.waitForLoadState("networkidle");
  await shot("family-1-reveal-still");
  await page.getByRole("tab", { name: "Placement preview" }).click();
  await shot("family-2-placement-anti-eyebrow");
  await chooseForm("micro-dermal");
  await page.getByRole("tab", { name: "Placement preview" }).scrollIntoViewIfNeeded();
  await shot("family-3-placement-micro-dermal");

  await page.goto(`${base}/product/crimson-orbit?form=nose`);
  await page.getByRole("tab", { name: "Placement preview" }).click();
  await shot("original-1-placement-nose");

  await page.goto(`${base}/face-studio?product=desert-eye-love&form=micro-dermal`);
  await page.getByTestId("photo-input").first().setInputFiles(fixture);
  await page.getByTestId("placed-item").waitFor();
  await shot("studio-1-micro-dermal");
};

await session("desktop", { viewport: { width: 1440, height: 900 } }, fullTour);
await session("mobile", { ...devices["Pixel 7"] }, fullTour);

// Unusual sizes, family page only.
for (const [name, width, height] of [
  ["narrow-320", 320, 568],
  ["zoom-200", 720, 450],
  ["short-desktop", 1280, 480],
  ["landscape-phone", 844, 390],
  ["wide-2560", 2560, 1200],
]) {
  await session(name, { viewport: { width, height } }, async ({ page, shot }) => {
    await page.goto(`${base}${FAMILY}`);
    await page.waitForLoadState("networkidle");
    await shot("family");
  });
}

await browser.close();
console.log(`screenshots written to ${out}`);
