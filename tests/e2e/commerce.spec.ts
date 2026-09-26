import { expect, test } from "@playwright/test";

// Wiring the approved storefront to Shopify (the owner's brief, 24 September 2026).
//
// The store holds no products yet, so these run against the fallback: every family keeps its whole
// editorial presentation and none of them is purchasable. That is the state the integration has to
// survive, and it is the one a visitor sees today.

test.describe("the storefront stands up without commerce", () => {
  test("every page renders with an empty Shopify store, and nothing hangs or blanks", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of ["/", "/shop", "/collections", "/product/horus-trace", "/cart", "/face-studio"]) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} answered ${response?.status()}`).toBeLessThan(400);
      await expect(page.locator("main")).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test("the catalogue still holds every family, and the taxonomy is untouched", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByTestId("product-card")).toHaveCount(10);
    const lines = page.getByRole("navigation", { name: "Browse the collection" });
    for (const label of ["All", "Men", "Women", "Full collection", "Inspired", "Original", "Limited edition"]) {
      await expect(lines.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    const placements = page.getByRole("navigation", { name: "Filter by placement" });
    for (const label of ["Anti-eyebrow", "Dermal", "Nose", "Eyebrow", "Septum", "Lip"]) {
      await expect(placements.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    // The filters still filter the same way they did before commerce was wired in.
    await page.goto("/shop?browse=inspired");
    await expect(page.getByTestId("product-card")).toHaveCount(2);
    await page.goto("/shop?browse=limited");
    await expect(page.getByTestId("shop-empty")).toContainText("No limited edition has been announced.");
  });

  test("a piece with no Shopify product keeps its demo presentation and is not sold", async ({ page }) => {
    await page.goto("/product/horus-trace");
    // The price is the demo placeholder and says so; it is never dressed up as a selling price.
    await expect(page.getByTestId("family-price")).toContainText("Price pending");
    await expect(page.getByTestId("purchase-note")).toHaveText("Demo · nothing can be ordered yet");
    const button = page.getByTestId("add-to-bag");
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("data-backing", "demo");
    await expect(button).toContainText("Add to demo bag");
  });

  test("the demo bag still works end to end while the store is empty", async ({ page }) => {
    await page.goto("/product/crimson-orbit");
    await page.getByTestId("add-to-bag").click();
    const line = page.getByTestId("bag-line").first();
    await expect(line).toBeVisible();
    await expect(page.getByTestId("bag-subtotal")).toBeVisible();
    await page.goto("/cart");
    await expect(page.locator('[data-testid="bag-line"]')).toHaveCount(1);
    await expect(page.getByText("Demo prices only.")).toBeVisible();
    await expect(page.getByTestId("checkout-button")).toBeDisabled();
  });
});

test.describe("a concept is never given a way to be bought", () => {
  test("KIRI has no price, no variant and no button anywhere", async ({ page }) => {
    await page.goto("/shop");
    const kiri = page.getByTestId("catalogue-concepts").locator('[data-concept="KIRI"]');
    await expect(kiri).toContainText("Concept");
    await expect(kiri.getByRole("button")).toHaveCount(0);
    await expect(kiri).not.toContainText("QAR");
    // It is not a product route at all.
    const response = await page.goto("/product/kiri");
    expect(response?.status()).toBe(404);
  });
});

test.describe("the Storefront token never reaches a browser", () => {
  test("no script the page loads carries the token or the private header", async ({ page }) => {
    const bodies: string[] = [];
    page.on("response", async (response) => {
      const type = response.headers()["content-type"] ?? "";
      if (!/javascript|html/.test(type)) return;
      bodies.push(await response.text().catch(() => ""));
    });
    for (const route of ["/", "/shop", "/product/horus-trace", "/cart"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle").catch(() => undefined);
    }
    expect(bodies.length).toBeGreaterThan(0);
    for (const body of bodies) {
      expect(body).not.toContain("shpat_");
      expect(body).not.toContain("Shopify-Storefront-Private-Token");
      expect(body).not.toContain("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
    }
  });
});

test.describe("the cart endpoint", () => {
  test("refuses a malformed request instead of guessing", async ({ request }) => {
    const bad = await request.post("/api/cart", { data: { action: "add" } });
    expect(bad.status()).toBe(400);
    expect(await bad.json()).toMatchObject({ ok: false, error: "bad_request" });

    const unknown = await request.post("/api/cart", { data: { action: "not-an-action" } });
    expect(unknown.status()).toBe(400);
  });

  test("refuses an id that is not a Shopify id", async ({ request }) => {
    const spoofed = await request.post("/api/cart", { data: { action: "get", cartId: "../../etc/passwd" } });
    expect(spoofed.status()).toBe(400);
  });

  test("answers about a cart Shopify does not have without failing the page", async ({ request }) => {
    const missing = await request.post("/api/cart", {
      data: { action: "get", cartId: "gid://shopify/Cart/definitely-not-a-cart" },
    });
    // Either Shopify says it has no such cart, or the call could not be made. Both are answered
    // cleanly with a body the interface can act on, and neither is a crash.
    expect([200, 502, 503]).toContain(missing.status());
    const body = await missing.json();
    expect(body).toHaveProperty("ok");
    if (body.ok) expect(body.cart).toBeNull();
    else expect(typeof body.message).toBe("string");
  });

  test("never returns Shopify's internals to the browser", async ({ request }) => {
    const answer = await request.post("/api/cart", { data: { action: "get", cartId: "gid://shopify/Cart/nope" } });
    const text = await answer.text();
    expect(text).not.toContain("shpat_");
    expect(text).not.toContain("myshopify.com/api");
  });
});

test.describe("Face Studio is untouched by commerce", () => {
  test("it still opens on a piece and places it, with no price or bag wiring in the way", async ({ page }) => {
    await page.goto("/face-studio?product=crossline&form=micro-dermal");
    await expect(page.getByTestId("studio-product").first()).toBeVisible();
    // The studio rail still offers every family, including those with no Shopify product.
    for (const slug of ["desert-eye-love", "horus-trace", "blade-trace", "crossline", "ankh-trace"]) {
      await expect(page.locator(`[data-testid="studio-product"][data-product="${slug}"]`)).toHaveCount(1);
    }
    // Nothing in the studio claims a piece can be bought or that it fits.
    const text = (await page.locator("main").innerText()).toLowerCase();
    for (const claim of ["add to bag", "checkout", "in stock", "implant-grade", "hypoallergenic"]) {
      expect(text).not.toContain(claim);
    }
  });
});
