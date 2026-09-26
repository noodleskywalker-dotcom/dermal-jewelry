import { sign, verify } from "./security";

/**
 * What the upload step hands back for one stored reference. It is signed with the server's secret,
 * so the request step can trust the path, name, size and type without taking the browser's word
 * for any of them, and a link can be made to open that one private file and nothing else.
 */
export type Receipt = { pathname: string; name: string; size: number; type: string };

const encode = (receipt: Receipt) => Buffer.from(JSON.stringify(receipt)).toString("base64url");

export function issueReceipt(receipt: Receipt, secret: string): string {
  const payload = encode(receipt);
  return `${payload}.${sign(`upload:${payload}`, secret)}`;
}

function decode(payload: string): Receipt | null {
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<Receipt>;
    if (
      typeof value.pathname !== "string" ||
      !value.pathname.startsWith("commissions/references/") ||
      typeof value.name !== "string" ||
      typeof value.size !== "number" ||
      typeof value.type !== "string"
    ) {
      return null;
    }
    return { pathname: value.pathname, name: value.name, size: value.size, type: value.type };
  } catch {
    return null;
  }
}

export function readReceipt(ref: unknown, secret: string): Receipt | null {
  if (typeof ref !== "string" || ref.length > 2000) return null;
  const [payload, signature] = ref.split(".");
  if (!payload || !signature || !verify(`upload:${payload}`, signature, secret)) return null;
  return decode(payload);
}

/** How long a reference link in the owner's email keeps working. The files are attached as well. */
export const LINK_DAYS = 30;

/**
 * A link that opens one private reference through this site, until it expires. The expiry is part of
 * what is signed, so it cannot be extended by editing the address. It carries no customer detail
 * beyond the file's own name.
 */
export function fileLink(origin: string, receipt: Receipt, secret: string, now = Date.now()): string {
  const payload = encode(receipt);
  const expires = Math.floor(now / 1000) + LINK_DAYS * 24 * 60 * 60;
  return `${origin}/api/commission/file?r=${payload}&e=${expires}&s=${sign(`file:${payload}:${expires}`, secret)}`;
}

export function readFileLink(r: string | null, e: string | null, s: string | null, secret: string, now = Date.now()): Receipt | null {
  if (!r || !e || !s || r.length > 2000 || !/^\d{1,12}$/.test(e)) return null;
  if (Number(e) * 1000 < now || !verify(`file:${r}:${e}`, s, secret)) return null;
  return decode(r);
}
