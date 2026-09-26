// Captures the owner's launch-review set (brief of 26 September 2026): the product renders on every
// shopping surface and the commission page. Browser emulation only. Commission sends go through the
// development mock delivery, so nothing is emailed and nothing is stored outside this machine.
// Run while a dev server is up:  node tests/e2e/capture-launch.mjs
import { chromium, devices } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = fileURLToPath(new URL("../../docs/screenshots/launch/", import.meta.url));
const fixture = fileURLToPath(new URL("../fixtures/geometric-portrait.png", import.meta.url));
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();

async function session(name, options, steps) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  // Every commission call is served by the development mock: nothing leaves this machine.
  const mock = { mode: "ok" };
  await page.route("**/api/commission**", (route) =>
    route.continue({ headers: { ...route.request().headers(), "x-dermal-commission-mock": mock.mode, "x-dermal-test-key": `capture-${name}-${Date.now()}` } }),
  );
  const shot = async (file, full = false) => {
    if (full) {
      // Walk the page once so every lazy picture has loaded before the whole-page frame is taken.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
    }
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}${name}-${file}.png`, fullPage: full });
  };
  const settle = async (url) => {
    await page.goto(`${base}${url}`);
    await page.waitForLoadState("networkidle").catch(() => undefined);
  };
  await steps({ page, shot, settle, mock });
  await context.close();
}

async function railTo(page, slug) {
  for (let i = 0; i < 10; i += 1) {
    if ((await page.locator('[data-testid="browse-entry"][data-current="true"]').getAttribute("data-entry")) === slug) return;
    await page.getByTestId("browse-next").click();
    await page.waitForTimeout(700);
  }
}

const references = [
  { name: "geometric-portrait.png", mimeType: "image/png", buffer: readFileSync(fixture) },
  { name: "sketch-brief.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n") },
  { name: "render.webp", mimeType: "image/webp", buffer: readFileSync(fileURLToPath(new URL("../../public/products/horus-trace/detail.webp", import.meta.url))) },
];

async function fillCommission(page) {
  await page.getByTestId("commission-form").and(page.locator('[data-ready="true"]')).waitFor();
  await page.getByLabel("Name").fill("Test Customer");
  await page.getByLabel("Email").fill("customer@example.com");
  await page.getByTestId("choices-placement").getByText("Anti-eyebrow", { exact: true }).click();
  await page.getByLabel("What do you want made?").fill("A small crescent moon in polished metal with a clear stone at its tip, worn below the outer corner of the left eye.");
  await page.getByTestId("file-input").setInputFiles(references);
  await page.getByTestId("choices-designType").getByText("Symbol", { exact: true }).click();
  await page.getByTestId("choices-budget").getByText("500–1,000 QAR", { exact: true }).click();
  await page.getByLabel(/I confirm that I have the right/).check();
  await page.getByLabel(/I understand this is a design request/).check();
}

const sendAndShow = async (page, shot, name) => {
  await page.getByTestId("commission-submit").scrollIntoViewIfNeeded();
  await page.getByTestId("commission-submit").click();
  await page.getByTestId(name === "failed" ? "commission-failed" : "commission-success").waitFor();
};

await session("desktop", { viewport: { width: 1440, height: 900 } }, async ({ page, shot, settle, mock }) => {
  await settle("/");
  await page.getByTestId("collection-section").evaluate((el) => el.scrollIntoView({ block: "start" }));
  await shot("01-home-selection-desert-eye");
  for (const slug of ["horus-trace", "japanese-angel", "ankh-eye"]) {
    await railTo(page, slug);
    await page.getByTestId("collection-section").evaluate((el) => el.scrollIntoView({ block: "start" }));
    await shot(`02-home-selection-${slug}`);
  }

  await settle("/shop");
  await shot("03-shop", true);

  for (const slug of ["desert-eye-love", "horus-trace", "japanese-angel", "ankh-eye"]) {
    await settle(`/product/${slug}`);
    await shot(`04-product-${slug}`);
  }
  await page.getByTestId("render-view-detail").click();
  await shot("04-product-ankh-eye-detail");

  await settle("/commission");
  await shot("05-commission-opening");
  await page.getByTestId("commission-form").evaluate((el) => el.scrollIntoView({ block: "start" }));
  await shot("06-commission-form");
  await fillCommission(page);
  await page.getByTestId("file-previews").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await shot("07-commission-uploads");
  await page.getByTestId("commission-submit").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await shot("08-commission-ready-to-send");
  mock.mode = "fail-email";
  await sendAndShow(page, shot, "failed");
  await page.getByTestId("commission-failed").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await shot("09-commission-failure");
  mock.mode = "ok";
  await sendAndShow(page, shot, "success");
  await shot("10-commission-success");
});

await session("mobile", { ...devices["Pixel 7"] }, async ({ page, shot, settle }) => {
  await settle("/shop");
  await shot("11-shop", true);
  for (const slug of ["desert-eye-love", "horus-trace", "japanese-angel", "ankh-eye"]) {
    await settle(`/product/${slug}`);
    await shot(`12-product-${slug}`);
  }
  await settle("/commission");
  await shot("13-commission-opening");
  await shot("14-commission-full", true);
  await fillCommission(page);
  await page.getByTestId("file-previews").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await shot("15-commission-uploads");
  await sendAndShow(page, shot, "success");
  await shot("16-commission-success");
});

await session("narrow", { viewport: { width: 320, height: 720 }, hasTouch: true, isMobile: true }, async ({ page, shot, settle }) => {
  await settle("/commission");
  await fillCommission(page);
  await page.getByTestId("file-previews").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await shot("17-commission-320-uploads");
});

await browser.close();
console.log(`saved to ${out}`);
