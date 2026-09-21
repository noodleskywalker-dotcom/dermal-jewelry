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
    // Customer-facing copy only: no timings, no engineering notes, never a collaboration claim.
    const head = page.locator(".story-head");
    await expect(head).toContainText("Story 01");
    await expect(head).not.toContainText(/seconds|skip|plays by itself/i);
    await expect(stage(page)).not.toContainText(/official collaboration/i);
    // The stage stands on paper, so the navigation is light there, and keeps every destination.
    const nav = page.locator("header[data-tone]");
    await expect(nav).toHaveAttribute("data-tone", "light");
    expect(await nav.evaluate((el) => getComputedStyle(el).borderBottomWidth)).toBe("0px");
    await expect(nav.getByRole("link", { name: "DERMAL home" })).toBeVisible();
    // The brand is not anime only: original designs follow, and a concept without artwork is words only.
    const originals = page.getByTestId("originals-strip");
    await expect(originals).toContainText("Original designs");
    await expect(originals.getByTestId("concept-entry")).toContainText("KIRI");
    await expect(originals.getByTestId("concept-entry")).toContainText(/Original \/ Concept/i);
    await expect(originals.getByTestId("concept-entry").locator("svg, img")).toHaveCount(0);
    await expect(originals.getByRole("link", { name: /CRIMSON ORBIT/ })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("the character shows it is interactive, and hovering is a short hint, never the cinematic", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover is a desktop pointer behaviour");
    await page.goto(STAGE);
    const character = page.getByTestId("story-character");
    await expect(character).toHaveAttribute("data-reacting", "false");
    // A pointer cursor and a small label, not a card or a big button.
    expect(await character.evaluate((el) => getComputedStyle(el).cursor)).toBe("pointer");
    await expect(page.getByTestId("story-tag")).toContainText("Watch story");
    // The pointer only has to come close for a first sign of life.
    const box = (await character.boundingBox())!;
    await page.mouse.move(box.x + box.width + 400, box.y + 200);
    await expect(character).toHaveAttribute("data-near", "false");
    await page.mouse.move(box.x + box.width + 60, box.y + 200, { steps: 4 });
    await expect(character).toHaveAttribute("data-near", "true");
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
    // Internal review labels it for what it is: a generated sand effect over a still, not final.
    await expect(page.getByTestId("story-cinematic-tag")).toContainText(/concept motion prototype/i);
    await expect(page.getByTestId("story-cinematic-tag")).toContainText(/over a still/i);
    // The page itself stays visible under the effect: the dialog has no surface of its own.
    expect(await page.getByRole("dialog").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
    await expect(stage(page)).toHaveAttribute("data-mode", "browse");
    await expect(cinematic).toHaveAttribute("data-beat", /loading|hold/);

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
    // Timed from the moment the media is loaded and the story really starts.
    await expect(cinematic).toHaveAttribute("data-ready", "true", { timeout: 12_000 });
    const started = Date.now();
    // Beats and the ending are recorded inside the page, so a short beat can never slip between two polls.
    await page.evaluate(() => {
      const root = document.querySelector('[data-testid="story-cinematic"]')!;
      const log = { beats: [root.getAttribute("data-beat")], ending: "", covered: false };
      (window as unknown as { __story: typeof log }).__story = log;
      new MutationObserver(() => {
        const beat = root.getAttribute("data-beat");
        if (beat && log.beats[log.beats.length - 1] !== beat) log.beats.push(beat);
        const fx = root.querySelector<HTMLElement>('[data-testid="story-effect"]');
        if (beat === "cover" && fx?.dataset.covered === "true") log.covered = true;
        const visual = root.querySelector('[data-testid="story-visual"]');
        if (visual) log.ending = `${visual.getAttribute("data-jewelry")}:${root.querySelectorAll('[data-testid="story-jewel-piece"]').length}`;
      }).observe(root, { attributes: true, childList: true, subtree: true });
    });
    await expect(cinematic).toHaveCount(0, { timeout: 16_000 });
    const seconds = (Date.now() - started) / 1000;
    const recorded = await page.evaluate(() => (window as unknown as { __story: { beats: string[]; ending: string; covered: boolean } }).__story);
    // A slow machine may attach the recorder after the short first beats, so the order is checked from the spread on.
    expect(recorded.beats.slice(-3)).toEqual(["spread", "cover", "closeup"]);
    // Full sand was reached before the picture was changed under it.
    expect(recorded.covered).toBe(true);
    // The close-up never shows a double image: either the clean overlay of the pair, or, while the only
    // close-up on disk already has the pair painted in, that reference alone.
    expect(recorded.ending).toBe("overlay:2");
    expect(seconds).toBeGreaterThan(5.5);
    expect(seconds).toBeLessThan(10);
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
    const before = await visual.getAttribute("data-media");
    // The clean close-up carries the pair as a product overlay, and only as an overlay.
    await expect(visual).toHaveAttribute("data-jewelry", "overlay");
    await expect(visual.getByTestId("story-jewel-piece")).toHaveCount(2);

    await chooseForm(page, "nose");
    await expect(product(page)).toHaveAttribute("data-form", "nose");
    await expect(visual).toHaveAttribute("data-form", "nose");
    await expect(visual.getByTestId("story-jewel-piece")).toHaveCount(1);
    await expect(page.getByTestId("story-price")).toContainText("QAR 190");
    await expect(page.getByTestId("story-form-note")).toContainText("deep-red faceted gemstone");
    await expect(page).toHaveURL(/form=nose/);
    // With internal stills present the nose uses a different picture from the eye close-up, shown in a
    // smaller window so the half-length still is never blown up until it goes soft.
    if (before !== "placeholder") {
      expect(await visual.getAttribute("data-media")).not.toBe(before);
      await expect(visual).toHaveAttribute("data-jewelry", "overlay");
      const panel = (await visual.boundingBox())!;
      const shown = (await visual.locator('[data-testid="story-window"][data-slot="portrait"]').boundingBox())!;
      expect(shown.height).toBeLessThan(panel.height * 0.75);
      const drawn = (await visual.locator('[data-slot="portrait"] img:not([data-testid="piece-asset"])').boundingBox())!;
      const natural = await visual.locator('[data-slot="portrait"] img:not([data-testid="piece-asset"])').evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(drawn.width).toBeLessThanOrEqual(natural * 1.05);
    }

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
    // Until a photo arrives the stand-in is the featureless head, wearing the chosen form. No test image, no character.
    await expect(page.getByTestId("story-character-layer")).toHaveAttribute("data-hidden", "true");
    await expect(page.getByTestId("story-head").getByTestId("placement-preview")).toHaveAttribute("data-form", "anti-eyebrow");
    await expect(page.getByTestId("story-head")).toContainText("not a person");

    await page.getByTestId("photo-input").first().setInputFiles(FIXTURE);
    await expect(tryon).toHaveAttribute("data-photo", "true");
    await expect(page.getByTestId("story-head")).toHaveCount(0);
    await expect(tryon.getByTestId("photo-frame")).toBeVisible();
    await expect(tryon.getByTestId("placed-item")).toHaveCount(1);
    await expect(tryon.getByTestId("piece-gemstone")).toHaveCount(1);
    expect(await tryon.getByTestId("photo-frame").getByTestId("studio-photo").getAttribute("src")).toMatch(/^blob:/);

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
    await expect(page.getByTestId("story-tag")).toContainText("View the piece");
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

  test("the first screen shows the collection, the character, the story and a piece, and the page visibly continues", async ({ page, isMobile }) => {
    await page.goto(STAGE);
    const viewport = page.viewportSize()!;
    for (const target of [page.getByRole("heading", { level: 1 }), page.getByTestId("story-watch"), page.getByTestId("story-character"), page.getByTestId("story-piece").first()]) {
      const box = (await target.boundingBox())!;
      expect(box.y, "starts inside the first screen").toBeLessThan(viewport.height);
      expect(box.y + Math.min(box.height, 40), "is not cut off at its top").toBeLessThanOrEqual(viewport.height);
    }
    if (!isMobile) {
      // A strip of the next section sits inside the first screen, and a quiet cue points at it.
      const next = (await page.getByTestId("originals-strip").boundingBox())!;
      expect(next.y).toBeLessThan(viewport.height - 40);
      await expect(page.getByTestId("story-scroll-cue")).toBeVisible();
      await expect(page.getByTestId("story-scroll-cue")).toHaveAttribute("href", "#originals");
    }
  });

  for (const size of [
    { name: "320 x 568", width: 320, height: 568 },
    { name: "360 x 800", width: 360, height: 800 },
    { name: "390 x 844", width: 390, height: 844 },
    { name: "412 x 915", width: 412, height: 915 },
    { name: "landscape 844 x 390", width: 844, height: 390 },
    { name: "desktop 1440 x 900", width: 1440, height: 900 },
  ]) {
    test(`the sand starts at the opening of the gourd and ends covering the page at ${size.name}`, async ({ page, browserName, isMobile }) => {
      test.skip(browserName !== "chromium" || Boolean(isMobile), "sizes are set explicitly, once, in desktop Chromium");
      test.setTimeout(45_000);
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto(STAGE);
      const figure = page.getByTestId("story-character").locator("img");
      test.skip((await figure.count()) === 0, "internal stills are not on this machine");
      await page.getByTestId("story-watch").click();
      const cinematic = page.getByTestId("story-cinematic");
      await expect(cinematic).toHaveAttribute("data-ready", "true", { timeout: 12_000 });
      // Measured inside the page, in the same frame the clip's time is read, while the sand is still a ribbon.
      const handle = await page.waitForFunction(() => {
        const live = document.querySelector<HTMLCanvasElement>('[data-testid="story-effect"]');
        const at = Number(live?.dataset.time ?? 0);
        if (!live || at < 0.1 || at > 2.2) return null;
        const img = document.querySelector<HTMLImageElement>('[data-testid="story-character"] img')!;
        const parent = (img.offsetParent ?? img).getBoundingClientRect();
        const box = { left: parent.left + img.offsetLeft, bottom: parent.top + img.offsetTop + img.offsetHeight, width: img.offsetWidth, height: img.offsetHeight };
        const side = Math.min(box.width, box.height);
        // Top of the cork on the approved seated still, as drawn: contained, bottom-left.
        const cork = { x: box.left + 0.31 * side, y: box.bottom - side + 0.255 * side };
        const fx = document.querySelector<HTMLCanvasElement>('[data-testid="story-effect"]')!;
        const m = new DOMMatrixReadOnly(getComputedStyle(fx).transform);
        const w = fx.width * m.a;
        const h = fx.height * m.d;
        return { at, cork, entry: { x: m.e + 0.012 * w, y: m.f + 0.74 * h }, side, scale: m.a, stretched: Math.abs(m.a - m.d) > 1e-6, corkOnScreen: cork.y > 0 && cork.y < innerHeight };
      }, null, { timeout: 10_000, polling: "raf" });
      const measured = (await handle.jsonValue())!;
      expect(measured.corkOnScreen, "the gourd is on screen when the story starts").toBe(true);
      expect(Math.abs(measured.entry.x - measured.cork.x), "sand enters at the cork, across").toBeLessThan(2);
      expect(Math.abs(measured.entry.y - measured.cork.y), "sand enters at the cork, down").toBeLessThan(2);
      expect(measured.stretched).toBe(false);

      // At full cover the footage spans the whole viewport, so there is no rectangle and nothing leaks.
      // "Covered" stays set from full cover to the end, so it cannot be missed between two polls.
      await expect(page.getByTestId("story-effect")).toHaveAttribute("data-covered", "true", { timeout: 10_000 });
      const cover = await page.evaluate(() => {
        const fx = document.querySelector<HTMLElement>('[data-testid="story-effect"]')!;
        const r = fx.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, covered: fx.dataset.covered, vw: innerWidth, vh: innerHeight };
      });
      expect(cover.covered).toBe("true");
      expect(cover.left).toBeLessThanOrEqual(0.5);
      expect(cover.top).toBeLessThanOrEqual(0.5);
      expect(cover.right).toBeGreaterThanOrEqual(cover.vw - 0.5);
      expect(cover.bottom).toBeGreaterThanOrEqual(cover.vh - 0.5);
      await page.keyboard.press("Escape");
      await expect(product(page)).toBeVisible();
    });
  }

  test("the effect is really transparent where there is no sand, and really opaque at full cover", async ({ page, browserName, isMobile }) => {
    test.skip(browserName !== "chromium" || Boolean(isMobile), "pixels are read once, in desktop Chromium");
    test.setTimeout(45_000);
    await page.goto(STAGE);
    test.skip((await page.getByTestId("story-character").locator("img").count()) === 0, "internal stills are not on this machine");
    const before = await page.screenshot({ clip: { x: 1100, y: 300, width: 40, height: 40 } });
    await page.getByTestId("story-watch").click();
    const cinematic = page.getByTestId("story-cinematic");
    await expect(cinematic).toHaveAttribute("data-beat", "flow", { timeout: 16_000 });
    // Far from the gourd, early on, the page is untouched: no tint, no rectangle.
    const during = await page.screenshot({ clip: { x: 1100, y: 300, width: 40, height: 40 } });
    expect(during.equals(before)).toBe(true);
    // "Covered" stays set from full cover to the end, so it cannot be missed between two polls.
      await expect(page.getByTestId("story-effect")).toHaveAttribute("data-covered", "true", { timeout: 10_000 });
    // Under full sand the page's black heading cannot be seen anywhere: every sampled pixel is warm sand.
    const shot = await page.screenshot({ clip: { x: 600, y: 140, width: 340, height: 180 } });
    const dark = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const x = c.getContext("2d")!;
      x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      let inky = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i] < 60 && d[i + 1] < 60 && d[i + 2] < 60 && Math.abs(d[i] - d[i + 2]) < 12) inky++;
      return inky;
    }, shot.toString("base64"));
    expect(dark, "no ink-black heading pixels show through the sand").toBe(0);
  });

  test("without the footage the story is skipped, never imitated", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "this WebKit build does not let a test intercept a media request");
    await page.route("**/api/dev-concept/sandfx", (route) => route.fulfill({ status: 404, body: "Not found" }));
    await page.goto(STAGE);
    test.skip((await page.getByTestId("story-character").locator("img").count()) === 0, "internal stills are not on this machine");
    await page.getByTestId("story-watch").click();
    await expect(product(page)).toHaveAttribute("data-product", "desert-eye-love", { timeout: 12_000 });
    await expect(page.getByTestId("story-cinematic")).toHaveCount(0);
    await expect(page.getByTestId("story-effect")).toHaveCount(0);
    // It did not play, so it is not marked as seen.
    await page.getByTestId("story-back").click();
    await expect(page.getByTestId("story-watch")).toContainText("Watch story");
  });

  test("on a phone the pieces come one at a time and change sides, not as a product grid", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone layout");
    await page.goto(STAGE);
    const boxes = [];
    for (const link of await page.getByTestId("story-piece-link").all()) boxes.push((await link.boundingBox())!);
    // After the first piece, which floats beside the character, no two pieces share a row.
    const flow = boxes.slice(1);
    for (let i = 1; i < flow.length; i++) expect(flow[i].y).toBeGreaterThan(flow[i - 1].y + flow[i - 1].height);
    const centres = flow.map((b) => b.x + b.width / 2);
    expect(Math.max(...centres) - Math.min(...centres), "positions vary across the width").toBeGreaterThan(60);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
