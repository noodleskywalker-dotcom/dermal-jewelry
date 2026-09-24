import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { sniffFormat } from "@/lib/studio/photo";

// Development-only. Serves a fixed list of internal concept files from the gitignored `references/`
// folder so the local reveal and story prototypes can be reviewed. The files are never in
// `public/`, never in Git and never deployed, and a production build always answers 404 here.
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
  // Generic sand effect on blue. It contains no character.
  sandfx: ["generated", "stage2", "07-sand-only-a.mp4"],
};

const TYPES = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;
const notFound = () => new Response("Not found", { status: 404 });

export async function GET(request: Request, { params }: RouteContext<"/api/dev-concept/[name]">) {
  if (process.env.NODE_ENV === "production") return notFound();
  const { name } = await params;
  const file = FILES[name];
  if (!file) return notFound();
  const full = path.join(process.cwd(), "references", ...file);
  try {
    if (full.endsWith(".mp4")) return await video(request, full);
    const bytes = await readFile(full);
    const format = sniffFormat(bytes.subarray(0, 512));
    if (format !== "jpeg" && format !== "png" && format !== "webp") return notFound();
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": TYPES[format], "Cache-Control": "no-store" } });
  } catch {
    return notFound();
  }
}

// Safari only plays a video it can ask for in byte ranges, so ranges are honoured.
async function video(request: Request, full: string) {
  const bytes = await readFile(full);
  // An MP4 starts with a box size followed by "ftyp".
  if (bytes.subarray(4, 8).toString("latin1") !== "ftyp") return notFound();
  const size = (await stat(full)).size;
  const base = { "Content-Type": "video/mp4", "Accept-Ranges": "bytes", "Cache-Control": "no-store" };
  const range = request.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
  if (!range) return new Response(new Uint8Array(bytes), { headers: { ...base, "Content-Length": String(size) } });
  const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(size - 1, Number(range[2])) : size - 1;
  if (start > end || start >= size) return new Response(null, { status: 416, headers: { ...base, "Content-Range": `bytes */${size}` } });
  return new Response(new Uint8Array(bytes.subarray(start, end + 1)), {
    status: 206,
    headers: { ...base, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
  });
}
