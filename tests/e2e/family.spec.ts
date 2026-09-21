import { expect, test, type Page } from "@playwright/test";
import { FIXTURE, mouseDrag, relativeCentre } from "./helpers";

const FAMILY = "/product/desert-eye-love";

// The visually hidden radio is operated through its label, the way a customer does it.
const chooseForm = (page: Page, formId: string) => page.locator("label", { has: page.getByTestId(`form-${formId}`) }).click();
const tab = (page: Page, name: string) => page.getByRole("tab", { name });

test.describe("design family: piercing forms", () => {
  test("changing form updates identifier, visual, piece count, preview, price, package and address", async ({ page }) => {
    await page.goto(FAMILY);
    const family = page.getByTestId("family");
    await expect(family).toHaveAttribute("data-form", "anti-eyebrow");
    await expect(page.getByTestId("family-price")).toContainText("QAR 390");
    await expect(page.getByTestId("family-package")).toContainText("two decorative tops");

    await tab(page, "Placement preview").click();
    const preview = page.getByTestId("placement-preview");
    await expect(preview).toHaveAttribute("data-placement", "anti-eyebrow");
    await expect(preview.getByTestId("placement-piece")).toHaveCount(2);
    // Measured relative to the preview, because choosing a form can scroll the page on a phone.
    const relativeY = async () => {
      const frame = (await preview.boundingBox())!;
      const piece = (await preview.getByTestId("placement-piece").first().boundingBox())!;
      return (piece.y - frame.y) / frame.height;
    };
    const pairY = await relativeY();

    await chooseForm(page, "micro-dermal");
    await expect(family).toHaveAttribute("data-form", "micro-dermal");
    await expect(page.getByTestId("family-price")).toContainText("QAR 220");
    await expect(page.getByTestId("family-package")).toContainText("one decorative top");
    await expect(page.getByTestId("family-form-note")).toContainText("Not manufacturing-ready");
    await expect(preview).toHaveAttribute("data-placement", "dermal");
    // One piece now, in a different place: not the pair shrunk down.
    await expect(preview.getByTestId("placement-piece")).toHaveCount(1);
    expect(await relativeY()).toBeGreaterThan(pairY + 0.04);
    await expect(page).toHaveURL(/form=micro-dermal/);
  });

  test("a form without a demo configuration is shown as concept pending and cannot be chosen", async ({ page }) => {
    const ORBIT = "/product/crimson-orbit";
    await page.goto(ORBIT);
    await expect(page.getByTestId("form-anti-eyebrow")).toBeDisabled();
    await expect(page.locator("label", { has: page.getByTestId("form-anti-eyebrow") })).toContainText("Concept pending");
    // Asking for it by address falls back to the default instead of inventing an anti-eyebrow form.
    await page.goto(`${ORBIT}?form=anti-eyebrow`);
    await expect(page.getByTestId("family")).toHaveAttribute("data-form", "micro-dermal");
  });

  test("a product and form address opens on that form", async ({ page }) => {
    await page.goto(`${FAMILY}?form=micro-dermal`);
    await expect(page.getByTestId("family")).toHaveAttribute("data-form", "micro-dermal");
    await expect(page.getByTestId("form-micro-dermal")).toBeChecked();
  });

  test("the chosen form holds across every view, through a reveal, and into the bag", async ({ page }) => {
    await page.goto(`${FAMILY}?revealFixture=1`);
    await chooseForm(page, "micro-dermal");

    await expect(page.getByTestId("reveal-player")).toHaveAttribute("data-form", "micro-dermal");
    await tab(page, "Placement preview").click();
    await expect(page.getByTestId("placement-preview")).toHaveAttribute("data-form", "micro-dermal");
    await tab(page, "Try on your face").click();
    await expect(page.getByTestId("tryon-preview")).toHaveAttribute("data-form", "micro-dermal");
    await tab(page, "Concept reveal").click();
    await expect(page.getByTestId("family")).toHaveAttribute("data-form", "micro-dermal");

    await page.getByTestId("add-to-bag").click();
    await page.keyboard.press("Escape");
    await chooseForm(page, "anti-eyebrow");
    await page.getByTestId("add-to-bag").click();

    // Two forms of one design are two lines, each with its own label and price.
    const lines = page.getByTestId("bag-line");
    await expect(lines).toHaveCount(2);
    await expect(page.locator('[data-testid="bag-line"][data-form="micro-dermal"]')).toContainText("Micro dermal form");
    await expect(page.locator('[data-testid="bag-line"][data-form="anti-eyebrow"]')).toContainText("Anti-eyebrow form");
    await expect(page.getByTestId("bag-subtotal")).toHaveText("QAR 610");
    await page.locator('[data-testid="bag-line"][data-form="micro-dermal"]').getByRole("button", { name: /Increase quantity/ }).click();
    await expect(page.locator('[data-testid="bag-line"][data-form="anti-eyebrow"]').getByTestId("bag-quantity")).toContainText("1");
    await expect(page.getByTestId("bag-subtotal")).toHaveText("QAR 830");
  });

  test("the original piece has working forms too, including a nose form on the nose", async ({ page }) => {
    await page.goto("/product/crimson-orbit");
    await expect(page.getByText("Original design")).toBeVisible();
    await expect(page.getByTestId("form-anti-eyebrow")).toBeDisabled();
    await tab(page, "Placement preview").click();
    const preview = page.getByTestId("placement-preview");
    const cheek = await preview.getByTestId("placement-piece").boundingBox();
    await chooseForm(page, "nose");
    await expect(preview).toHaveAttribute("data-placement", "nostril");
    const nose = await preview.getByTestId("placement-piece").boundingBox();
    expect(nose!.x).toBeLessThan(cheek!.x - 20);
    expect(nose!.width).toBeLessThan(cheek!.width);
    await expect(page.getByTestId("family-price")).toContainText("QAR 190");
  });
});

