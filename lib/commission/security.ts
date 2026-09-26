import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

// No 0/O, 1/I/L: a customer reads the reference aloud or types it into a message.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** A request reference such as DRM-C-8F2K1: random, short, and never a sequence anyone could count. */
export function requestId(): string {
  let id = "";
  for (let i = 0; i < 5; i++) id += ALPHABET[randomInt(ALPHABET.length)];
  return `DRM-C-${id}`;
}

export function isRequestId(value: string): boolean {
  return /^DRM-C-[2-9A-HJKMNP-Z]{5}$/.test(value);
}

/**
 * Signs a value with the server's secret. An upload receipt is signed so the request step can trust
 * that a file really came through the upload step, and a file link is signed so only the owner's
 * email can open a private reference.
 */
export function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function verify(value: string, signature: string, secret: string): boolean {
  const expected = Buffer.from(sign(value, secret));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Escapes text for HTML, so nothing a customer types can become markup in the owner's inbox. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"'`]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" })[c]!);
}

type Window = { hits: number[] };

/**
 * A small sliding-window limiter held in the server's memory. On a serverless platform each instance
 * keeps its own count, so this is a brake on one visitor hammering the form, not a global quota.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const windows = new Map<string, Window>();
  return {
    /** True when the request may go ahead, and counts it. */
    take(key: string, now = Date.now()): boolean {
      const w = windows.get(key) ?? { hits: [] };
      w.hits = w.hits.filter((t) => now - t < windowMs);
      if (w.hits.length >= limit) {
        windows.set(key, w);
        return false;
      }
      w.hits.push(now);
      windows.set(key, w);
      // Forget idle visitors so the map cannot grow without end.
      if (windows.size > 5000) for (const [k, v] of windows) if (!v.hits.some((t) => now - t < windowMs)) windows.delete(k);
      return true;
    },
  };
}

/** The visitor's address as the platform reports it. Only ever used as a rate-limit key, never stored. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}
