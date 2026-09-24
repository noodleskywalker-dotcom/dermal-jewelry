import { expect, test, type Page } from "@playwright/test";
import { FIXTURE } from "./helpers";

// The approved DESERT EYE product animation on the product page. Same rules as a reveal: nothing
// loads before a press, nothing autoplays, sound is off unless asked for, it can be skipped at once,
// and the completed piece is always left in view. It is never used inside Face Studio.

const FAMILY = "/product/desert-eye-love";
const film = (page: Page) => page.getByTestId("product-film");
// The page opens on the beauty frame; the film is the Assembly mode of the same stage.
const openAssembly = async (page: Page, url = FAMILY) => {
  await page.goto(url);
  await page.getByRole("tab", { name: "Assembly" }).click();
};
const state = (page: Page) => film(page).getAttribute("data-state");
const chooseForm = (page: Page, formId: string) => page.locator("label", { has: page.getByTestId(`form-${formId}`) }).click();
const mediaRequests = (page: Page) => {
  const media: string[] = [];
  page.on("request", (r) => /\/media\/product-animation\/.*\.(webm|mp4)(\?|$)/.test(r.url()) && media.push(r.url()));
  return media;
};
// Playwright's bundled WebKit cannot decode the delivery formats; playback itself is checked in Chromium.
const playback = (browserName: string) => browserName === "chromium";

