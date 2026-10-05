import { readFile } from "node:fs/promises";
import { editorialPreviewEnabled, editorialPreviewPath } from "@/lib/story/editorial-preview";
import { sniffFormat } from "@/lib/studio/photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REVIEW_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
};
const notFound = () => new Response("Not found", { status: 404, headers: REVIEW_HEADERS });

export async function GET(_request: Request, { params }: RouteContext<"/api/editorial-preview/[name]">) {
  // Fail before resolving a file or reading its bytes in public production deployments.
  if (!editorialPreviewEnabled()) return notFound();
  const { name } = await params;
  const file = editorialPreviewPath(name);
  if (!file) return notFound();
  try {
    const bytes = await readFile(file);
    if (sniffFormat(bytes.subarray(0, 512)) !== "webp") return notFound();
    return new Response(new Uint8Array(bytes), {
      headers: {
        ...REVIEW_HEADERS,
        "Content-Type": "image/webp",
        "Content-Length": String(bytes.length),
      },
    });
  } catch {
    return notFound();
  }
}
