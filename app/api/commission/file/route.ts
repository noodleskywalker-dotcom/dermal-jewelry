import { deliveryFor } from "@/lib/commission/delivery";
import { FILES } from "@/lib/commission/options";
import { readFileLink } from "@/lib/commission/receipt";

/**
 * Opens one private commission reference for the owner, from the signed link in their email. A link
 * without a valid signature, or past its expiry, opens nothing, and a file is only ever served as the
 * kind its bytes were checked to be when it was uploaded.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const delivery = deliveryFor(request);
  if (!delivery) return new Response("Not available", { status: 503 });

  const url = new URL(request.url);
  const receipt = readFileLink(url.searchParams.get("r"), url.searchParams.get("e"), url.searchParams.get("s"), delivery.secret);
  if (!receipt || !(FILES.mimeTypes as readonly string[]).includes(receipt.type)) return new Response("Not found", { status: 404 });

  const stored = await delivery.store.get(receipt.pathname).catch(() => null);
  if (!stored) return new Response("Not found", { status: 404 });

  const inline = receipt.type !== "application/pdf";
  return new Response(Buffer.from(stored.bytes), {
    headers: {
      "Content-Type": receipt.type,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(receipt.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
