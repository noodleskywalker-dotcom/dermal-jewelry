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
    note(share <= 0.2, `companion is ${Math.round(box.width)}px of ${view.width}px wide (${Math.round(share * 100)}%)`);
    note(box.height <= view.height * 0.12, `companion is ${Math.round(box.height)}px of ${view.height}px tall`);
    note(view.height - (box.y + box.height) < 40, "companion sits in the lower corner");
    // Smaller, but still a target a thumb can find.
    const tap = await page.getByTestId("mascot").boundingBox();
    note(tap.height >= 44 && tap.width >= 44, `companion tap target ${Math.round(tap.width)} x ${Math.round(tap.height)}px`);
  } else {
    console.log("--    no companion on this machine (internal art absent)");
  }

  // 8 (polish): perceived mass inside the equal stages. Ink bounds, not element boxes: an SVG is
  //    measured with getBBox and an image by scanning its alpha, so transparent padding is ignored.
  const mass = await page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="product-card"]')].map((el) => {
      const stage = el.querySelector(".piece-object").getBoundingClientRect();
      const boxes = [];
      for (const span of [...el.querySelectorAll(".fo-art > span")].filter((s) => s.querySelector("img, svg"))) {
        const r = span.getBoundingClientRect();
        const svg = span.querySelector("svg");
        if (svg && svg.viewBox.baseVal && svg.viewBox.baseVal.width) {
          const vb = svg.viewBox.baseVal;
          const bb = svg.getBBox();
          const sx = r.width / vb.width;
          const sy = r.height / vb.height;
          boxes.push({ left: r.left + bb.x * sx, right: r.left + (bb.x + bb.width) * sx, top: r.top + bb.y * sy, bottom: r.top + (bb.y + bb.height) * sy });
          continue;
        }
        const img = span.querySelector("img");
        if (!img || !img.naturalWidth) {
          boxes.push(r);
          continue;
        }
        const cv = document.createElement("canvas");
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
        const ctx = cv.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
        let x0 = cv.width;
        let y0 = cv.height;
        let x1 = 0;
        let y1 = 0;
        for (let y = 0; y < cv.height; y += 1)
          for (let x = 0; x < cv.width; x += 1)
            if (d[(y * cv.width + x) * 4 + 3] > 24) {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
        if (x1 < x0) {
          boxes.push(r);
          continue;
        }
        boxes.push({ left: r.left + (x0 / cv.width) * r.width, right: r.left + ((x1 + 1) / cv.width) * r.width, top: r.top + (y0 / cv.height) * r.height, bottom: r.top + ((y1 + 1) / cv.height) * r.height });
      }
      const w = Math.max(...boxes.map((b) => b.right)) - Math.min(...boxes.map((b) => b.left));
      const h = Math.max(...boxes.map((b) => b.bottom)) - Math.min(...boxes.map((b) => b.top));
      const left = Math.min(...boxes.map((b) => b.left));
      const right = Math.max(...boxes.map((b) => b.right));
      return [
        el.getAttribute("data-product"),
        {
          // Along its own axis: what stops a thin piece looking lost.
          longest: Math.round((Math.max(w, h) / stage.width) * 100),
          // Geometric mean: the ink on the page. A thin form is honestly lighter than a broad one.
          mass: Math.round((Math.sqrt(w * h) / stage.width) * 100),
          inside: left >= stage.left - 1 && right <= stage.right + 1,
        },
      ];
    }),
  );
  const ink = Object.fromEntries(mass);
  for (const [product, m] of mass) {
    note(m.longest >= 68 && m.longest <= 95, `${product} reads at ${m.longest}% of its stage along its own axis`);
    note(m.mass >= 40, `${product} carries ${m.mass}% ink mass`);
    note(m.inside, `${product} is drawn inside its stage and is never clipped`);
  }
  note(
    ink["horus-trace"].longest >= ink["desert-eye-love"].longest,
    `HORUS TRACE reads at least as large as DESERT EYE (${ink["horus-trace"].longest}% vs ${ink["desert-eye-love"].longest}%)`,
  );

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