test.describe("first load", () => {
  test("shows the poster, loads no media, and never takes the stage from shopping", async ({ page }) => {
    const media = mediaRequests(page);
    await page.goto(FAMILY);
    // The default mode is the finished piece, large; never a schematic and never the film's creature poster.
    await expect(page.getByTestId("pdp-beauty")).toBeVisible();
    await expect(page.getByTestId("piece-assembly")).toHaveCount(0);
    await page.getByRole("tab", { name: "Assembly" }).click();
    await expect(film(page)).toHaveAttribute("data-state", "idle");
    await expect(film(page)).toHaveAttribute("data-form", "anti-eyebrow");
    await expect(page.getByTestId("film-poster")).toBeVisible();
    await expect(page.getByTestId("film-video")).toHaveCount(0);
    await expect(page.getByTestId("film-play")).toBeVisible();
    await expect(page.getByTestId("film-captions").locator("div")).toHaveCount(0);
    // The drawn assembly is not on this form's page, and the superseded concept-reveal tab is gone.
    await expect(page.getByTestId("piece-assembly")).toHaveCount(0);
    await expect(page.getByRole("tab", { name: "Concept reveal" })).toHaveCount(0);
    await expect(page.getByRole("tab", { name: "Assembly" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("add-to-bag")).toBeEnabled();
    await expect(page.getByTestId("try-it-on")).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(media).toEqual([]);
    // Safe wording only, anywhere on the page.
    const words = (await page.locator("main").innerText()).toLowerCase();
    for (const banned of ["ruby", "implant-grade", "implant grade", "certified"]) expect(words).not.toContain(banned);
  });

  test("the film covers the anti-eyebrow form only; other forms and other designs keep the drawn assembly", async ({ page }) => {
    await openAssembly(page);
    await chooseForm(page, "nose");
    await expect(film(page)).toHaveCount(0);
    await expect(page.getByTestId("piece-assembly")).toHaveAttribute("data-hardware", "stud");
    await chooseForm(page, "anti-eyebrow");
    await expect(film(page)).toHaveAttribute("data-state", "idle");
    await expect(page.getByTestId("piece-assembly")).toHaveCount(0);

    await page.goto("/product/crimson-orbit");
    await expect(film(page)).toHaveCount(0);
    await expect(page.getByTestId("piece-assembly")).toHaveCount(1);
  });

  test("it is presentation only: Face Studio has no film", async ({ page }) => {
    await page.goto("/face-studio?product=desert-eye-love");
    await expect(page.getByTestId("studio-head")).toBeVisible();
    await expect(film(page)).toHaveCount(0);
    await expect(page.locator("video:not([data-testid='mascot-clip'])")).toHaveCount(0);
    await page.getByTestId("photo-input").first().setInputFiles(FIXTURE);
    await expect(page.getByTestId("placed-item")).toHaveCount(1);
    await expect(page.locator("video:not([data-testid='mascot-clip'])")).toHaveCount(0);
  });
});

test.describe("playback", () => {
  test.skip(({ browserName }) => !playback(browserName), "playback is checked in Chromium");

  test("plays once on a press, muted, with words at the right moments, then holds the completed piece", async ({ page }) => {
    const media = mediaRequests(page);
    await openAssembly(page);
    await page.getByTestId("film-play").click();
    await expect(film(page)).toHaveAttribute("data-state", "playing", { timeout: 15000 });
    expect(media.length).toBeGreaterThan(0);
    const video = page.getByTestId("film-video");
    await expect(video).toBeVisible();
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
    expect(await video.evaluate((v: HTMLVideoElement) => v.loop)).toBe(false);
    await expect(page.getByTestId("film-sound")).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByTestId("film-skip")).toBeVisible();
    // Early on, nothing is claimed yet.
    await expect(page.getByTestId("film-captions").locator("div")).toHaveCount(0);
    // Once the gemstone has seated, its words are there; once the piece is complete, all three are.
    await page.waitForFunction(() => (document.querySelector('[data-testid="film-video"]') as HTMLVideoElement)?.currentTime >= 6.2, null, { timeout: 15000 });
    await expect(page.getByTestId("film-captions")).toContainText("Deep-red faceted gemstone");
    await expect(film(page)).toHaveAttribute("data-state", "ended", { timeout: 15000 });
    const captions = page.getByTestId("film-captions");
    await expect(captions.locator("div")).toHaveCount(3);
    await expect(captions).toContainText("Titanium");
    await expect(captions).toContainText("Proposed");
    await expect(captions).toContainText("Material not yet confirmed");
    await expect(captions).toContainText("Polished finish");
    // The last frame holds, and it does not start again by itself.
    await expect(video).toBeVisible();
    expect(await video.evaluate((v: HTMLVideoElement) => v.ended || v.paused)).toBe(true);
    await expect(page.getByTestId("film-replay")).toBeVisible();
    await page.waitForTimeout(1200);
    expect(await state(page)).toBe("ended");
    expect(media.length).toBe(1);

    // Replay after a full play rewinds the held element and plays it again from the start.
    await page.getByTestId("film-replay").click();
    await expect(film(page)).toHaveAttribute("data-state", "playing", { timeout: 15000 });
    expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(3);
    await expect(page.getByTestId("film-captions").locator("div")).toHaveCount(0);
  });

  test("Skip goes straight to the completed piece, and Replay starts again from the beginning", async ({ page }) => {
    await openAssembly(page);
    await page.getByTestId("film-play").click();
    await expect(film(page)).toHaveAttribute("data-state", "playing", { timeout: 15000 });
    await page.getByTestId("film-skip").click();
    await expect(film(page)).toHaveAttribute("data-state", "ended");
    await expect(page.getByTestId("film-final")).toBeVisible();
    await expect(page.getByTestId("film-video")).toHaveCount(0);
    await expect(page.getByTestId("film-captions").locator("div")).toHaveCount(3);
    await expect(page.getByTestId("add-to-bag")).toBeEnabled();

    await page.getByTestId("film-replay").click();
    await expect(film(page)).toHaveAttribute("data-state", "playing", { timeout: 15000 });
    expect(await page.getByTestId("film-video").evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(3);
    await expect(page.getByTestId("film-captions").locator("div")).toHaveCount(0);
  });

  test("the keyboard reaches Play, Skip and Replay", async ({ page }) => {
    await openAssembly(page);
    await page.getByTestId("film-play").focus();
    await page.keyboard.press("Enter");
    await expect(film(page)).toHaveAttribute("data-state", "playing", { timeout: 15000 });
    await page.getByTestId("film-skip").focus();
    await page.keyboard.press("Enter");
    await expect(film(page)).toHaveAttribute("data-state", "ended");
    await page.getByTestId("film-replay").focus();
    await page.keyboard.press("Space");
    await expect(film(page)).toHaveAttribute("data-state", "playing", { timeout: 15000 });
  });

  test("a slow connection shows a loading note, then plays", async ({ page }) => {
    await page.route(/\/media\/product-animation\/.*\.(webm|mp4)/, async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });
    await openAssembly(page);
    await page.getByTestId("film-play").click();
    await expect(page.getByTestId("film-status")).toContainText("Loading");
    await expect(film(page)).toHaveAttribute("data-state", "playing", { timeout: 20000 });
  });

  test("a film that cannot load falls back to the completed piece with a clear note", async ({ page }) => {
    await page.route(/\/media\/product-animation\/.*\.(webm|mp4)/, (route) => route.abort());
    await openAssembly(page);
    await page.getByTestId("film-play").click();
    await expect(film(page)).toHaveAttribute("data-state", "failed", { timeout: 15000 });
    await expect(page.getByTestId("film-status")).toContainText("couldn't play");
    await expect(page.getByTestId("film-final")).toBeVisible();
    await expect(page.getByTestId("film-captions").locator("div")).toHaveCount(3);
    await expect(page.getByTestId("film-replay")).toBeVisible();
    await expect(page.getByTestId("add-to-bag")).toBeEnabled();
  });

  test("switching form while playing stops the film, and coming back starts from the poster", async ({ page }) => {
    await openAssembly(page);
    await page.getByTestId("film-play").click();
    await expect(film(page)).toHaveAttribute("data-state", "playing", { timeout: 15000 });
    await chooseForm(page, "micro-dermal");
    await expect(film(page)).toHaveCount(0);
    await expect(page.locator("video:not([data-testid='mascot-clip'])")).toHaveCount(0);
    await chooseForm(page, "anti-eyebrow");
    await expect(film(page)).toHaveAttribute("data-state", "idle");
  });

  test("returning from Try On finds the product page as it was left: poster, ready to play", async ({ page }) => {
    await openAssembly(page);
    await page.getByTestId("film-play").click();
    await expect(film(page)).toHaveAttribute("data-state", "playing", { timeout: 15000 });
    await page.getByTestId("try-it-on").click();
    await expect(page).toHaveURL(/\/face-studio\?product=desert-eye-love&form=anti-eyebrow/);
    await expect(page.locator("video:not([data-testid='mascot-clip'])")).toHaveCount(0);
    await page.goBack();
    await expect(page.getByTestId("pdp-beauty")).toBeVisible();
    await page.getByRole("tab", { name: "Assembly" }).click();
    await expect(film(page)).toHaveAttribute("data-state", "idle");
    await expect(page.getByTestId("film-play")).toBeVisible();
    await expect(page.getByTestId("add-to-bag")).toBeEnabled();
  });
});

test.describe("reduced motion", () => {
  test("shows the completed piece with all its words, and offers no playback", async ({ page }) => {
    const media = mediaRequests(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openAssembly(page);
    await expect(film(page)).toHaveAttribute("data-state", "ended");
    await expect(page.getByTestId("film-final")).toBeVisible();
    await expect(page.getByTestId("film-video")).toHaveCount(0);
    await expect(page.getByTestId("film-play")).toHaveCount(0);
    await expect(page.getByTestId("film-replay")).toHaveCount(0);
    await expect(page.getByTestId("film-captions").locator("div")).toHaveCount(3);
    await expect(page.getByTestId("film-status")).toContainText("Reduced motion");
    await page.waitForLoadState("networkidle");
    expect(media).toEqual([]);
  });
});

test.describe("on a phone", () => {
  test("the whole frame fits the screen, the controls are reachable, and the words sit under the picture", async ({ page }) => {
    await openAssembly(page);
    const width = page.viewportSize()!.width;
    const frame = (await film(page).locator(".product-film-frame").boundingBox())!;
    expect(frame.x).toBeGreaterThanOrEqual(0);
    expect(frame.x + frame.width).toBeLessThanOrEqual(width + 1);
    // A contained 16:9 frame, never a crop.
    expect(Math.abs(frame.width / frame.height - 16 / 9)).toBeLessThan(0.02);
    const play = (await page.getByTestId("film-play").boundingBox())!;
    expect(play.height).toBeGreaterThanOrEqual(44);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openAssembly(page);
    await expect(page.getByTestId("film-captions").locator("div")).toHaveCount(3);
    if (width < 640) {
      const captions = (await page.getByTestId("film-captions").boundingBox())!;
      const frameNow = (await film(page).locator(".product-film-frame").boundingBox())!;
      expect(captions.y).toBeGreaterThanOrEqual(frameNow.y + frameNow.height - 1);
    }
  });
});
