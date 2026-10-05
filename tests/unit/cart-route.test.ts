import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/cart/route";

beforeEach(() => {
  vi.stubEnv("SHOPIFY_STORE_DOMAIN", "");
  vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "");
});
afterEach(() => vi.unstubAllEnvs());

const request = (body: unknown) => new Request("http://localhost/api/cart", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

describe("cart input without a configured backend", () => {
  it.each([null, { action: "unknown" }, { action: "add" }, { action: "get", cartId: "../../etc/passwd" }])("refuses malformed input before checking Shopify: %j", async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, error: "bad_request" });
  });

  it("refuses a nonnumeric quantity rather than coercing it", async () => {
    const response = await POST(request({ action: "add", merchandiseId: "gid://shopify/ProductVariant/1", quantity: "many" }));
    expect(response.status).toBe(400);
  });

  it("still refuses a valid operation without Shopify credentials", async () => {
    const response = await POST(request({ action: "get", cartId: "gid://shopify/Cart/1" }));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ ok: false, error: "not_configured" });
  });
});
