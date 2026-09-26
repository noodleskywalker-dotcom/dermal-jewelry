# Commission requests

Built 26 September 2026. Route: `/commission`. A customer describes a piece, chooses a placement and
optional preferences, attaches reference files, and sends the request to the studio by email. It is a
request, never an order: nothing is priced, reserved or charged.

## How a request travels

```
browser ──(one file per request)──▶ POST /api/commission/upload
                                     · rate limit (30 files / 10 min per visitor)
                                     · size ≤ 4 MB, not empty
                                     · type read from the file's first bytes (JPEG, PNG, WebP, PDF only)
                                     · safe file name
                                     · stored as a PRIVATE blob: commissions/references/<yyyy-mm>/<uuid>.<ext>
                                     ◀── signed receipt (path, name, size, type, HMAC)

browser ──(fields + receipts)──────▶ POST /api/commission
                                     · rate limit (5 requests / 10 min per visitor)
                                     · honeypot, body ≤ 64 KB
                                     · every field validated again (the same rules the browser used)
                                     · every receipt's signature checked; the blob is read back
                                     · at most 6 files, 4 MB each, 24 MB together
                                     · request ID, e.g. DRM-C-8F2K1 (random, never sequential)
                                     · email to COMMISSION_TO_EMAIL through Resend:
                                         subject "NEW DERMAL COMMISSION — <ID>", reply-to the customer,
                                         files attached up to 20 MB in total; every file also gets a
                                         signed link valid for 30 days, and a file past the attachment
                                         budget is sent as a link marked "link only", never dropped
                                     ◀── { ok: true, id } only after Resend accepted the email

owner's email ──(signed link)──────▶ GET /api/commission/file?r=…&e=…&s=…
                                     · HMAC over the file and its expiry checked, expiry enforced,
                                       private blob streamed back
                                     · nosniff, sandboxed CSP, no-store, noindex; PDFs download
```

Nothing is written to the server's disk, to `public/`, or to browser storage. Customer text is escaped
before it enters the email's HTML. Failures log only the stage that failed, never customer details.

A large **photo** is resized in the browser (long edge 2560 px, JPEG) so any phone picture can be sent;
a PDF over 4 MB is refused with a message. If the upload or the email fails, the page says so, keeps
every field and file, and a retry does not upload the stored files again.

## Status: built, not yet sending

Real commission sending is **unavailable until the Blob and Resend credentials are configured**. Until
then every request is refused honestly with "We couldn’t send your request…" (HTTP 503), and nothing is
stored. This was verified against a production build (`next start`) on 26 September 2026; a production
build also ignores the development mock header.

## The only external setup still required

| Where | Variable | How |
| --- | --- | --- |
| Vercel | `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → project `openlimits/dermal-jewelry` → Storage → Create → **Blob** → connect it to the project for Preview and Production. Vercel sets the variable itself. |
| Resend | `RESEND_API_KEY` | Create a Resend account **with noodleskywalker@gmail.com**, create an API key (sending access), and add it to the Vercel project for Preview and Production. |
| Recipient | `COMMISSION_TO_EMAIL=noodleskywalker@gmail.com` | Optional: this is already the default. Set it only to send elsewhere. |

Then redeploy the preview so the functions read the new variables. For local testing, `vercel env pull
.env.local` merges them in (check that every existing key in `.env.local` is kept).

Until a sending domain is verified in Resend, the default sender `onboarding@resend.dev` can deliver only
to the address that owns the Resend account, which is why that account should be the studio's Gmail.
Once a DERMAL domain exists, verify it in Resend and set `COMMISSION_FROM_EMAIL`, for example
`DERMAL Commissions <commissions@your-domain>`. `COMMISSION_SIGNING_SECRET` is optional.

## Security checklist (verified 26 September 2026)

| Requirement | How it is met | Evidence |
| --- | --- | --- |
| Secrets server-only | Read only in route handlers; no `NEXT_PUBLIC_` | Build output scanned: no secret name, Resend or Blob code in `.next/static` |
| Uploaded files private | `access: "private"` on every `put` | `lib/commission/delivery.ts` |
| Links not permanently public | HMAC-signed, expire after 30 days, expiry inside the signature | Unit tests: valid, expired, extended and re-signed links |
| File names sanitised | Path, markup and control characters removed, length capped, real extension | Unit tests |
| Real file type checked | Magic bytes decide; name and declared type ignored | Unit and e2e tests: renamed executable → 415 |
| Size limited | 4 MB per file, 6 files, 24 MB per request, 64 KB request body | Unit tests: oversized → 413 |
| Rate limiting | 30 uploads and 5 requests per 10 minutes per visitor | Unit and e2e tests → 429 |
| Recipient never from the client | Only `COMMISSION_TO_EMAIL` or the default | Unit test on the outbox |
| No customer HTML in the email | Every value escaped | Unit test with a `<script>` description |
| Failure never shows success | Success only after the provider accepts the email | Unit and e2e tests with failed email and storage |

## Limits and known gaps

- The rate limiter lives in each server instance's memory. It stops one visitor hammering the form; it
  is not a global quota. Vercel Firewall rules or BotID are the next step if spam appears.
- Uploaded files from abandoned requests stay in the Blob store. A periodic clean-up of
  `commissions/references/` older than, say, 90 days is not built.
- No confirmation email is sent to the customer (no sending domain yet, and marketing sends need approval).
- HEIC files are refused; iPhones normally hand the browser a JPEG when a photo is picked.

## Development and tests

A request carrying the header `x-dermal-commission-mock: ok | fail-email | fail-storage` is served by an
in-memory store and outbox. A production build ignores the header. Unit tests call the route handlers
directly (`tests/unit/commission.test.ts`); Playwright routes the page's calls through the mock
(`tests/e2e/launch.spec.ts`). Nothing is emailed by any test.
