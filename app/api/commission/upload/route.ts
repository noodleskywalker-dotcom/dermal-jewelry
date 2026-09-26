import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { deliveryFor, mockModeOf } from "@/lib/commission/delivery";
import { safeFileName, sniff } from "@/lib/commission/files";
import { FILES } from "@/lib/commission/options";
import { issueReceipt } from "@/lib/commission/receipt";
import { clientKey, createRateLimiter } from "@/lib/commission/security";

/**
 * One reference file for a commission request, checked and stored before anything else happens.
 *
 * The file's bytes decide what it is, never its name or declared type. Only JPEG, PNG, WebP and PDF
 * are kept, each under the size limit, under a random name in private storage. Nothing is written to
 * this server's disk. The answer is a signed receipt the request step can trust.
 */

export const dynamic = "force-dynamic";

const limiter = createRateLimiter(30, 10 * 60 * 1000);

function fail(status: number, error: string, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

export async function POST(request: Request) {
  const delivery = deliveryFor(request);
  if (!delivery) return fail(503, "not_configured", "Commission requests can’t be received right now.");

  // In development a test may name its own bucket, so one test never spends another's allowance.
  const key = clientKey(request) + (mockModeOf(request) ? `|${request.headers.get("x-dermal-test-key") ?? ""}` : "");
  if (!limiter.take(key)) return fail(429, "rate_limited", "Too many files in a short time. Please wait a few minutes.");

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > FILES.maxBytes + 64 * 1024) return fail(413, "too_large", "Each file must be 4 MB or smaller.");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "bad_request", "That upload could not be read.");
  }
  const file = form.get("file");
  if (!(file instanceof File)) return fail(400, "bad_request", "No file was sent.");
  if (file.size === 0) return fail(400, "empty", "That file is empty.");
  if (file.size > FILES.maxBytes) return fail(413, "too_large", "Each file must be 4 MB or smaller.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(bytes);
  if (!kind) return fail(415, "unsupported_type", "Only JPG, PNG, WEBP and PDF files can be sent.");

  const name = safeFileName(file.name, kind);
  const pathname = `commissions/references/${new Date().toISOString().slice(0, 7)}/${randomUUID()}${kind.ext}`;
  try {
    await delivery.store.put(pathname, bytes, kind.mime);
  } catch {
    return fail(502, "storage_failed", "The file could not be stored.");
  }

  const receipt = { pathname, name, size: bytes.byteLength, type: kind.mime };
  return NextResponse.json({ ok: true, ref: issueReceipt(receipt, delivery.secret), name, size: receipt.size, type: kind.mime });
}
