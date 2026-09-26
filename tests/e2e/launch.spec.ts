import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { FIXTURE } from "./helpers";

// Launch preparation (26 September 2026): the owner's design renders on every shopping surface, and
// the commission request. Every commission send here goes through the development mock delivery, so
// nothing is emailed and nothing is stored outside this machine.

const PNG = { name: "portrait-grid.png", mimeType: "image/png", buffer: readFileSync(FIXTURE) };
const PDF = { name: "brief.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n") };
const EXE = { name: "setup.exe", mimeType: "application/x-msdownload", buffer: Buffer.from("MZ\x90\x00\x03\x00\x00\x00") };
const GIF = { name: "loop.gif", mimeType: "image/gif", buffer: Buffer.from("GIF89a\x01\x00\x01\x00") };
const BIG_PDF = { name: "huge.pdf", mimeType: "application/pdf", buffer: Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(4 * 1024 * 1024 + 10, 32)]) };

const RENDERED = ["desert-eye-love", "horus-trace", "japanese-angel", "ankh-eye"];

/** Routes this page's commission calls to the mock delivery, in a rate-limit bucket of its own. */
async function mockDelivery(page: Page, mode: "ok" | "fail-email" | (() => "ok" | "fail-email") = "ok") {
  const key = `e2e-${Math.random().toString(36).slice(2)}`;
  const uploads: string[] = [];
  await page.route("**/api/commission**", (route) => {
    if (route.request().url().includes("/upload")) uploads.push(route.request().url());
    const current = typeof mode === "function" ? mode() : mode;
    return route.continue({ headers: { ...route.request().headers(), "x-dermal-commission-mock": current, "x-dermal-test-key": key } });
  });
  return { uploads };
}

/** Opens the commission page once its controls can hold what is typed. */
async function openCommission(page: Page) {
  await page.goto("/commission");
  await expect(page.getByTestId("commission-form")).toHaveAttribute("data-ready", "true");
}

async function fillRequired(page: Page) {
  await page.getByLabel("Name").fill("Test Customer");
  await page.getByLabel("Email").fill("customer@example.com");
  await page.getByLabel("What do you want made?").fill("A small crescent in polished metal with a clear stone at the tip.");
  await page.getByLabel(/I confirm that I have the right/).check();
  await page.getByLabel(/I understand this is a design request/).check();
}

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

async function imagesLoaded(page: Page, selector: string) {
  const images = page.locator(selector);
  const count = await images.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    // The pieces drift forever, so they are never "stable": scroll them into view directly.
    await img.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), { timeout: 10_000 }).toBe(true);
  }
  return count;
}