test.describe("forms in Face Studio", () => {
  test("switching form keeps the photo, changes the pieces and keeps each form's own placement", async ({ page }) => {
    const uploads: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET" && !r.url().includes("__nextjs")) uploads.push(`${r.method()} ${r.url()}`);
    });

    await page.goto(`${FAMILY}?form=micro-dermal`);
    await page.getByTestId("try-it-on").click();
    await expect(page).toHaveURL(/face-studio\?product=desert-eye-love&form=micro-dermal/);
    await page.getByTestId("photo-input").first().setInputFiles(FIXTURE);
    const item = page.getByTestId("placed-item");
    await expect(item).toHaveCount(1);
    await expect(page.getByTestId("piece-symbol")).toHaveCount(1);
    await expect(page.getByTestId("piece-gemstone")).toHaveCount(0);
    const src = await page.getByTestId("photo-frame").getByTestId("studio-photo").getAttribute("src");

    await mouseDrag(page, item, 30, 25);
    const dermalPlaced = await relativeCentre(page, item);

    await page.getByTestId("studio-form-anti-eyebrow").click();
    await expect(page.getByTestId("piece-gemstone")).toHaveCount(1);
    const pair = await relativeCentre(page, item);
    // The pair starts from its own anti-eyebrow default, not from the cheek position.
    expect(pair.y).toBeLessThan(dermalPlaced.y - 0.03);
    expect(await page.getByTestId("photo-frame").getByTestId("studio-photo").getAttribute("src")).toBe(src);

    await page.getByTestId("studio-form-micro-dermal").click();
    const back = await relativeCentre(page, item);
    expect(back.x).toBeCloseTo(dermalPlaced.x, 2);
    expect(back.y).toBeCloseTo(dermalPlaced.y, 2);

    await expect(page.getByTestId("studio-form-nose")).toBeEnabled();
    await expect(page.getByTestId("look-item")).toContainText("Micro dermal form");
    expect(uploads).toEqual([]);
  });
});

