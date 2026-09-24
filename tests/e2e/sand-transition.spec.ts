import { expect, test, type Page } from "@playwright/test";

// The mascot's sand transition, rebuilt on 24 September 2026 from clips generated on this machine:
// a ribbon that starts at the gourd and a full-frame wipe that takes over inside the dense grains.
// The earlier supplied clip is kept only as a fallback. All of it is internal concept media, so every
// test here skips on a machine that does not have it.

const hasMascot = async (page: Page) => (await page.getByTestId("global-mascot").count()) > 0;

test.describe("the local sand transition", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/collections");
    test.skip(!(await hasMascot(page)), "internal mascot media is not on this machine");
  });

  test("the local clip is what plays, and the supplied clip is not the path taken", async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (r) => r.url().includes("/api/dev-concept/sandfx") && requested.push(r.url().split("/").pop()!));
    await page.getByTestId("mascot").click();
    const sand = page.getByTestId("sand-transition");
    await expect(sand).toBeVisible({ timeout: 15_000 });
    await expect(sand).toHaveAttribute("data-source", "sandfx-local");
    // WebKit does not surface media requests to the page, so the list is only checked when it has
    // something in it. Either way the supplied clip must never be the one that played.
    if (requested.length) expect(requested).toContain("sandfx-local");
    expect(requested).not.toContain("sandfx");
  });

  test("the sand starts at the gourd, whatever size the mascot is drawn at", async ({ page }) => {
    await page.getByTestId("mascot").click();
    await expect(page.getByTestId("sand-transition")).toBeVisible({ timeout: 15_000 });
    // Early in the clip the sand is still pinned: its entry point must sit on the gourd's opening.
    const handle = await page.waitForFunction(
      () => {
        const fx = document.querySelector<HTMLCanvasElement>('[data-testid="story-effect"]');
        const at = Number(fx?.dataset.time ?? 0);
        const picture = document.querySelector<HTMLElement>('[data-testid="mascot"] video, [data-testid="mascot"] img');
        if (!fx || !picture || at < 0.1 || at > 0.9) return null;
        const box = picture.getBoundingClientRect();
        const m = new DOMMatrixReadOnly(getComputedStyle(fx).transform);
        return {
          // The mascot picture is contained in its box, and the gourd sits at these fractions of it.
          gourd: { x: box.left + 0.668 * box.width, y: box.top + 0.355 * box.height },
          // The composed clip's stream enters at (0.17, 0.02) of the footage.
          entry: { x: m.e + 0.17 * fx.width * m.a, y: m.f + 0.02 * fx.height * m.d },
        };
      },
      null,
      { timeout: 12_000, polling: "raf" },
    );
    const measured = (await handle.jsonValue())!;
    expect(Math.abs(measured.entry.x - measured.gourd.x)).toBeLessThan(3);
    expect(Math.abs(measured.entry.y - measured.gourd.y)).toBeLessThan(3);
  });

  test("the page only changes once the sand covers it, and the mascot reads again afterwards", async ({ page }) => {
    test.setTimeout(45_000);
    await page.getByTestId("mascot").click();
    await expect(page.getByTestId("sand-transition")).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/collections$/);
    await expect(page.getByTestId("story-effect")).toHaveAttribute("data-covered", "true", { timeout: 12_000 });
    await expect(page).toHaveURL(/\/collections\?family=desert-eye-love$/, { timeout: 15_000 });
    await expect(page.getByTestId("sand-transition")).toHaveCount(0, { timeout: 10_000 });
    const clip = page.getByTestId("mascot-clip");
    if ((await clip.count()) > 0) await expect(clip).toHaveAttribute("data-clip", "idle");
  });

  test("a second press works the same way", async ({ page }) => {
    test.setTimeout(60_000);
    await page.getByTestId("mascot").click();
    await expect(page.getByTestId("sand-transition")).toBeVisible({ timeout: 15_000 });
    await page.waitForURL(/family=desert-eye-love/, { timeout: 20_000 });
    await expect(page.getByTestId("sand-transition")).toHaveCount(0, { timeout: 10_000 });
    await page.getByTestId("mascot").click();
    await expect(page.getByTestId("sand-transition")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("sand-transition")).toHaveAttribute("data-source", "sandfx-local");
  });

  test("when no sand media can be loaded the link simply opens", async ({ page }) => {
    test.setTimeout(45_000);
    // Both the local clip and the older fallback are refused, which is the honest failure case.
    await page.route("**/api/dev-concept/sandfx*", (route) => route.abort());
    await page.getByTestId("mascot").click();
    await expect(page).toHaveURL(/\/collections\?family=desert-eye-love$/, { timeout: 20_000 });
    await expect(page.getByTestId("sand-transition")).toHaveCount(0);
  });

  test("with reduced motion there is no video and no sand", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/collections");
    await expect(page.getByTestId("mascot-clip")).toHaveCount(0);
    await page.getByTestId("mascot").click();
    await expect(page).toHaveURL(/\/collections\?family=desert-eye-love$/, { timeout: 15_000 });
    await expect(page.getByTestId("sand-transition")).toHaveCount(0);
  });
});
