import { readFile } from "node:fs/promises";
import path from "node:path";
import { sniffFormat } from "@/lib/studio/photo";

// Development-only. Serves two internal concept images from the gitignored `references/generated/`
// folder so a local reveal prototype can be reviewed. The images are never in `public/`, never in
// Git and never deployed, and a production build always answers 404 here.
const FILES: Record<string, string> = {
  start: "02-start-frame-full.png",
  sand: "04-sand-frame-full.png",
};

const TYPES = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;

export async function GET(_request: Request, { params }: RouteContext<"/api/dev-concept/[name]">) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const { name } = await params;
  const file = FILES[name];
  if (!file) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readFile(path.join(process.cwd(), "references", "generated", file));
    const format = sniffFormat(bytes.subarray(0, 512));
    if (format !== "jpeg" && format !== "png" && format !== "webp") return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": TYPES[format], "Cache-Control": "no-store" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