test.describe("concept reveal", () => {
  test("without approved media it is a deliberate still, never a broken player", async ({ page }) => {
    const media: string[] = [];
    page.on("request", (r) => /\.(webm|mp4|mov)(\?|$)/.test(r.url()) && media.push(r.url()));
    await page.goto(FAMILY);
    const player = page.getByTestId("reveal-player");
    await expect(player).toBeVisible();
    await expect(page.getByTestId("reveal-status")).toContainText("Reveal in preparation");
    await expect(page.getByTestId("reveal-watch")).toHaveCount(0);
    await expect(page.getByTestId("reveal-video")).toHaveCount(0);
    // Shopping is never blocked by it.
    await expect(page.getByTestId("add-to-bag")).toBeEnabled();
    await expect(page.getByTestId("try-it-on")).toBeVisible();
    expect(media).toEqual([]);
  });

  test("hover never starts a reveal and no media loads until it is asked for", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover is a desktop pointer behaviour");
    const media: string[] = [];
    page.on("request", (r) => r.url().includes("reveal-test-pattern") && media.push(r.url()));
    await page.goto(`${FAMILY}?revealFixture=1`);
    await page.getByTestId("reveal-player").hover();
    await page.waitForTimeout(800);
    await expect(page.getByTestId("reveal-player")).toHaveAttribute("data-state", "idle");
    await expect(page.getByTestId("reveal-video")).toHaveCount(0);
    expect(media).toEqual([]);
  });

  test("media that fails to load falls back to the still with a clear message", async ({ page }) => {
    await page.goto(`${FAMILY}?revealFixture=missing`);
    await page.getByTestId("reveal-watch").click();
    await expect(page.getByTestId("reveal-status")).toContainText("couldn't play");
    await expect(page.getByTestId("reveal-player")).toHaveAttribute("data-state", "failed");
    await expect(page.getByTestId("reveal-watch")).toBeVisible();
    await expect(page.getByTestId("add-to-bag")).toBeEnabled();
  });

  test("reduced motion offers the still only", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${FAMILY}?revealFixture=1`);
    await expect(page.getByTestId("reveal-status")).toContainText("Reduced motion is on");
    await expect(page.getByTestId("reveal-watch")).toHaveCount(0);
  });

  test("the local stills prototype plays, skips, replays and ends on the chosen form", async ({ page }) => {
    // The two stills are internal and gitignored. The sequence must behave the same when they are absent.
    await page.goto(`${FAMILY}?revealFixture=concept&form=micro-dermal`);
    const player = page.getByTestId("reveal-player");
    await expect(page.getByTestId("reveal-concept-tag")).toContainText("not the final cinematic");
    await expect(player).toHaveAttribute("data-state", "idle");
    await expect(page.getByTestId("reveal-concept")).toHaveCount(0);

    await page.getByTestId("reveal-watch").click();
    await expect(player).toHaveAttribute("data-state", "playing");
    await expect(page.getByTestId("reveal-skip")).toBeVisible();
    await expect(page.getByTestId("reveal-video")).toHaveCount(0);
    await page.getByTestId("reveal-skip").click();
    await expect(page.getByTestId("reveal-final")).toHaveAttribute("data-form", "micro-dermal");

    // Replayed and left alone, it ends by itself at about 5.5 seconds and then shows the jewelry.
    await page.getByTestId("reveal-replay").click();
    await expect(player).toHaveAttribute("data-state", "ended", { timeout: 9000 });
    await expect(page.getByTestId("add-to-bag")).toBeEnabled();
  });

  test("the original piece has a short product-led reveal with replay", async ({ page }) => {
    await page.goto("/product/crimson-orbit");
    const player = page.getByTestId("reveal-player");
    await page.getByTestId("reveal-watch").click();
    await expect(player).toHaveAttribute("data-state", "playing");
    await expect(page.getByTestId("reveal-video")).toHaveCount(0);
    await expect(player).toHaveAttribute("data-state", "ended", { timeout: 5000 });
    await page.getByTestId("reveal-replay").click();
    await expect(player).toHaveAttribute("data-state", "playing");
  });
});

test.describe("concept reveal playback (test pattern)", () => {
  // The labeled WebM test pattern plays in Chromium. Playwright's WebKit build on Windows cannot
  // decode it, which is exercised above as the failure path instead.
  test.skip(({ browserName }) => browserName === "webkit", "test-pattern codec is not available in this WebKit build");

  test("play, skip, final frame for the chosen form, replay, sound, expand and close", async ({ page }) => {
    await page.goto(`${FAMILY}?revealFixture=1&form=micro-dermal`);
    const player = page.getByTestId("reveal-player");
    await expect(page.getByTestId("reveal-fixture-tag")).toContainText("test pattern");

    // Keyboard: the explicit button starts it.
    await page.getByTestId("reveal-watch").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("reveal-skip")).toBeVisible();
    await expect(player).toHaveAttribute("data-state", "playing");
    expect(await page.getByTestId("reveal-video").evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);

    await page.getByTestId("reveal-sound").click();
    await expect(page.getByTestId("reveal-sound")).toHaveAttribute("aria-pressed", "true");
    expect(await page.getByTestId("reveal-video").evaluate((v: HTMLVideoElement) => v.muted)).toBe(false);

    await page.getByTestId("reveal-skip").click();
    await expect(player).toHaveAttribute("data-state", "ended");
    await expect(page.getByTestId("reveal-final")).toHaveAttribute("data-form", "micro-dermal");
    await expect(page.getByTestId("family")).toHaveAttribute("data-form", "micro-dermal");

    await page.getByTestId("reveal-replay").click();
    await expect(player).toHaveAttribute("data-state", "playing");
    // Leaving the view stops it: the player is gone and nothing keeps playing.
    await tab(page, "Placement preview").click();
    await expect(page.getByTestId("reveal-video")).toHaveCount(0);
    await tab(page, "Concept reveal").click();
    await expect(page.getByTestId("reveal-player")).toHaveAttribute("data-state", "idle");

    // Expanded view is opened on purpose and closes back to where the visitor was.
    await page.getByTestId("reveal-expand").click();
    const dialog = page.getByRole("dialog", { name: /reveal, expanded/ });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId("reveal-watch")).toBeVisible();
  });

  test("the artwork itself is a button, and a mini-scene ends by its ceiling", async ({ page }) => {
    test.setTimeout(40_000);
    await page.goto(`${FAMILY}?revealFixture=1`);
    await expect(page.getByTestId("reveal-artwork")).toHaveAccessibleName(/Watch the sand reveal/);
    await page.getByTestId("reveal-artwork").click();
    const player = page.getByTestId("reveal-player");
    await expect(player).toHaveAttribute("data-state", "playing");
    // The test pattern runs nine seconds; the player must end it at eight.
    await expect(player).toHaveAttribute("data-state", "ended", { timeout: 12_000 });
    await expect(page.getByTestId("reveal-final")).toBeVisible();
  });
});
