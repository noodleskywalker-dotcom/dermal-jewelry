import { mkdtempSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/editorial-preview/[name]/route";
import { editorialPortraitUrl, editorialPreviewPath, editorialPreviewUrl } from "@/lib/story/editorial-preview";

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, statSync: vi.fn(actual.statSync) };
});
vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return { ...actual, readFile: vi.fn(actual.readFile) };
});

// A one-pixel WebP fixture, independent of the campaign artwork.
const WEBP = Buffer.from("UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA", "base64");
const get = (name: string) => GET(new Request(`https://preview.example/api/editorial-preview/${name}`), {
  params: Promise.resolve({ name }),
});

describe("preview-only campaign media", () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(path.join(os.tmpdir(), "dermal-editorial-preview-"));
    vi.spyOn(process, "cwd").mockReturnValue(root);
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "development");
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    rmSync(root, { recursive: true, force: true });
  });
  const supply = (name = "gaara-portrait", bytes: Uint8Array = WEBP) => {
    const file = editorialPreviewPath(name)!;
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, bytes);
    return file;
  };

  it("serves valid artwork locally and in a production-mode Vercel preview", async () => {
    supply();
    supply("gaara-detail");
    for (const environment of ["development", "production"]) {
      vi.stubEnv("NODE_ENV", environment);
      vi.stubEnv("VERCEL_ENV", "preview");
      expect(editorialPortraitUrl()).toBe("/api/editorial-preview/gaara-portrait");
      expect(editorialPreviewUrl("gaara-detail")).toBe("/api/editorial-preview/gaara-detail");
      const response = await get("gaara-portrait");
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("image/webp");
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
      expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(Buffer.from(await response.arrayBuffer())).toEqual(WEBP);
    }
  });

  it("never publishes, stats or reads campaign files in a public production build", async () => {
    supply();
    vi.stubEnv("NODE_ENV", "production");
    for (const environment of ["production", "development", "", undefined]) {
      vi.stubEnv("VERCEL_ENV", environment);
      expect(editorialPreviewPath("gaara-portrait")).toBeUndefined();
      expect(editorialPortraitUrl()).toBeUndefined();
      expect((await get("gaara-portrait")).status).toBe(404);
    }
    expect(statSync).not.toHaveBeenCalled();
    expect(readFile).not.toHaveBeenCalled();
  });

  it("rejects path traversal and object-property names before any filesystem access", async () => {
    supply();
    for (const name of ["../gaara-portrait", "gaara-portrait.webp", "../secret", "constructor", "toString", "__proto__"]) {
      expect(editorialPreviewPath(name)).toBeUndefined();
      expect(editorialPreviewUrl(name)).toBeUndefined();
      expect((await get(name)).status).toBe(404);
    }
    expect(statSync).not.toHaveBeenCalled();
    expect(readFile).not.toHaveBeenCalled();
  });

  it("does not advertise missing, empty or directory fixtures", async () => {
    expect(editorialPortraitUrl()).toBeUndefined();
    expect((await get("gaara-portrait")).status).toBe(404);
    const file = supply("gaara-portrait", new Uint8Array());
    expect(editorialPortraitUrl()).toBeUndefined();
    expect((await get("gaara-portrait")).status).toBe(404);
    rmSync(file);
    mkdirSync(file);
    expect(editorialPortraitUrl()).toBeUndefined();
    expect((await get("gaara-portrait")).status).toBe(404);
  });

  it("rejects non-WebP bytes even when the filename is allowlisted", async () => {
    supply("gaara-portrait", Buffer.from("<svg>not a WebP</svg>"));
    const response = await get("gaara-portrait");
    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
  });
});
