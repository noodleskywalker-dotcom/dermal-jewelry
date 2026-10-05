import { statSync } from "node:fs";
import path from "node:path";

/** Character campaign art is reviewable locally and on Vercel previews only. */
export function editorialPreviewEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";
}

/** Fixed paths keep user-controlled names out of filesystem lookups and deployment traces narrow. */
export function editorialPreviewPath(name: string): string | undefined {
  if (!editorialPreviewEnabled()) return undefined;
  switch (name) {
    case "gaara-portrait":
      return path.join(process.cwd(), "assets/editorial-preview/gaara-portrait.webp");
    case "gaara-detail":
      return path.join(process.cwd(), "assets/editorial-preview/gaara-detail.webp");
    case "ankh-reference":
      return path.join(process.cwd(), "assets/editorial-preview/ankh-reference.webp");
    case "crossline-reference":
      return path.join(process.cwd(), "assets/editorial-preview/crossline-reference.webp");
    default:
      return undefined;
  }
}

/** Do not advertise a review image until its non-empty file is present. */
export function editorialPreviewUrl(name: string): string | undefined {
  const file = editorialPreviewPath(name);
  if (!file) return undefined;
  try {
    const info = statSync(file);
    return info.isFile() && info.size > 0 ? `/api/editorial-preview/${name}` : undefined;
  } catch {
    return undefined;
  }
}

export function editorialPortraitUrl(): string | undefined {
  return editorialPreviewUrl("gaara-portrait");
}
