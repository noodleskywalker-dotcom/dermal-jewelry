// Measures the owner's seven checks for the catalogue rebalance and prints what it found, so the
// report carries numbers instead of assurances. Read-only: it navigates and measures, nothing else.
// Run while a dev server is up:  node tests/e2e/verify-rebalance.mjs
import { chromium, devices } from "@playwright/test";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch();

const ROUTES = [
  "/",
  "/shop",
  "/shop?view=even",
  "/shop?browse=men",
  "/shop?browse=women",
  "/shop?browse=inspired",
  "/shop?browse=original",
  "/shop?browse=limited",
  "/collections",
  "/product/desert-eye-love",
  "/product/horus-trace",
  "/face-studio",
  "/cart",
  "/about",
];

const SIZES = [
  { name: "desktop 1440", options: { viewport: { width: 1440, height: 900 } } },
  { name: "narrow 320", options: { viewport: { width: 320, height: 568 } } },
  { name: "Pixel 7", options: { ...devices["Pixel 7"] } },
];

const fail = [];
const note = (ok, line) => {
  if (!ok) fail.push(line);
  console.log(`${ok ? "ok  " : "FAIL"}  ${line}`);
};

for (const size of SIZES) {
  const context = await browser.newContext(size.options);
  const page = await context.newPage();
  console.log(`\n== ${size.name} ==`);

  // 4: no sideways body overflow, on every route.
  for (const route of ROUTES) {
    await page.goto(`${base}${route}`);
    await page.waitForLoadState("networkidle").catch(() => undefined);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    note(over <= 1, `no sideways overflow on ${route} (${over}px)`);
  }

  // 1: DESERT EYE is not larger than HORUS TRACE in the catalogue.
  await page.goto(`${base}/shop`);
  await page.waitForLoadState("networkidle").catch(() => undefined);
  const stages = await page.getByTestId("product-card").evaluateAll((els) =>
    Object.fromEntries(els.map((el) => [el.getAttribute("data-product"), Math.round(el.querySelector(".piece-object").getBoundingClientRect().width)])),
  );
  note(
    stages["desert-eye-love"] <= stages["horus-trace"],
    `catalogue stage: DESERT EYE ${stages["desert-eye-love"]}px vs HORUS TRACE ${stages["horus-trace"]}px`,
  );
  const all = Object.values(stages);
  note(Math.max(...all) / Math.min(...all) <= 1.35, `widest stage / narrowest = ${(Math.max(...all) / Math.min(...all)).toFixed(2)}`);

  // 5: every product name fits its column and stays inside the page.
  const names = await page.getByTestId("product-card").evaluateAll((els) =>
    els.map((el) => {
      const h = el.querySelector(".font-display");
      const r = h.getBoundingClientRect();
      return { name: h.textContent, clipped: h.scrollWidth > h.clientWidth + 1, right: Math.round(r.right), page: document.documentElement.clientWidth };
    }),
  );
  for (const n of names) note(!n.clipped && n.right <= n.page + 1, `name fits: ${n.name} (right ${n.right} of ${n.page})`);

  // 2: the companion is small and stays in his corner.
  const mascot = await page.getByTestId("global-mascot").count();
  if (mascot) {
    const box = await page.getByTestId("global-mascot").boundingBox();
    const view = page.viewportSize();
    const share = box.width / view.width;
    note(share <= 0.3, `companion is ${Math.round(box.width)}px of ${view.width}px wide (${Math.round(share * 100)}%)`);
    note(box.height <= view.height * 0.12, `companion is ${Math.round(box.height)}px of ${view.height}px tall`);
    note(view.height - (box.y + box.height) < 40, "companion sits in the lower corner");
  } else {
    console.log("--    no companion on this machine (internal art absent)");
  }

  // 3: sand only where DESERT EYE is the subject.
  for (const [route, expected] of [
    ["/shop", 0],
    ["/shop?browse=inspired", 0],
    ["/cart", 0],
    ["/face-studio", 0],
    ["/product/horus-trace", 0],
    ["/product/crossline", 0],
    ["/collections", 1],
    ["/product/desert-eye-love?form=micro-dermal", 1],
  ]) {
    await page.goto(`${base}${route}`);
    await page.waitForLoadState("networkidle").catch(() => undefined);
    const count = await page.getByTestId("sand-layer").count();
    note(count === expected, `sand layers on ${route}: ${count} (expected ${expected})`);
  }

  // 6: KIRI is a concept and nothing else.
  await page.goto(`${base}/shop`);
  const kiri = page.locator('[data-concept="KIRI"]');
  const kiriText = await kiri.innerText();
  note(/concept/i.test(kiriText) && /not a product/i.test(kiriText), `KIRI reads: ${kiriText.replace(/\s+/g, " ").slice(0, 96)}`);
  note((await kiri.getByRole("link").count()) === 0 && !/QAR|\d{2,}/.test(kiriText), "KIRI has no link and no price");
  note(/^8 pieces$/i.test((await page.getByTestId("catalogue-count").innerText()).trim()), "KIRI is not counted among the pieces");

  // 7: the limited edition invents nothing.
  await page.goto(`${base}/shop?browse=limited`);
  const empty = await page.getByTestId("shop-empty").innerText();
  note(
    (await page.getByTestId("product-card").count()) === 0 && empty.includes("No limited edition has been announced"),
    `limited edition: ${empty.replace(/\s+/g, " ")}`,
  );

  await context.close();
}

await browser.close();
console.log(`\n${fail.length === 0 ? "All checks passed." : `${fail.length} checks FAILED:`}`);
for (const line of fail) console.log(`  - ${line}`);
process.exit(fail.length === 0 ? 0 : 1);
