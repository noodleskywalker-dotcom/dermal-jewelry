import { get, put } from "@vercel/blob";
import { sign } from "./security";

/**
 * Where commission references are kept and how the request reaches the owner.
 *
 * References go to Vercel Blob as **private** files: nothing a customer sends is reachable by a
 * public address, and nothing is written to the server's own disk, to `public/` or to the browser.
 * The request goes to the owner by email through Resend, with the references attached and with
 * signed links that open the private files through this site.
 *
 * Both need a secret that only the server holds. Without them the form says plainly that it could
 * not send, and never pretends it did.
 */

export type StoredReference = { bytes: Uint8Array; contentType: string };

export interface ReferenceStore {
  put(pathname: string, bytes: Uint8Array, contentType: string): Promise<void>;
  get(pathname: string): Promise<StoredReference | null>;
}

export type OutgoingEmail = {
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
  attachments: { filename: string; content: string }[];
  idempotencyKey: string;
};

export interface Mailer {
  send(email: OutgoingEmail): Promise<void>;
}

export type Delivery = { store: ReferenceStore; mailer: Mailer; secret: string; to: string };

export const DEFAULT_TO = "noodleskywalker@gmail.com";
// Resend's shared sender works before a domain is verified, but only to the Resend account's own address.
const DEFAULT_FROM = "DERMAL Commissions <onboarding@resend.dev>";

export class DeliveryError extends Error {
  constructor(
    readonly stage: "not-configured" | "storage" | "email",
    message: string,
  ) {
    super(message);
  }
}

const blobStore = (token: string): ReferenceStore => ({
  async put(pathname, bytes, contentType) {
    await put(pathname, Buffer.from(bytes), { access: "private", contentType, token, addRandomSuffix: false, allowOverwrite: false });
  },
  async get(pathname) {
    const result = await get(pathname, { access: "private", token, useCache: false });
    if (!result || result.statusCode !== 200) return null;
    return { bytes: new Uint8Array(await new Response(result.stream).arrayBuffer()), contentType: result.blob.contentType };
  },
});

const resendMailer = (apiKey: string, from: string): Mailer => ({
  async send(email) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // A retried request with the same reference is sent once, not twice.
        "Idempotency-Key": email.idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [email.to],
        reply_to: email.replyTo,
        subject: email.subject,
        html: email.html,
        text: email.text,
        attachments: email.attachments,
      }),
    });
    if (!response.ok) {
      // The provider's message can name the account, so it is not passed on to the customer.
      throw new DeliveryError("email", `email provider answered ${response.status}`);
    }
  },
});

/** The real delivery, from the server's environment, or null when it has not been set up. */
export function deliveryFromEnv(env: NodeJS.ProcessEnv = process.env): Delivery | null {
  const blobToken = env.BLOB_READ_WRITE_TOKEN;
  const resendKey = env.RESEND_API_KEY;
  if (!blobToken || !resendKey) return null;
  // A dedicated secret when one is set; otherwise one derived from a secret the server already holds.
  const secret = env.COMMISSION_SIGNING_SECRET || sign("dermal-commission-links", blobToken);
  return {
    store: blobStore(blobToken),
    mailer: resendMailer(resendKey, env.COMMISSION_FROM_EMAIL || DEFAULT_FROM),
    secret,
    to: env.COMMISSION_TO_EMAIL || DEFAULT_TO,
  };
}

// ── Development and tests only ──────────────────────────────────────────────────────────────────
// A request carrying `x-dermal-commission-mock` is served by an in-memory store and mailer, so the
// whole route can be exercised without sending anything. A production build ignores the header.

export type MockMode = "ok" | "fail-email" | "fail-storage";

type MockState = { files: Map<string, StoredReference>; sent: OutgoingEmail[] };
const mockState: MockState = ((globalThis as { __dermalCommissionMock?: MockState }).__dermalCommissionMock ??= { files: new Map(), sent: [] });

export function mockModeOf(request: Request): MockMode | null {
  if (process.env.NODE_ENV === "production") return null;
  const value = request.headers.get("x-dermal-commission-mock");
  return value === "ok" || value === "fail-email" || value === "fail-storage" ? value : null;
}

export function mockDelivery(mode: MockMode): Delivery {
  return {
    secret: "dermal-development-only",
    to: DEFAULT_TO,
    store: {
      async put(pathname, bytes, contentType) {
        if (mode === "fail-storage") throw new DeliveryError("storage", "mock storage failure");
        mockState.files.set(pathname, { bytes, contentType });
      },
      async get(pathname) {
        return mockState.files.get(pathname) ?? null;
      },
    },
    mailer: {
      async send(email) {
        if (mode === "fail-email") throw new DeliveryError("email", "mock email failure");
        mockState.sent.push(email);
      },
    },
  };
}

/** The mock's outbox, for tests. */
export function mockOutbox(): OutgoingEmail[] {
  return mockState.sent;
}

/** The delivery for this request: the mock when a development request asks for it, else the real one. */
export function deliveryFor(request: Request): Delivery | null {
  const mode = mockModeOf(request);
  return mode ? mockDelivery(mode) : deliveryFromEnv();
}
