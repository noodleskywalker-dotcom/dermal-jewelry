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
    // Internal review labels it for what it is. It is never presented as final footage.
    await expect(page.getByTestId("story-cinematic-tag")).toContainText(/concept motion prototype/i);
    await expect(page.getByTestId("story-cinematic-tag")).toContainText(/not final footage/i);
    await expect(cinematic).toHaveAttribute("data-footage", "animatic");
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
    // Beats and the ending are recorded inside the page, so a short beat can never slip between two polls.
    await page.evaluate(() => {
      const root = document.querySelector('[data-testid="story-cinematic"]')!;
      const log = { beats: [root.getAttribute("data-beat")], ending: "" };
      (window as unknown as { __story: typeof log }).__story = log;
      new MutationObserver(() => {
        const beat = root.getAttribute("data-beat");
        if (beat && log.beats[log.beats.length - 1] !== beat) log.beats.push(beat);
        const visual = root.querySelector('[data-testid="story-visual"]');
        if (visual) log.ending = `${visual.getAttribute("data-jewelry")}:${root.querySelectorAll('[data-testid="story-jewel-piece"]').length}`;
      }).observe(root, { attributes: true, childList: true, subtree: true });
    });
    await expect(cinematic).toHaveCount(0, { timeout: 12_000 });
    const seconds = (Date.now() - started) / 1000;
    const recorded = await page.evaluate(() => (window as unknown as { __story: { beats: string[]; ending: string } }).__story);
    // A slow machine may attach the recorder after the 0.8 second stance, so the order is checked from the exchange on.
    expect(recorded.beats.slice(-4)).toEqual(["exchange", "erupt", "fill", "closeup"]);
    // The close-up never shows a double image: either the clean overlay of the pair, or, while the only
    // close-up on disk already has the pair painted in, that reference alone.
    expect(["overlay:2", "painted-reference:0"]).toContain(recorded.ending);
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
    const before = await visual.getAttribute("data-media");
    // No ghosting: a close-up with the pair already painted in is kept as that reference, without an overlay.
    const painted = (await visual.getAttribute("data-jewelry")) === "painted-reference";
    await expect(visual.getByTestId("story-jewel-piece")).toHaveCount(painted ? 0 : 2);

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
      const shown = (await visual.locator('[data-testid="story-window"][data-slot="character"]').boundingBox())!;
      expect(shown.height).toBeLessThan(panel.height * 0.75);
      const drawn = (await visual.locator('[data-slot="character"] img').boundingBox())!;
      const natural = await visual.locator('[data-slot="character"] img').evaluate((img: HTMLImageElement) => img.naturalWidth);
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
    test(`the fight keeps the face clear and the opponent on stage at ${size.name}`, async ({ page, browserName, isMobile }) => {
      test.skip(browserName !== "chromium" || Boolean(isMobile), "sizes are set explicitly, once, in desktop Chromium");
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto(STAGE);
      await page.getByTestId("story-watch").click();
      const cinematic = page.getByTestId("story-cinematic");
      await expect(cinematic).toHaveAttribute("data-beat", "exchange", { timeout: 3000 });
      const measured = await page.evaluate(() => {
        // Hold every animation of the exchange at 40% of its length: the kick has landed and is being held.
        const stageRoot = document.querySelector('[data-testid="story-cinematic"]')!;
        for (const animation of document.getAnimations()) {
          const target = (animation.effect as KeyframeEffect | null)?.target;
          const name = (animation as CSSAnimation).animationName ?? "";
          if (!target || !stageRoot.contains(target) || name === "cine-progress") continue;
          const duration = Number(animation.effect!.getComputedTiming().duration);
          animation.pause();
          animation.currentTime = duration * 0.4;
        }
        const rect = (id: string) => document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect();
        const face = rect("cine-face");
        const opponent = rect("cine-opponent");
        // Sample the visible sand arc along its length, in screen pixels.
        const arcs = [...document.querySelectorAll<SVGPathElement>('[data-testid="cine-arc"]')].filter((a) => getComputedStyle(a.parentElement!).display !== "none");
        const arc = arcs[0];
        const matrix = arc.getScreenCTM()!;
        const length = arc.getTotalLength();
        const half = parseFloat(getComputedStyle(arc).strokeWidth) / 2;
        let arcInFace = 0;
        for (let i = 0; i <= 60; i++) {
          const pt = arc.getPointAtLength((length * i) / 60).matrixTransform(matrix);
          if (pt.x > face.left - half && pt.x < face.right + half && pt.y > face.top - half && pt.y < face.bottom + half) arcInFace++;
        }
        const overlap = !(opponent.right < face.left || opponent.left > face.right || opponent.bottom < face.top || opponent.top > face.bottom);
        return {
          arcs: arcs.length,
          arcInFace,
          overlap,
          opponent: { left: opponent.left, right: opponent.right, top: opponent.top, bottom: opponent.bottom },
          opacity: getComputedStyle(document.querySelector('[data-testid="cine-opponent"]')!).opacity,
          beat: document.querySelector('[data-testid="story-cinematic"]')!.getAttribute("data-beat"),
        };
      });
      expect(measured.beat).toBe("exchange");
      expect(measured.arcs, "one composition per orientation").toBe(1);
      expect(measured.arcInFace, "the sand arc never crosses the face").toBe(0);
      expect(measured.overlap, "the opponent never covers the face").toBe(false);
      expect(Number(measured.opacity)).toBeGreaterThan(0.9);
      expect(measured.opponent.left).toBeGreaterThanOrEqual(0);
      expect(measured.opponent.top).toBeGreaterThanOrEqual(0);
      expect(measured.opponent.right).toBeLessThanOrEqual(size.width + 1);
      expect(measured.opponent.bottom).toBeLessThanOrEqual(size.height + 1);
    });
  }

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
