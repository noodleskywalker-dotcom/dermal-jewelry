import { formOf } from "@/lib/catalog";
import type { PlacementId, Product } from "@/lib/catalog/types";
import { FormVisual } from "./FormVisual";

// Placement preview on a deliberately featureless sculpted head. This is an approved presentation
// device, not a stand-in for a missing photograph: it shows where a form sits without showing a
// person. It is separate from a character showcase and from the customer's own photo in Face Studio.
//
// Each placement has its own anchor, so a nose form is drawn on the nose and never on the cheek.
const ANCHORS: Partial<Record<PlacementId, { x: number; y: number }>> = {
  "anti-eyebrow": { x: 0.665, y: 0.452 },
  dermal: { x: 0.672, y: 0.548 },
  nostril: { x: 0.557, y: 0.566 },
};

export function PlacementPreview({ product, formId, bare = false }: { product: Product; formId: string; /** No frame and no caption: the head stands on the page itself. */ bare?: boolean }) {
  const form = formOf(product, formId);
  const anchor = ANCHORS[form.placement];

  return (
    <figure data-testid="placement-preview" data-form={form.id} data-placement={form.placement} className={`relative aspect-[4/5] overflow-hidden text-ink ${bare ? "h-full max-w-full" : "w-full"}`}>
      {/* A smooth sculpted head, built only from soft light and shade. There are no drawn lines. */}
      <svg
        viewBox="0 0 800 1000"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        // Standing on the page itself, the bust has no cut edge: it fades into the paper.
        style={bare ? { maskImage: "linear-gradient(to bottom, #000 76%, transparent 98%)", WebkitMaskImage: "linear-gradient(to bottom, #000 76%, transparent 98%)" } : undefined}
      >
        <defs>
          <linearGradient id="head-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbfaf7" />
            <stop offset="1" stopColor="#f1eee7" />
          </linearGradient>
          <linearGradient id="head-form" x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0" stopColor="#f6f3ec" />
            <stop offset="0.5" stopColor="#e6e1d6" />
            <stop offset="1" stopColor="#c9c2b4" />
          </linearGradient>
          <radialGradient id="head-light" cx="0.34" cy="0.26" r="0.62">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="head-core" cx="0.72" cy="0.7" r="0.6">
            <stop offset="0" stopColor="#8f8676" stopOpacity="0.38" />
            <stop offset="1" stopColor="#8f8676" stopOpacity="0" />
          </radialGradient>
          <filter id="head-soft" filterUnits="userSpaceOnUse" x="0" y="0" width="800" height="1000">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="head-softer" filterUnits="userSpaceOnUse" x="0" y="0" width="800" height="1000">
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <clipPath id="head-clip">
            <path d="M400 96 C566 96 646 236 640 416 C635 566 590 700 520 778 C482 820 318 820 280 778 C210 700 165 566 160 416 C154 236 234 96 400 96 Z" />
          </clipPath>
        </defs>
        {!bare && <rect width="800" height="1000" fill="url(#head-ground)" />}
        <ellipse cx="400" cy="985" rx="330" ry="26" fill="#9a917f" opacity="0.18" filter="url(#head-soft)" />
        {/* Neck and shoulders. */}
        <path d="M312 740 C312 850 262 900 96 946 L96 1000 L704 1000 L704 946 C538 900 488 850 488 740 Z" fill="url(#head-form)" />
        <ellipse cx="400" cy="800" rx="150" ry="46" fill="#8f8676" opacity="0.4" filter="url(#head-soft)" />
        {/* The head, then its light and its turning edge. */}
        <path d="M400 96 C566 96 646 236 640 416 C635 566 590 700 520 778 C482 820 318 820 280 778 C210 700 165 566 160 416 C154 236 234 96 400 96 Z" fill="url(#head-form)" />
        <g clipPath="url(#head-clip)">
          <rect width="800" height="1000" fill="url(#head-core)" />
          <rect width="800" height="1000" fill="url(#head-light)" />
          {/* Eye sockets, the bridge and tip of the nose, and the hollow under it: shade only. */}
          <ellipse cx="300" cy="432" rx="78" ry="34" fill="#9c9382" opacity="0.34" filter="url(#head-softer)" />
          <ellipse cx="500" cy="432" rx="78" ry="34" fill="#9c9382" opacity="0.34" filter="url(#head-softer)" />
          <ellipse cx="392" cy="500" rx="16" ry="92" fill="#ffffff" opacity="0.5" filter="url(#head-soft)" />
          <ellipse cx="428" cy="520" rx="20" ry="80" fill="#8f8676" opacity="0.26" filter="url(#head-soft)" />
          <ellipse cx="402" cy="604" rx="46" ry="16" fill="#8f8676" opacity="0.3" filter="url(#head-soft)" />
          <ellipse cx="400" cy="676" rx="64" ry="14" fill="#8f8676" opacity="0.16" filter="url(#head-soft)" />
        </g>
      </svg>

      {anchor && (
        <div
          className="absolute aspect-square -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${anchor.x * 100}%`, top: `${anchor.y * 100}%`, width: `${form.defaultScale * 100 * 1.15}%` }}
        >
          <FormVisual product={product} formId={form.id} pieceTestId={() => "placement-piece"} />
        </div>
      )}

      <figcaption className={bare ? "sr-only" : "label-xs absolute inset-x-3 bottom-3 flex justify-between gap-4 text-ink/60"}>
        <span>{form.label} · wearer&rsquo;s left</span>
        <span>Sculpted form, not a person. Approximate.</span>
      </figcaption>
    </figure>
  );
}
