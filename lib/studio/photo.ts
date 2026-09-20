export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_EDGE_PX = 2048;
export const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPT_ATTR = ACCEPTED_MIME.join(",");

export type PhotoErrorCode = "unsupported" | "heic" | "too-large" | "empty" | "undecodable";

export class PhotoError extends Error {
  constructor(
    public code: PhotoErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PhotoError";
  }
}

export type SniffedFormat = "jpeg" | "png" | "webp" | "heic" | "svg" | "unknown";

/** Identifies the real format from the first bytes, regardless of the file's name or declared type. */
export function sniffFormat(bytes: Uint8Array): SniffedFormat {
  const b = bytes;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (
    b.length >= 8 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return "png";
  }
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (b.length >= 12 && ascii(4, 8) === "ftyp") {
    const brand = ascii(8, 12);
    if (["heic", "heix", "hevc", "heim", "heis", "mif1", "msf1"].includes(brand)) return "heic";
  }
  const head = ascii(0, Math.min(b.length, 256)).trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return "svg";
  return "unknown";
}

/** Checks size and real format before any decoding. Throws PhotoError with a customer-readable message. */
export function validatePhotoBytes(size: number, headBytes: Uint8Array): "jpeg" | "png" | "webp" {
  if (size === 0) throw new PhotoError("empty", "That file is empty. Choose a JPEG, PNG or WebP photo.");
  if (size > MAX_FILE_BYTES) {
    throw new PhotoError("too-large", "That photo is larger than 10 MB. Choose a smaller JPEG, PNG or WebP.");
  }
  const format = sniffFormat(headBytes);
  if (format === "heic") {
    throw new PhotoError(
      "heic",
      "HEIC photos can't be opened here yet. Export the photo as JPEG from your phone and try again.",
    );
  }
  if (format !== "jpeg" && format !== "png" && format !== "webp") {
    throw new PhotoError("unsupported", "That file isn't a supported photo. Use a JPEG, PNG or WebP image.");
  }
  return format;
}

/** Working size after limiting the longest edge. */
export function fitWithin(width: number, height: number, maxEdge = MAX_EDGE_PX) {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const ratio = maxEdge / longest;
  return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) };
}

/**
 * Validates, decodes and re-encodes a photo entirely in the browser.
 * Re-encoding applies EXIF orientation and drops the original metadata.
 * The result is an object URL that only this page can read.
 */
export async function loadLocalPhoto(file: File): Promise<{ url: string; width: number; height: number }> {
  const head = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  validatePhotoBytes(file.size, head);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new PhotoError("undecodable", "That photo couldn't be opened. It may be damaged. Try another image.");
  }

  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new PhotoError("undecodable", "This browser couldn't prepare the photo.");
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    canvas.width = 0;
    canvas.height = 0;
    if (!blob) throw new PhotoError("undecodable", "This browser couldn't prepare the photo.");
    return { url: URL.createObjectURL(blob), width, height };
  } finally {
    bitmap.close();
  }
}
