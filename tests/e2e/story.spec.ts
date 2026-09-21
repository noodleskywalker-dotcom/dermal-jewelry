import { expect, test, type Page } from "@playwright/test";
import { FIXTURE } from "./helpers";

const STAGE = "/collections/desert-eye";

const stage = (page: Page) => page.getByTestId("story-stage");
const product = (page: Page) => page.getByTestId("story-product");
const chooseForm = (page: Page, formId: string) => page.locator("label", { has: page.getByTestId(`story-form-${formId}`) }).click();
const piece = (page: Page, slug: string, formId: string) => page.locator(`[data-testid="story-piece"][data-product="${slug}"][data-form="${formId}"]`);

test.describe("DESERT EYE collection stage", () => {
  test("the character and the jewelry stand on the open page, with no product cards", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto(STAGE);
    await expect(stage(page)).toHaveAttribute("data-mode", "browse");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("DESERT EYE");
    await expect(page.getByTestId("story-character")).toBeVisible();
    await expect(page.getByTestId("product-card")).toHaveCount(0);
    await expect(page.getByTestId("story-piece")).toHaveCount(4);
    // Nothing plays by itself.
    await page.waitForTimeout(1200);
    await expect(page.getByTestId("story-cinematic")).toHaveCount(0);
    await expect(stage(page)).toHaveAttribute("data-mode", "browse");
    // Each object is a real link that names the piece, the form and the demo price.
    await expect(piece(page, "desert-eye-love", "nose").getByTestId("story-piece-link")).toHaveAccessibleName(/DESERT EYE — LOVE, Nose form, demo price QAR 190/);
    await expect(piece(page, "desert-eye-love", "nose").getByTestId("story-piece-link")).toHaveAttribute("href", /product=desert-eye-love&form=nose/);
    // It is never described as a collaboration, and the prototype is labelled as internal.
    await expect(page.getByText(/official collaboration/i).first()).toContainText(/not an official collaboration/i);
    expect(errors).toEqual([]);
  });

  test("hovering the character is a short hint, never the cinematic", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover is a desktop pointer behaviour");
    await page.goto(STAGE);
    const character = page.getByTestId("story-character");
    await expect(character).toHaveAttribute("data-reacting", "false");
    await character.hover();
    await expect(character).toHaveAttribute("data-reacting", "true");
    await expect(page.getByTestId("story-cinematic")).toHaveCount(0);
    // Back to idle inside two seconds, still on the collection, nothing opened.
    await expect(character).toHaveAttribute("data-reacting", "false", { timeout: 2000 });
    await expect(stage(page)).toHaveAttribute("data-mode", "browse");
    await expect(page.getByTestId("story-cinematic")).toHaveCount(0);
  });

  test("hovering a piece shows its name, form, price and TRY ON, and plays nothing", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover is a desktop pointer behaviour");
    await page.goto(STAGE);
    const target = piece(page, "desert-eye-love", "micro-dermal");
    await target.getByTestId("story-piece-link").hover();
    await expect(target).toContainText("DESERT EYE — LOVE");
    await expect(target).toContainText("Micro dermal");
    await expect(target).toContainText("QAR 220");
    await expect(target.getByTestId("story-piece-tryon")).toBeVisible();
    await page.waitForTimeout(900);
    await expect(page.getByTestId("story-cinematic")).toHaveCount(0);
    await expect(stage(page)).toHaveAttribute("data-mode", "browse");
  });

  test("a piece opens the product directly, skipping the story, with a product-and-form address", async ({ page }) => {
    await page.goto(STAGE);
    await piece(page, "desert-eye-love", "micro-dermal").getByTestId("story-piece-link").click();
    await expect(page.getByTestId("story-cinematic")).toHaveCount(0);
    await expect(product(page)).toHaveAttribute("data-form", "micro-dermal");
    await expect(page.getByTestId("story-price")).toContainText("QAR 220");
    await expect(page).toHaveURL(/\?product=desert-eye-love&form=micro-dermal$/);

    // The address alone opens the same thing.
    await page.goto(`${STAGE}?product=desert-eye-love&form=nose`);
    await expect(product(page)).toHaveAttribute("data-form", "nose");
    await expect(page.getByTestId("story-form-nose")).toBeChecked();

    // Back returns to the collection and clears the address.
    await page.getByTestId("story-back").click();
    await expect(stage(page)).toHaveAttribute("data-mode", "browse");
    await expect(page).toHaveURL(/\/collections\/desert-eye$/);

    // A piece without a story of its own is shoppable in the same place.
    await piece(page, "sand-vortex", "anti-eyebrow").getByTestId("story-piece-link").click();
    await expect(product(page)).toHaveAttribute("data-product", "sand-vortex");
    await expect(page.getByTestId("story-replay")).toHaveCount(0);
    await page.getByTestId("add-to-bag").click();
    await expect(page.getByTestId("bag-subtotal")).toHaveText("QAR 350");
  });

  test("the story starts from a press, can be skipped at once, and resolves into the product", async ({ page }) => {
    await page.goto(STAGE);
    await expect(page.getByTestId("story-watch")).toContainText("Watch story");
    await page.getByTestId("story-watch").click();

    const cinematic = page.getByTestId("story-cinematic");
    await expect(cinematic).toBeVisible();
    await expect(page.getByTestId("story-skip")).toBeVisible();
    await expect(page.getByTestId("story-skip")).toBeFocused();
    await expect(page.getByTestId("story-cinematic-tag")).toContainText("not the final cinematic");
    await expect(cinematic).toHaveAttribute("data-beat", "stance");

    await page.getByTestId("story-skip").click();
    await expect(cinematic).toHaveCount(0);
    await expect(product(page)).toHaveAttribute("data-product", "desert-eye-love");
    await expect(product(page)).toHaveAttribute("data-form", "anti-eyebrow");
    await expect(page.getByTestId("story-product-title")).toBeFocused();

    // Shopping controls are all there: piercing type, views, price and the bag.
    for (const id of ["anti-eyebrow", "micro-dermal", "nose"]) await expect(page.getByTestId(`story-form-${id}`)).toBeEnabled();
    for (const id of ["concept", "placement", "tryon"]) await expect(page.getByTestId(`story-view-${id}`)).toBeVisible();
    await expect(page.getByTestId("story-price")).toContainText("QAR 390");
    await expect(page.getByTestId("story-form-note")).toContainText("Not manufacturing-ready");
    await page.getByTestId("add-to-bag").click();
    await expect(page.locator('[data-testid="bag-line"][data-form="anti-eyebrow"]')).toHaveCount(1);
  });

  test("left alone it runs its beats in about six and a half seconds, then offers replay instead of replaying", async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto(STAGE);
    await page.getByTestId("story-character").click();
    const cinematic = page.getByTestId("story-cinematic");
    await expect(cinematic).toBeVisible();
    // Timed from the first frame. The ceiling leaves room for a busy test machine, not for a longer story.
    const started = Date.now();
    await expect(cinematic).toHaveAttribute("data-beat", "exchange", { timeout: 3000 });
    await expect(cinematic).toHaveAttribute("data-beat", "fill", { timeout: 6000 });
    await expect(cinematic).toHaveAttribute("data-beat", "closeup", { timeout: 3000 });
    // The close-up carries the jewelry as a product overlay of the chosen form: two pieces for the pair.
    await expect(cinematic.getByTestId("story-jewel-piece")).toHaveCount(2);
    await expect(cinematic).toHaveCount(0, { timeout: 4000 });
    const seconds = (Date.now() - started) / 1000;
    expect(seconds).toBeGreaterThan(5);
    expect(seconds).toBeLessThan(9.5);
    await expect(product(page)).toHaveAttribute("data-form", "anti-eyebrow");
    await expect(page.getByTestId("story-replay")).toContainText("Replay story");

    // Same session: the character now opens the piece and the story does not play again by itself.
    await page.getByTestId("story-back").click();
    await expect(page.getByTestId("story-watch")).toContainText("Replay story");
    await page.getByTestId("story-character").click();
    await expect(product(page)).toBeVisible();
    await expect(page.getByTestId("story-cinematic")).toHaveCount(0);
    await page.reload();
    await page.getByTestId("story-back").click();
    await expect(page.getByTestId("story-watch")).toContainText("Replay story");

    // Replay is an explicit choice, and Escape skips it.
    await page.getByTestId("story-watch").click();
    await expect(page.getByTestId("story-cinematic")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("story-cinematic")).toHaveCount(0);
    await expect(product(page)).toBeVisible();
  });

  test("the keyboard can reach the character and start the story", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard focus order is checked on desktop");
    await page.goto(STAGE);
    await page.getByTestId("story-character").focus();
    await expect(page.getByTestId("story-character")).toHaveAccessibleName(/Watch the DESERT EYE story/);
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("story-cinematic")).toBeVisible();
    await page.keyboard.press("Enter"); // Skip has focus.
    await expect(product(page)).toBeVisible();
  });

  test("changing piercing type moves the attention and changes the pieces, not just their size", async ({ page }) => {
    await page.goto(`${STAGE}?product=desert-eye-love`);
    const visual = page.getByTestId("story-visual");
    await expect(visual).toHaveAttribute("data-form", "anti-eyebrow");
    await expect(visual.getByTestId("story-jewel-piece")).toHaveCount(2);
    const before = await visual.getAttribute("data-media");

    await chooseForm(page, "nose");
    await expect(product(page)).toHaveAttribute("data-form", "nose");
    await expect(visual).toHaveAttribute("data-form", "nose");
    await expect(visual.getByTestId("story-jewel-piece")).toHaveCount(1);
    await expect(page.getByTestId("story-price")).toContainText("QAR 190");
    await expect(page.getByTestId("story-form-note")).toContainText("deep-red faceted gemstone");
    await expect(page).toHaveURL(/form=nose/);
    // With internal stills present the nose uses a different picture from the eye close-up.
    if (before !== "placeholder") expect(await visual.getAttribute("data-media")).not.toBe(before);

    await chooseForm(page, "micro-dermal");
    await expect(visual.getByTestId("story-jewel-piece")).toHaveCount(1);
    await expect(page.getByTestId("story-price")).toContainText("QAR 220");

    // The placement view follows the same form.
    await page.getByTestId("story-view-placement").click();
    await expect(page.getByTestId("placement-preview")).toHaveAttribute("data-form", "micro-dermal");

    // And the same choice is waiting on the ordinary product page.
    await page.getByTestId("story-details").click();
    await expect(page.getByTestId("family")).toHaveAttribute("data-form", "micro-dermal");
  });

  test("TRY ON moves from the character to the customer's own photo, and the photo never leaves the browser", async ({ page }) => {
    const uploads: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET" && !r.url().includes("__nextjs")) uploads.push(`${r.method()} ${r.url()}`);
    });

    await page.goto(STAGE);
    await piece(page, "desert-eye-love", "anti-eyebrow").getByTestId("story-piece-tryon").click();
    await expect(product(page)).toHaveAttribute("data-view", "tryon");
    const tryon = page.getByTestId("story-tryon");
    await expect(tryon).toHaveAttribute("data-photo", "false");
    await expect(tryon).toContainText("never uploaded");
    // The character is still there, held back, until a photo arrives.
    await expect(page.getByTestId("story-character-layer")).toHaveAttribute("data-hidden", "false");

    await page.getByTestId("photo-input").first().setInputFiles(FIXTURE);
    await expect(tryon).toHaveAttribute("data-photo", "true");
    await expect(page.getByTestId("story-character-layer")).toHaveAttribute("data-hidden", "true");
    await expect(tryon.getByTestId("photo-frame")).toBeVisible();
    await expect(tryon.getByTestId("placed-item")).toHaveCount(1);
    await expect(tryon.getByTestId("piece-gemstone")).toHaveCount(1);
    expect(await tryon.getByTestId("photo-frame").locator("img").getAttribute("src")).toMatch(/^blob:/);

    // The form still drives what is drawn on the face.
    await chooseForm(page, "nose");
    await expect(tryon.getByTestId("piece-symbol")).toHaveCount(0);
    await expect(tryon.getByTestId("piece-gemstone")).toHaveCount(1);

    // Nothing about the photo is in the address or in session storage, and nothing was sent.
    expect(page.url()).not.toMatch(/blob|photo|image/i);
    const stored = await page.evaluate(() => JSON.stringify({ ...sessionStorage }));
    expect(stored).not.toMatch(/blob|data:image/);
    expect(uploads).toEqual([]);

    // The same photo and form carry into Face Studio.
    await page.getByTestId("story-open-studio").click();
    await expect(page).toHaveURL(/face-studio\?product=desert-eye-love&form=nose/);
    await expect(page.getByTestId("studio-stage").getByTestId("photo-frame")).toBeVisible();
  });

  test("reduced motion skips the story and opens the piece directly", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(STAGE);
    await expect(page.getByTestId("story-watch")).toContainText("View the piece");
    await expect(page.getByTestId("story-status")).toContainText("Reduced motion is on");
    await page.getByTestId("story-character").click();
    await expect(page.getByTestId("story-cinematic")).toHaveCount(0);
    await expect(product(page)).toHaveAttribute("data-product", "desert-eye-love");
    await expect(page.getByTestId("story-replay")).toHaveCount(0);
  });

  test("the page scrolls normally and nothing overflows sideways", async ({ page }) => {
    await page.goto(STAGE);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
    // Every piece can be reached and tapped.
    for (const link of await page.getByTestId("story-piece-link").all()) {
      await link.scrollIntoViewIfNeeded();
      const box = (await link.boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    }
  });
});
