import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { internalConceptPath, internalConceptUrl } from "@/lib/story/internal-media";
import { internalCompanionStill, internalMascotClips, internalMascotMedia, internalSandFallback, internalSandSource, internalStoryMedia, storyFor } from "@/lib/story/registry";

describe("development concept media availability", () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(path.join(os.tmpdir(), "dermal-internal-media-"));
    vi.spyOn(process, "cwd").mockReturnValue(root);
    vi.stubEnv("NODE_ENV", "development");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    rmSync(root, { recursive: true, force: true });
  });
  const supply = (name: string) => {
    const file = internalConceptPath(name)!;
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, "local fixture");
    return file;
  };

  it("does not publish missing reference URLs or show a broken mascot", () => {
    expect(internalStoryMedia(storyFor("desert-eye")!, true)).toEqual({});
    expect(internalMascotMedia(true)).toBeNull();
    expect(internalMascotClips(true)).toBeNull();
    expect(internalCompanionStill(true)).toBeUndefined();
    expect(internalSandSource(true)).toBeUndefined();
    expect(internalSandFallback(true)).toBeUndefined();
  });

  it("only publishes present slots and uses the real idle still for missing poses", () => {
    supply("seated");
    supply("chibi-idle");
    supply("chibi-blink");
    expect(internalStoryMedia(storyFor("desert-eye")!, true)).toEqual({ character: "/api/dev-concept/seated" });
    expect(internalMascotMedia(true)).toEqual({
      idle: "/api/dev-concept/chibi-idle", blink: "/api/dev-concept/chibi-blink",
      look: "/api/dev-concept/chibi-idle", page: "/api/dev-concept/chibi-idle", yawn: "/api/dev-concept/chibi-idle",
    });
    supply("mascot-idle");
    expect(internalMascotClips(true)).toBeNull();
    supply("mascot-react");
    expect(internalMascotClips(true)).toEqual({ idle: "/api/dev-concept/mascot-idle", react: "/api/dev-concept/mascot-react" });
  });

  it("rejects directories, empty files and names outside the fixed allowlist", () => {
    const file = supply("sandfx-local");
    writeFileSync(file, "");
    expect(internalSandSource(true)).toBeUndefined();
    rmSync(file);
    mkdirSync(file);
    expect(internalSandSource(true)).toBeUndefined();
    for (const name of ["../secret", "constructor", "toString", "__proto__"]) {
      expect(internalConceptPath(name)).toBeUndefined();
      expect(internalConceptUrl(name, true)).toBeUndefined();
    }
  });

  it("keeps present franchise references inaccessible to every production build", () => {
    for (const name of ["seated", "chibi-idle", "mascot-idle", "mascot-react", "companion-dune", "sandfx-local", "sandfx"]) supply(name);
    expect(internalConceptUrl("seated", false)).toBeUndefined();
    vi.stubEnv("NODE_ENV", "production");
    expect(internalConceptPath("seated")).toBeUndefined();
    expect(internalStoryMedia(storyFor("desert-eye")!, true)).toEqual({});
    expect(internalMascotMedia(true)).toBeNull();
    expect(internalMascotClips(true)).toBeNull();
    expect(internalCompanionStill(true)).toBeUndefined();
    expect(internalSandSource(true)).toBeUndefined();
    expect(internalSandFallback(true)).toBeUndefined();
  });
});