test.describe("design renders", () => {
  test("every render file the catalogue names is served", async ({ request }) => {
    for (const family of ["desert-eye", "horus-trace", "japanese-angel", "ankh-eye"]) {
      for (const file of ["hero", "catalogue", "detail"]) {
        const response = await request.get(`/products/${family}/${file}.webp`);
        expect(response.status(), `${family}/${file}`).toBe(200);
        expect(response.headers()["content-type"]).toContain("image/webp");
      }
    }
  });

  test("the shop shows each render, loaded and never stretched", async ({ page }) => {
    await page.goto("/shop");
    const count = await imagesLoaded(page, '[data-testid="product-card"] [data-testid="piece-render"]');
    expect(count).toBe(RENDERED.length);
    for (const slug of RENDERED) {
      const img = page.locator(`[data-product="${slug}"] [data-testid="piece-render"]`);
      const fit = await img.evaluate((el: HTMLImageElement) => ({ fit: getComputedStyle(el).objectFit, w: el.naturalWidth, h: el.naturalHeight }));
      expect(fit.fit).toBe("contain");
      expect(fit.w).toBe(fit.h);
    }
    // Every other family keeps its approved drawn artwork.
    await expect(page.locator('[data-product="blade-trace"] [data-testid="piece-render"]')).toHaveCount(0);
    await expect(page.locator('[data-product="crossline"] [data-testid="piece-render"]')).toHaveCount(0);
    await noHorizontalScroll(page);
  });

  test("the homepage selection carries the renders and the new families", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("collection-section").scrollIntoViewIfNeeded();
    const entries = page.getByTestId("browse-entry");
    await expect(entries).toHaveCount(8);
    await expect(entries.last()).toHaveAttribute("data-entry", "kiri");
    for (const slug of RENDERED) {
      await expect(page.locator(`[data-entry="${slug}"] [data-testid="piece-render"]`)).toHaveCount(1);
    }
    // A family known only from its render can be viewed, never tried on.
    await expect(page.locator('[data-entry="ankh-eye"] [data-testid="browse-tryon"]')).toHaveCount(0);
    await expect(page.locator('[data-entry="horus-trace"] [data-testid="browse-tryon"]')).toHaveCount(1);
  });

  test("each rendered product page shows the render, says what it is, and loads", async ({ page }) => {
    for (const slug of RENDERED) {
      await page.goto(`/product/${slug}`);
      const stage = page.getByTestId("render-stage");
      await expect(stage).toBeVisible();
      await imagesLoaded(page, '[data-testid="render-stage-image"]');
      await expect(page.getByTestId("render-note")).toHaveText(/Design render · (concept · )?not photography of a made piece/);
      await page.getByTestId("render-view-detail").click();
      await expect(stage).toHaveAttribute("data-view", "detail");
      await imagesLoaded(page, '[data-testid="render-stage-image"]');
      await noHorizontalScroll(page);
    }
  });

  test("the stage fits the render without covering its controls", async ({ page, isMobile }) => {
    test.skip(isMobile, "the fixed-height stage is the desktop layout");
    await page.goto("/product/ankh-eye");
    const caption = await page.getByTestId("render-note").boundingBox();
    const modes = await page.getByRole("tablist", { name: "Ways to look at this piece" }).boundingBox();
    expect(caption && modes && caption.y + caption.height <= modes.y + 1).toBe(true);
  });

  test("a concept family has no try-on, no bag and no price", async ({ page }) => {
    await page.goto("/product/japanese-angel");
    await expect(page.getByTestId("try-it-on")).toHaveCount(0);
    await expect(page.getByTestId("add-to-bag")).toHaveCount(0);
    await expect(page.getByRole("tab", { name: "Try on" })).toHaveCount(0);
    await expect(page.getByTestId("family-price")).toContainText("Not for sale");
    await expect(page.getByTestId("purchase-unavailable")).toHaveText("Concept · not yet available");
    // Face Studio ignores it, even when asked by name.
    await page.goto("/face-studio?product=japanese-angel");
    await expect(page.getByText("JAPANESE ANGEL")).toHaveCount(0);
  });

  test("HORUS TRACE keeps its film as a view of its own", async ({ page }) => {
    await page.goto("/product/horus-trace");
    await page.getByRole("tab", { name: "In motion" }).click();
    await expect(page.getByTestId("product-stage")).toBeVisible();
  });
});

test.describe("navigation and catalogue", () => {
  test("the bar is Shop, Collections, Commission, Face Studio, About, then the bag", async ({ page, isMobile }) => {
    test.skip(isMobile, "the phone uses the menu");
    await page.goto("/shop");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("list").getByRole("link")).toHaveText(["Shop", "Collections", "Commission", "Face Studio", "About"]);
    await nav.getByRole("link", { name: "Commission" }).click();
    await expect(page).toHaveURL(/\/commission$/);
    await expect(nav.getByRole("link", { name: "Commission" })).toHaveAttribute("aria-current", "page");
  });

  test("the phone menu offers the commission", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone only");
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: /Commission/ }).click();
    await expect(page).toHaveURL(/\/commission$/);
  });

  test("the catalogue ends with one quiet way to commission", async ({ page }) => {
    for (const url of ["/shop", "/collections", "/product/crossline"]) {
      await page.goto(url);
      const cta = page.getByTestId("commission-cta");
      await expect(cta).toHaveCount(1);
      await expect(cta).toContainText("Can’t find what you want?");
      await expect(cta.getByRole("link", { name: /Commission your own/ })).toHaveAttribute("href", "/commission");
    }
  });
});

