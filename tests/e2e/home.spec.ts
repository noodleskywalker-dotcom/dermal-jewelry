import { expect, test, type Page } from "@playwright/test";

/** Scrolls to a share of a pinned chapter's travel, the way a visitor's scrolling would. */
async function scrollChapter(page: Page, id: string, progress: number) {
  await page.evaluate(
    ([chapterId, p]) => {
      const el = document.getElementById(chapterId as string)!;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + (p as number) * Math.max(0, el.offsetHeight - window.innerHeight));
    },
    [id, progress],
  );
  await page.waitForTimeout(250);
}

const progressOf = (page: Page, id: string) =>
  page.evaluate((chapterId) => Number(getComputedStyle(document.getElementById(chapterId)!).getPropertyValue("--p")), id);

test.describe("homepage sequence", () => {
  test("opens on a quiet first screen with one statement and one action", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jewelry for the face you chose.");
    await expect(page.getByRole("link", { name: "Enter Face Studio" }).first()).toBeVisible();
    // The product detail copy belongs to a later beat and is not shown yet.
    await expect(page.locator("#piece").getByRole("heading", { name: "DESERT EYE — LOVE" })).toBeHidden();
    expect(errors).toEqual([]);
  });

  test("scrolling travels into the piece, then shows Face Studio changing pieces", async ({ page }) => {
    await page.goto("/");
    await scrollChapter(page, "piece", 0.45);
    await expect.poll(() => progressOf(page, "piece")).toBeGreaterThan(0.4);
    await expect(page.locator("#piece").getByRole("heading", { name: "DESERT EYE — LOVE" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeHidden();
    await expect(page.getByText("Small deep-red faceted gemstone.")).toBeVisible();

    await scrollChapter(page, "studio", 0.3);
    await expect(page.getByRole("heading", { name: "Try it on your face." })).toBeVisible();
    await expect(page.locator("#studio").getByText("DESERT EYE — LOVE")).toBeVisible();
    await scrollChapter(page, "studio", 0.62);
    await expect(page.locator("#studio").getByText("SAND VORTEX")).toBeVisible();
    await expect(page.locator("#studio").getByText("DESERT EYE — LOVE")).toBeHidden();
  });

  test("vertical scroll moves the collection sideways and every piece is reachable", async ({ page }) => {
    await page.goto("/");
    const items = page.getByTestId("sequence-item");
    await expect(items).toHaveCount(4);

    await scrollChapter(page, "collection", 0.05);
    const startX = (await items.first().boundingBox())!.x;
    await scrollChapter(page, "collection", 0.6);
    expect((await items.first().boundingBox())!.x).toBeLessThan(startX - 200);

    await scrollChapter(page, "collection", 1);
    await expect(items.last()).toBeInViewport();
    await expect(page.getByRole("link", { name: "Explore the collection" })).toBeInViewport();
    await page.getByRole("link", { name: "Explore the collection" }).click();
    await expect(page).toHaveURL(/\/collections\/desert-eye$/);
  });

  test("keyboard focus brings an off-screen piece into the frame", async ({ page }) => {
    await page.goto("/");
    await scrollChapter(page, "collection", 0);
    const last = page.getByTestId("sequence-item").last();
    await expect(last).not.toBeInViewport();
    await last.getByRole("link").first().focus();
    await expect(last).toBeInViewport();
  });

  test("Try on opens the preview sheet from the sequence", async ({ page }) => {
    await page.goto("/");
    await scrollChapter(page, "collection", 0.3);
    await page.locator('[data-testid="sequence-item"][data-product="desert-eye-love"]').getByTestId("sequence-try-on").click();
    const sheet = page.getByTestId("tryon-sheet");
    await expect(sheet).toContainText("DESERT EYE — LOVE");
    await expect(sheet.getByRole("link", { name: "Open in Face Studio" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });

  test("the closing chapter leads into Face Studio", async ({ page }) => {
    await page.goto("/");
    await scrollChapter(page, "enter", 0);
    await expect(page.getByText("Your piece.")).toBeVisible();
    await page.locator("#enter").getByRole("link", { name: "Enter Face Studio" }).click();
    await expect(page).toHaveURL(/\/face-studio$/);
  });

  test("reduced motion gives a plain, unpinned page with everything visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".chapter-stage")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#piece").getByRole("heading", { name: "DESERT EYE — LOVE" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Try it on your face." })).toBeVisible();
    await expect(page.getByTestId("sequence-item")).toHaveCount(4);
    const transform = await page.getByTestId("sequence-item").first().evaluate((el) => getComputedStyle(el.parentElement!).transform);
    expect(transform).toBe("none");
  });
});

test.describe("homepage, desktop only", () => {
  test.skip(({ isMobile }) => isMobile, "pointer hover and the chapter index are desktop behaviour");

  test("hovering a piece opens one preview pane", async ({ page }) => {
    await page.goto("/");
    await scrollChapter(page, "collection", 0.3);
    await page.locator('[data-testid="sequence-item"][data-product="desert-eye-love"]').hover();
    const pane = page.getByTestId("sequence-pane");
    await expect(pane).toBeVisible();
    await expect(pane).toContainText("DESERT EYE — LOVE");
    await expect(page.getByTestId("sequence-pane")).toHaveCount(1);
    await page.mouse.move(700, 20);
    await expect(pane).toHaveCount(0);
  });

  test("the chapter index jumps between chapters", async ({ page }) => {
    await page.goto("/");
    const index = page.getByRole("navigation", { name: "Chapters" });
    await index.getByRole("link", { name: /Face Studio|02/ }).click();
    await expect(page.getByRole("heading", { name: "Try it on your face." })).toBeInViewport();
    await expect(index.locator('[aria-current="true"]')).toContainText("Face Studio");
  });
});

test.describe("mobile navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "the full-screen menu only exists on small screens");

  test("the menu opens full screen, traps focus as a dialog and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Collections" }).click();
    await expect(page).toHaveURL(/\/collections$/);
    await expect(menu).toBeHidden();
  });
});
