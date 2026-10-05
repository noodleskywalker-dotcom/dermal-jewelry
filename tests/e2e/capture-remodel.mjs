// Captures the October remodel review set: the product renders on every
// shopping surface and the commission page. Browser emulation only. Commission sends go through the
// development mock delivery, so nothing is emailed and nothing is stored outside this machine.
// Run while a dev server is up:  node tests/e2e/capture-remodel.mjs
import { chromium, devices } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const out = fileURLToPath(new URL("../../docs/screenshots/astra-remodel/", import.meta.url));
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
  const shot = async (file, full = false, region) => {
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
    await page.waitForFunction(() => Array.from(document.images).filter((img) => { const r = img.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; }).every((img) => img.complete && img.naturalWidth > 0), null, { timeout: 10000 });
    await page.waitForTimeout(900);
    if (region) await region.screenshot({ path: `${out}${name}-${file}.png` });
    else await page.screenshot({ path: `${out}${name}-${file}.png`, fullPage: full });
  };
  const settle = async (url) => {
    await page.goto(`${base}${url}`);
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.addStyleTag({ content: "nextjs-portal { display: none; }" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (overflow) throw new Error(`Horizontal overflow at ${url}`);
  };
  await steps({ page, shot, settle, mock });
  await context.close();
}

async function railTo(page, slug) {
  for (let i = 0; i < 10; i += 1) {
    if ((await page.locator('[data-testid="selection-slide"][data-current="true"]').getAttribute("data-product")) === slug) return;
    await page.getByTestId("selection-next").click();
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
  await shot("00-home-hero");
  await page.getByTestId("scrub-hero").scrollIntoViewIfNeeded();
  await shot("00b-home-reveal");
  await page.getByTestId("collection-section").evaluate((el) => el.scrollIntoView({ block: "start" }));
  await shot("01-home-selection-desert-eye", false, page.getByTestId("collection-section"));
  for (const slug of ["horus-trace", "blade-trace", "crossline"]) {
    await railTo(page, slug);
    await page.getByTestId("collection-section").evaluate((el) => el.scrollIntoView({ block: "start" }));
    await shot(`02-home-selection-${slug}`, false, page.getByTestId("collection-section"));
  }

  await page.getByTestId("home-commission").scrollIntoViewIfNeeded();
  await shot("02b-home-commission");
  for (const route of ["shop", "collections", "face-studio", "cart", "about"]) {
    await settle(`/${route}`);
    await shot(`03-${route}`);
  }

  for (const slug of ["desert-eye-love", "horus-trace", "blade-trace", "crossline", "ankh-trace", "japanese-angel", "ankh-eye"]) {
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
  await settle("/");
  await shot("18-home");
  await page.getByTestId("collection-section").scrollIntoViewIfNeeded();
  await shot("19-selection");
  for (const route of ["shop", "collections", "face-studio", "cart"]) {
    await settle(`/${route}`);
    await shot(`20-${route}`);
  }
  for (const slug of ["desert-eye-love", "horus-trace", "blade-trace", "crossline", "ankh-trace", "japanese-angel", "ankh-eye"]) {
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
  for (const slug of ["blade-trace", "crossline", "ankh-trace"]) {
    await settle(`/product/${slug}`);
    await shot(`product-${slug}`);
  }
  await settle("/commission");
  await fillCommission(page);
  await page.getByTestId("file-previews").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await shot("17-commission-320-uploads");
});

await browser.close();
console.log(`saved to ${out}`);
