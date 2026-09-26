export type FileKind = { mime: "image/jpeg" | "image/png" | "image/webp" | "application/pdf"; ext: ".jpg" | ".png" | ".webp" | ".pdf" };

const starts = (bytes: Uint8Array, signature: number[], offset = 0) => signature.every((b, i) => bytes[offset + i] === b);

/**
 * What a file really is, read from its first bytes. The name and the type a browser declares are
 * both ignored here: a renamed executable is refused because its bytes are not a picture or a PDF.
 */
export function sniff(bytes: Uint8Array): FileKind | null {
  if (bytes.length < 12) return null;
  if (starts(bytes, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: ".jpg" };
  if (starts(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", ext: ".png" };
  // RIFF....WEBP
  if (starts(bytes, [0x52, 0x49, 0x46, 0x46]) && starts(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return { mime: "image/webp", ext: ".webp" };
  if (starts(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return { mime: "application/pdf", ext: ".pdf" };
  return null;
}

/**
 * A file name that is safe to show in an email and to offer as a download: no path, no control or
 * markup characters, a bounded length, and the extension of what the bytes really are.
 */
export function safeFileName(original: string, kind: FileKind): string {
  const base = original.split(/[\\/]/).pop() ?? "";
  const stem = base
    .replace(/\.[^.]*$/, "")
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N} _-]+/gu, "-")
    .replace(/[\s_-]{2,}/g, "-")
    .replace(/^[-_\s.]+|[-_\s.]+$/g, "")
    .slice(0, 60);
  return `${stem || "reference"}${kind.ext}`;
}
