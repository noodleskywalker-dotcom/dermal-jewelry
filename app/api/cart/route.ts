import { NextResponse } from "next/server";
import { addToCart, fetchCart, removeLine, updateLine, type CartSummary } from "@/lib/shopify/cart";
import { isShopifyConfigured, ShopifyError } from "@/lib/shopify/client";

/**
 * The cart's only door. Every Storefront call happens here, on the server, so the private token
 * never reaches a browser; the client sends an action and a cart id and gets back the cart Shopify
 * now holds, totals included.
 *
 * Nothing about a photo or a face is ever sent here, and nothing is stored on the server: the cart
 * id lives in the customer's own browser and Shopify holds the cart itself.
 */

export const dynamic = "force-dynamic";

type Action =
  | { action: "get"; cartId: string }
  | { action: "add"; cartId: string | null; merchandiseId: string; quantity?: number }
  | { action: "update"; cartId: string; lineId: string; quantity: number }
  | { action: "remove"; cartId: string; lineId: string };

const MAX_QUANTITY = 10;

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: "bad_request", message }, { status });
}

function isGid(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("gid://shopify/");
}

export async function POST(request: Request) {
  if (!isShopifyConfigured()) {
    return NextResponse.json(
      { ok: false, error: "not_configured", message: "This storefront has no commerce backend configured." },
      { status: 503 },
    );
  }

  let body: Action;
  try {
    body = (await request.json()) as Action;
  } catch {
    return bad("The request body was not JSON.");
  }

  try {
    let cart: CartSummary | null;
    switch (body.action) {
      case "get": {
        if (!isGid(body.cartId)) return bad("A cart id is required.");
        cart = await fetchCart(body.cartId);
        // An unknown id is not an error: the cart was completed or expired, and the customer simply
        // has none. The browser is told to forget it.
        return NextResponse.json({ ok: true, cart, forget: cart === null });
      }
      case "add": {
        if (!isGid(body.merchandiseId)) return bad("A merchandise id is required.");
        const quantity = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(body.quantity ?? 1)));
        cart = await addToCart(isGid(body.cartId) ? body.cartId : null, [{ merchandiseId: body.merchandiseId, quantity }]);
        break;
      }
      case "update": {
        if (!isGid(body.cartId) || !isGid(body.lineId)) return bad("A cart id and a line id are required.");
        const quantity = Math.min(MAX_QUANTITY, Math.max(0, Math.floor(body.quantity)));
        cart = await updateLine(body.cartId, body.lineId, quantity);
        break;
      }
      case "remove": {
        if (!isGid(body.cartId) || !isGid(body.lineId)) return bad("A cart id and a line id are required.");
        cart = await removeLine(body.cartId, body.lineId);
        break;
      }
      default:
        return bad("Unknown cart action.");
    }
    return NextResponse.json({ ok: true, cart });
  } catch (error) {
    const failure = error instanceof ShopifyError ? error : null;
    console.error("[dermal] a cart action failed:", failure?.message ?? error, failure?.detail ?? "");
    // The customer is told the bag is unavailable, never given Shopify's internals.
    return NextResponse.json(
      { ok: false, error: "cart_unavailable", message: "The bag could not be reached. Nothing was changed." },
      { status: 502 },
    );
  }
}
