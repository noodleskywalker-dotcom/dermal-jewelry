import { NextResponse } from "next/server";
import { DeliveryError, deliveryFor, mockModeOf } from "@/lib/commission/delivery";
import { commissionEmail, type ReferenceLink } from "@/lib/commission/email";
import { FILES, readFields, validateFields } from "@/lib/commission/options";
import { fileLink, readReceipt, type Receipt } from "@/lib/commission/receipt";
import { clientKey, createRateLimiter, requestId } from "@/lib/commission/security";

/**
 * A commission request: checked again here whatever the browser said, then sent to the owner.
 *
 * Success is reported only after the email provider has accepted the message. A request that cannot
 * be delivered fails, visibly, and the customer's page keeps everything they entered.
 */

export const dynamic = "force-dynamic";

const limiter = createRateLimiter(5, 10 * 60 * 1000);
const MAX_BODY = 64 * 1024;
// Attachments stay well inside the email provider's 40 MB message limit once base64 is counted.
// A file past this is never dropped: it is sent as a private link and marked "link only".
const MAX_ATTACHED = 20 * 1024 * 1024;
// A whole request can never be more than the allowed files at their allowed size.
const MAX_TOTAL = FILES.maxCount * FILES.maxBytes;

function fail(status: number, error: string, message: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error, message, ...extra }, { status });
}

export async function POST(request: Request) {
  const delivery = deliveryFor(request);
  if (!delivery) return fail(503, "not_configured", "Commission requests can’t be received right now.");

  const key = clientKey(request) + (mockModeOf(request) ? `|${request.headers.get("x-dermal-test-key") ?? ""}` : "");
  if (!limiter.take(key)) return fail(429, "rate_limited", "Too many requests in a short time. Please wait a few minutes and try again.");

  const raw = await request.text();
  if (raw.length > MAX_BODY) return fail(413, "too_large", "That request is too long.");
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return fail(400, "bad_request", "That request could not be read.");
  }

  // The honeypot: a field no person sees. Anything in it is a script filling every box.
  if (typeof body.website === "string" && body.website.trim() !== "") return fail(400, "rejected", "That request could not be accepted.");

  const fields = readFields(body.fields);
  const errors = validateFields(fields);
  if (Object.keys(errors).length) return fail(422, "invalid", "Some details need another look.", { errors });

  const refs = Array.isArray(body.files) ? body.files : [];
  if (refs.length > FILES.maxCount) return fail(422, "too_many_files", `Send up to ${FILES.maxCount} files.`);
  const receipts: Receipt[] = [];
  for (const ref of refs) {
    const receipt = readReceipt(ref, delivery.secret);
    if (!receipt) return fail(422, "bad_file", "One of the files was not uploaded through this form. Please add it again.");
    if (!receipts.some((r) => r.pathname === receipt.pathname)) receipts.push(receipt);
  }
  if (receipts.reduce((sum, r) => sum + r.size, 0) > MAX_TOTAL) return fail(413, "too_large", "Those files are too large together.");

  const id = requestId();
  const origin = new URL(request.url).origin;
  const links: ReferenceLink[] = [];
  const attachments: { filename: string; content: string }[] = [];
  let attached = 0;
  try {
    for (const receipt of receipts) {
      const stored = await delivery.store.get(receipt.pathname);
      if (!stored) return fail(422, "bad_file", "One of the files could not be found. Please add it again.");
      if (stored.bytes.byteLength > FILES.maxBytes) return fail(413, "too_large", "Each file must be 4 MB or smaller.");
      const attach = attached + stored.bytes.byteLength <= MAX_ATTACHED;
      if (attach) {
        attached += stored.bytes.byteLength;
        attachments.push({ filename: receipt.name, content: Buffer.from(stored.bytes).toString("base64") });
      }
      links.push({ name: receipt.name, size: receipt.size, contentType: receipt.type, url: fileLink(origin, receipt, delivery.secret), attached: attach });
    }

    const email = commissionEmail(id, fields, links, new Date());
    await delivery.mailer.send({ ...email, to: delivery.to, replyTo: fields.email.trim(), attachments, idempotencyKey: id });
  } catch (error) {
    const stage = error instanceof DeliveryError ? error.stage : "email";
    // Only the stage is logged, never the customer's details or files.
    console.error(`[commission] delivery failed at ${stage}`);
    return fail(502, "delivery_failed", "We couldn’t send your request.");
  }

  return NextResponse.json({ ok: true, id });
}
