/** Set only after the owner chooses the public canonical domain. Preview URLs are never canonical. */
export function canonicalOrigin(): URL | undefined {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? new URL(url.origin) : undefined;
  } catch {
    return undefined;
  }
}