test.describe("commission page", () => {
  test("opens on the editorial heading and the start of the request", async ({ page }) => {
    await openCommission(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Commission\s*a piece/i);
    await expect(page.getByText("Your idea. Made for the face.")).toBeVisible();
    await page.getByTestId("start-request").click();
    await expect(page).toHaveURL(/#request$/);
    await expect(page.getByTestId("commission-form")).toBeInViewport();
    await noHorizontalScroll(page);
  });

  test("asks for the required fields and moves focus to the first one", async ({ page }) => {
    await mockDelivery(page);
    await openCommission(page);
    await page.getByTestId("commission-submit").click();
    for (const key of ["name", "email", "description", "rights", "acknowledge"]) await expect(page.getByTestId(`error-${key}`)).toBeVisible();
    await expect(page.getByLabel("Name")).toBeFocused();
    await expect(page.getByTestId("commission-success")).toHaveCount(0);
  });

  test("refuses an email address that is not complete", async ({ page }) => {
    await openCommission(page);
    await fillRequired(page);
    await page.getByLabel("Email").fill("customer@example");
    await page.getByTestId("commission-submit").click();
    await expect(page.getByTestId("error-email")).toHaveText("That email address doesn’t look complete.");
    await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
  });

  test("refuses files that are not pictures or PDFs, and PDFs over the limit", async ({ page }) => {
    await openCommission(page);
    await page.getByTestId("file-input").setInputFiles([EXE, GIF]);
    await expect(page.getByTestId("file-notice")).toContainText("setup.exe: only JPG, PNG, WEBP or PDF");
    await expect(page.getByTestId("file-notice")).toContainText("loop.gif");
    await page.getByTestId("file-input").setInputFiles([BIG_PDF]);
    await expect(page.getByTestId("file-notice")).toContainText("huge.pdf: larger than 4.0 MB");
    await expect(page.getByTestId("file-preview")).toHaveCount(0);
  });

  test("takes several files, previews them and lets one be removed", async ({ page }) => {
    await openCommission(page);
    const input = page.getByTestId("file-input");
    await expect(input).toHaveAttribute("multiple", "");
    await expect(input).toHaveAttribute("accept", "image/*,.pdf");
    await expect(input).not.toHaveAttribute("capture", /.*/);
    await input.setInputFiles([PNG, PDF]);
    await expect(page.getByTestId("file-preview")).toHaveCount(2);
    await expect(page.getByAltText("Preview of portrait-grid.png")).toBeVisible();
    await page.getByRole("button", { name: "Remove portrait-grid.png" }).click();
    await expect(page.getByTestId("file-preview")).toHaveCount(1);
    await expect(page.getByTestId("file-notice")).toHaveText("portrait-grid.png removed.");
    await noHorizontalScroll(page);
  });

  test("accepts files dropped onto the upload area", async ({ page }) => {
    await openCommission(page);
    const drop = page.getByTestId("commission-dropzone");
    const transfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(["%PDF-1.4\n%%EOF"], "dropped-sketch.pdf", { type: "application/pdf" }));
      return dt;
    });
    await drop.dispatchEvent("dragenter", { dataTransfer: transfer });
    await expect(drop).toHaveAttribute("data-dragging", "true");
    await drop.dispatchEvent("drop", { dataTransfer: transfer });
    await expect(drop).toHaveAttribute("data-dragging", "false");
    await expect(page.getByTestId("file-preview")).toHaveCount(1);
    await expect(page.getByTestId("file-preview")).toContainText("dropped-sketch.pdf");
  });

  test("sends a request with references and shows its reference", async ({ page }) => {
    const { uploads } = await mockDelivery(page);
    await openCommission(page);
    await fillRequired(page);
    await page.getByTestId("choices-placement").getByText("Anti-eyebrow", { exact: true }).click();
    await page.getByTestId("choices-budget").getByText("Not sure", { exact: true }).click();
    await page.getByTestId("file-input").setInputFiles([PNG, PDF]);
    await page.getByTestId("commission-submit").click();
    const success = page.getByTestId("commission-success");
    await expect(success).toBeVisible({ timeout: 20_000 });
    await expect(success.getByRole("heading", { name: "Request received" })).toBeFocused();
    await expect(page.getByTestId("commission-reference")).toHaveText(/^DRM-C-[2-9A-HJKMNP-Z]{5}$/);
    await expect(success).toContainText("We’ve received your concept.");
    await expect(success.getByRole("link", { name: "Back to shop" })).toHaveAttribute("href", "/shop");
    await expect(success.getByRole("link", { name: /View collection/ })).toHaveAttribute("href", "/collections");
    expect(uploads).toHaveLength(2);
  });

  test("never shows success when the email fails, keeps everything, and retries without re-uploading", async ({ page }) => {
    let mode: "ok" | "fail-email" = "fail-email";
    const { uploads } = await mockDelivery(page, () => mode);
    await openCommission(page);
    await fillRequired(page);
    await page.getByTestId("file-input").setInputFiles([PNG]);
    await page.getByTestId("commission-submit").click();
    await expect(page.getByTestId("commission-failed")).toHaveText(
      "We couldn’t send your request. Your files have not been lost from this page. Please try again.",
      { timeout: 20_000 },
    );
    await expect(page.getByTestId("commission-success")).toHaveCount(0);
    await expect(page.getByLabel("Name")).toHaveValue("Test Customer");
    await expect(page.getByLabel("What do you want made?")).toHaveValue(/crescent/);
    await expect(page.getByTestId("file-preview")).toHaveCount(1);
    expect(uploads).toHaveLength(1);

    mode = "ok";
    await page.getByTestId("commission-submit").click();
    await expect(page.getByTestId("commission-success")).toBeVisible({ timeout: 20_000 });
    expect(uploads).toHaveLength(1);
  });

  test("the server checks every field itself and refuses a burst", async ({ request }) => {
    const headers = { "x-dermal-commission-mock": "ok", "x-dermal-test-key": `e2e-server-${Date.now()}` };
    const invalid = await request.post("/api/commission", { headers, data: { fields: { name: "", email: "x@y", description: "hi" }, files: [] } });
    expect(invalid.status()).toBe(422);
    const json = await invalid.json();
    expect(Object.keys(json.errors)).toEqual(expect.arrayContaining(["name", "email", "description", "rights", "acknowledge"]));
    const statuses = [];
    for (let i = 0; i < 5; i++) statuses.push((await request.post("/api/commission", { headers, data: { fields: {}, files: [] } })).status());
    expect(statuses.at(-1)).toBe(429);
    const exe = await request.post("/api/commission/upload", { headers: { ...headers, "x-dermal-test-key": `${headers["x-dermal-test-key"]}-u` }, multipart: { file: EXE } });
    expect(exe.status()).toBe(415);
  });

  test("works from the keyboard alone", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard");
    await mockDelivery(page);
    await openCommission(page);
    await page.getByLabel("Name").focus();
    await page.keyboard.type("Keyboard Customer");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Email")).toBeFocused();
    await page.keyboard.type("keys@example.com");
    // Placement radios: arrow keys move the choice.
    await page.getByRole("radio", { name: "Anti-eyebrow" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Dermal" })).toBeChecked();
    await page.getByLabel("What do you want made?").focus();
    await page.keyboard.type("Initials K and C, joined, in a dark metal.");
    await page.getByLabel(/I confirm that I have the right/).focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Space");
    await page.getByTestId("commission-submit").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("commission-success")).toBeVisible({ timeout: 20_000 });
  });

  test("choose files is a real button, and focus is visible on it", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard");
    await openCommission(page);
    const choose = page.getByTestId("choose-files");
    await choose.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(choose).toBeFocused();
    const chooser = page.waitForEvent("filechooser");
    await page.keyboard.press("Enter");
    expect((await chooser).isMultiple()).toBe(true);
  });

  test("on a phone: library and camera are separate, nothing overflows", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone only");
    await openCommission(page);
    await expect(page.getByTestId("take-photo")).toBeVisible();
    await expect(page.getByTestId("camera-input")).toHaveAttribute("capture", "environment");
    // The library button never forces the camera.
    await expect(page.getByTestId("file-input")).not.toHaveAttribute("capture", /.*/);
    await page.getByTestId("file-input").setInputFiles([PNG, PDF, { ...PNG, name: "second.png" }]);
    await expect(page.getByTestId("file-preview")).toHaveCount(3);
    const textarea = await page.getByLabel("What do you want made?").boundingBox();
    expect(textarea!.height).toBeGreaterThanOrEqual(150);
    await noHorizontalScroll(page);
    for (const button of await page.locator(".commission-form button:visible").all()) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(43);
      expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    }
  });

  test("a desktop gets the drop target, not a camera button", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    await openCommission(page);
    await expect(page.getByTestId("take-photo")).toBeHidden();
    await expect(page.getByText("Drop sketches, photos or a PDF here, or")).toBeVisible();
  });
});

test.describe("commission at 320 px", () => {
  test.use({ viewport: { width: 320, height: 720 } });
  test("the page and a full upload state fit without sideways scroll", async ({ page }) => {
    await openCommission(page);
    await noHorizontalScroll(page);
    await fillRequired(page);
    await page.getByTestId("file-input").setInputFiles([PNG, PDF, { ...PNG, name: "a-very-long-reference-file-name-from-a-phone-camera-roll.png" }]);
    await expect(page.getByTestId("file-preview")).toHaveCount(3);
    await noHorizontalScroll(page);
  });
});
