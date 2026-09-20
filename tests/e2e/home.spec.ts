import { expect, test } from "@playwright/test";

test.describe("homepage", () => {
  test("opens quietly and scrolls like a normal page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jewelry for the face you chose.");
    await expect(page.getByRole("link", { name: "Enter Face Studio" }).first()).toBeVisible();

    // Nothing is pinned: no full-height sticky stage exists, and the wheel moves the page one-to-one.
    const pinned = await page.evaluate(() =>
      [...document.querySelectorAll("main *")].filter((el) => {
        const s = getComputedStyle(el);
        return s.position === "sticky" && el.getBoundingClientRect().height >= window.innerHeight * 0.9;
      }).length,
    );
    expect(pinned).toBe(0);

    await page.mouse.move(200, 300);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(600);
    await page.mouse.wheel(0, 900);
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(1500);
    await expect(page.getByRole("heading", { level: 1 })).not.toBeInViewport();
    expect(errors).toEqual([]);
  });

  test("presents original and anime-inspired pieces together and leads to the family page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("product-card")).toHaveCount(4);
    await page.getByRole("link", { name: /View the design family/ }).click();
    await expect(page).toHaveURL(/\/product\/desert-eye-love$/);
  });

  test("the Face Studio demonstration changes the piece on request, not on scroll", async ({ page }) => {
    await page.goto("/");
    const piece = page.getByTestId("studio-demo-piece");
    await expect(piece).toHaveAttribute("data-product", "desert-eye-love");
    await page.getByRole("button", { name: "SAND VORTEX", exact: true }).click();
    await expect(piece).toHaveAttribute("data-product", "sand-vortex");
  });

  test("reduced motion shows every section without entrance animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const hidden = await page.evaluate(() => [...document.querySelectorAll(".reveal")].filter((el) => getComputedStyle(el).opacity !== "1").length);
    expect(hidden).toBe(0);
  });
});

test.describe("mobile navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "the full-screen menu only exists on small screens");

  test("the menu opens full screen as a dialog and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Collections" }).click();
    await expect(page).toHaveURL(/\/collections$/);
    await expect(menu).toBeHidden();
  });
});
