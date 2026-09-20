import { NextResponse } from "next/server";
import { getCommerceMode } from "@/lib/config/site";

// Server-side guard: a hidden button is not enough. In preview and waitlist modes every checkout
// attempt is refused here, and demo product ids are never forwarded to Shopify.
export async function POST() {
  const mode = getCommerceMode();
  if (mode !== "live") {
    return NextResponse.json(
      { error: "checkout_disabled", mode, message: "Checkout is disabled in this preview. Nothing was ordered." },
      { status: 403 },
    );
  }
  // Live checkout belongs to Milestone 2 and does not exist yet.
  return NextResponse.json(
    { error: "checkout_not_implemented", message: "Live checkout has not been built yet." },
    { status: 501 },
  );
}
