import { statSync } from "node:fs";
import path from "node:path";

// Server-only fixed allowlist shared by URL publication and the development route.
const FILES: Record<string, string[]> = {
  start: ["generated", "02-start-frame-full.png"],
  sand: ["generated", "04-sand-frame-full.png"],
  closeup: ["approved-gaara-red-gem.png"],
  // Owner-approved Stage 1 stills, 21 September 2026.
  seated: ["generated", "stage1", "03-seated-c.png"],
  "closeup-clean": ["generated", "stage1", "05-closeup-b.png"],
  // Homepage mascot poses, generated 21 September 2026. Internal, like every character picture.
  "chibi-idle": ["generated", "chibi", "01-idle.png"],
  "chibi-blink": ["generated", "chibi", "02-blink.png"],
  "chibi-yawn": ["generated", "chibi", "03-yawn.png"],
  "chibi-page": ["generated", "chibi", "04-page.png"],
  "chibi-look": ["generated", "chibi", "05-look.png"],
  // The small reader on a dune, for the homepage companion section (22 September 2026).
  "companion-dune": ["generated", "cinema", "gaara-dune.jpg"],
  // The mascot's animated clips, generated locally on 23 September 2026 (Wan 2.2 on this machine).
  // Internal like every other character picture: a build answers 404 here.
  "mascot-idle": ["generated", "mascot", "idle.mp4"],
  "mascot-react": ["generated", "mascot", "react.mp4"],
  // The local sand transition, composed here on 24 September 2026 from two locally generated clips.
  "sandfx-local": ["generated", "mascot", "sand-transition.mp4"],
  // The earlier supplied sand effect on blue, kept as the fallback while the local one is reviewed.
  sandfx: ["generated", "stage2", "07-sand-only-a.mp4"],
};

export function internalConceptPath(name: string): string | undefined {
  if (process.env.NODE_ENV === "production" || !Object.hasOwn(FILES, name)) return undefined;
  return path.join(process.cwd(), "references", ...FILES[name]);
}

/** Missing local references are normal in a checkout, so never advertise their URLs. */
export function internalConceptUrl(name: string, internal: boolean): string | undefined {
  if (!internal) return undefined;
  const file = internalConceptPath(name);
  if (!file) return undefined;
  try {
    const info = statSync(file);
    return info.isFile() && info.size > 0 ? `/api/dev-concept/${name}` : undefined;
  } catch {
    return undefined;
  }
}
