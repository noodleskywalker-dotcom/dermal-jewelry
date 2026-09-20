import { expect, test } from "@playwright/test";

test.describe("storefront navigation", () => {
  test("collections lead to the hero product without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/collections");
    await page.getByRole("link", { name: /View DESERT EYE/ }).click();
    await expect(page).toHaveURL(/\/collections\/desert-eye$/);
    await expect(page.getByTestId("product-card")).toHaveCount(2);

    await page.getByTestId("product-card").first().getByRole("link").first().click();
    await expect(page).toHaveURL(/\/product\/desert-eye-love$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("DESERT EYE — LOVE");
    await expect(page.getByText("Demo price").first()).toBeVisible();
    await expect(page.getByText("Unverified").first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("an unknown product returns a real 404", async ({ page }) => {
    const response = await page.goto("/product/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("isn’t here");
  });

  test("placement filters show real pieces or an honest empty state", async ({ page }) => {
    await page.goto("/shop?placement=dermal");
    await expect(page.getByTestId("product-card")).toHaveCount(3);
    await page.goto("/shop?placement=nostril");
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await page.goto("/shop?placement=septum");
    await expect(page.getByTestId("shop-empty")).toBeVisible();
    await page.goto("/shop?q=vortex");
    await expect(page.getByTestId("product-card")).toHaveCount(1);
  });

  test("shopping works without a photo or an account", async ({ page }) => {
    await page.goto("/product/sand-vortex");
    await page.getByTestId("add-to-bag").click();
    await expect(page.getByTestId("bag-line")).toHaveCount(1);
    await expect(page.getByTestId("bag-subtotal")).toHaveText("QAR 350");
  });

  test("the server refuses checkout in preview mode", async ({ request }) => {
    const response = await request.post("/api/checkout", { data: { lines: [{ id: "demo-desert-eye-love", quantity: 1 }] } });
    expect(response.status()).toBe(403);
    expect((await response.json()).error).toBe("checkout_disabled");
  });
});
