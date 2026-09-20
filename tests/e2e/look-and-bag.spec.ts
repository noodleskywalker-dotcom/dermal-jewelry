import { expect, test } from "@playwright/test";
import { mouseDrag, openStudioWithPhoto } from "./helpers";

test("build a look, handle a conflict, and carry it into the demo bag", async ({ page }) => {
  await openStudioWithPhoto(page);
  await expect(page.getByTestId("look-item")).toHaveCount(1);
  await expect(page.getByTestId("look-item").first()).toContainText("Anti-eyebrow form · wearer’s left");

  // Add a dermal piece on the other side.
  await page.getByTestId("add-product").selectOption({ label: "CRIMSON ORBIT" });
  await page.getByTestId("add-side").selectOption("right");
  await page.getByTestId("add-piece").click();
  await expect(page.getByTestId("look-item")).toHaveCount(2);
  await expect(page.getByTestId("placed-item")).toHaveCount(2);

  // Same placement and side again asks before stacking overlays.
  await page.getByTestId("add-product").selectOption({ label: "VOID STUD" });
  await page.getByTestId("add-piece").click();
  await expect(page.getByTestId("conflict")).toBeVisible();
  await page.getByTestId("conflict-replace").click();
  await expect(page.getByTestId("look-item")).toHaveCount(2);
  await expect(page.locator('[data-testid="look-item"][data-product="void-stud"]')).toHaveCount(1);
  await expect(page.locator('[data-testid="look-item"][data-product="crimson-orbit"]')).toHaveCount(0);

  // The pair is one product: two pieces on screen, one bag line.
  await page.getByTestId("add-look-to-bag").click();
  await expect(page.getByTestId("bag-line")).toHaveCount(2);
  await expect(page.getByTestId("bag-subtotal")).toHaveText("QAR 580");

  const heroLine = page.locator('[data-testid="bag-line"][data-product="desert-eye-love"]');
  await heroLine.getByRole("button", { name: /Increase quantity/ }).click();
  await expect(heroLine.getByTestId("bag-quantity")).toContainText("2");
  await expect(page.getByTestId("bag-subtotal")).toHaveText("QAR 970");
  await expect(page.getByTestId("open-bag")).toContainText("(3)");

  await expect(page.getByRole("button", { name: "Checkout unavailable in preview" })).toBeDisabled();

  await heroLine.getByRole("button", { name: /^Remove/ }).click();
  await expect(page.getByTestId("bag-subtotal")).toHaveText("QAR 190");
  await page.locator('[data-testid="bag-line"]').getByRole("button", { name: /^Remove/ }).click();
  await expect(page.getByTestId("bag-empty")).toBeVisible();

  // Escape closes the drawer and focus returns to the page.
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Demo bag" })).toBeHidden();

  // Removing pieces from the look.
  await page.getByTestId("remove-piece").first().click();
  await page.getByTestId("remove-piece").first().click();
  await expect(page.getByTestId("look-empty")).toBeVisible();
  await expect(page.getByTestId("placed-item")).toHaveCount(0);
});

test("the bag survives a reload and the full bag page agrees with the drawer", async ({ page }) => {
  await page.goto("/product/desert-eye-love");
  await page.getByTestId("add-to-bag").click();
  await expect(page.getByTestId("bag-subtotal")).toHaveText("QAR 390");
  await page.goto("/cart");
  await expect(page.getByTestId("bag-line")).toHaveCount(1);
  await expect(page.getByTestId("bag-subtotal")).toHaveText("QAR 390");
});

test("nothing about the photo leaves the browser", async ({ page, baseURL }) => {
  const requests: { url: string; method: string; hasBody: boolean }[] = [];
  page.on("request", (r) => {
    const url = r.url();
    if (url.startsWith("blob:") || url.startsWith("data:")) return;
    requests.push({ url, method: r.method(), hasBody: r.postData() !== null });
  });
  const sockets: string[] = [];
  page.on("websocket", (ws) => {
    ws.on("framesent", (f) => sockets.push(String(f.payload).slice(0, 200)));
  });

  await openStudioWithPhoto(page);
  const mark = requests.length;

  await mouseDrag(page, page.getByTestId("placed-item"), -40, 30);
  await page.getByTestId("scale").fill("20");
  await page.locator('[data-testid="studio-product"][data-product="sand-vortex"]').click();
  await page.getByTestId("add-look-to-bag").click();
  await page.keyboard.press("Escape");
  await page.getByTestId("clear-photo").click();

  const origin = new URL(baseURL!).origin;
  for (const r of requests) {
    // Only ordinary page and asset loads from this site. No uploads of any kind.
    expect(r.url.startsWith(origin) || r.url.startsWith("https://fonts.")).toBe(true);
    expect(r.hasBody).toBe(false);
    expect(["GET", "HEAD"]).toContain(r.method);
    expect(r.url).not.toContain("geometric-portrait");
  }
  // Selecting and editing the photo caused no network requests at all.
  const during = requests.slice(mark).filter((r) => !r.url.includes("/_next/") && !r.url.includes("__nextjs"));
  expect(during).toEqual([]);
  // Dev-server hot-reload socket traffic must not carry image data either.
  expect(sockets.join("")).not.toMatch(/blob:|base64|geometric-portrait/);
});
