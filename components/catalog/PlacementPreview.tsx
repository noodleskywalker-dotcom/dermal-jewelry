import { formOf } from "@/lib/catalog";
import type { PlacementId, Product } from "@/lib/catalog/types";
import { resolveComponents } from "@/lib/studio/geometry";
import { JewelryArt } from "@/components/studio/JewelryArt";

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

export function PlacementPreview({ product, formId }: { product: Product; formId: string }) {
  const form = formOf(product, formId);
  const anchor = ANCHORS[form.placement];
  const pieces = resolveComponents(product, { side: "left", tweaks: {}, formId: form.id });

  return (
    <figure data-testid="placement-preview" data-form={form.id} data-placement={form.placement} className="relative aspect-[4/5] w-full overflow-hidden bg-bone">
      <svg viewBox="0 0 800 1000" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="head-form" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#d9d3c6" />
            <stop offset="0.55" stopColor="#c4bdaf" />
            <stop offset="1" stopColor="#a39c8e" />
          </linearGradient>
          <radialGradient id="head-light" cx="0.36" cy="0.3" r="0.7">
            <stop offset="0" stopColor="#f3efe6" stopOpacity="0.9" />
            <stop offset="1" stopColor="#f3efe6" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Neck and shoulders, then the head: smooth planes, no features. */}
        <path d="M300 760 C300 850 250 900 120 940 L120 1000 L680 1000 L680 940 C550 900 500 850 500 760 Z" fill="url(#head-form)" />
        <path d="M400 110 C560 110 640 240 636 410 C632 560 590 690 520 770 C480 815 320 815 280 770 C210 690 168 560 164 410 C160 240 240 110 400 110 Z" fill="url(#head-form)" />
        <path d="M400 110 C560 110 640 240 636 410 C632 560 590 690 520 770 C480 815 320 815 280 770 C210 690 168 560 164 410 C160 240 240 110 400 110 Z" fill="url(#head-light)" />
        {/* The faintest planes for brow and nose so placements can be read. */}
        <path d="M250 410 C310 380 360 384 384 404 M416 404 C440 384 490 380 550 410" fill="none" stroke="#8f887a" strokeOpacity="0.28" strokeWidth="5" strokeLinecap="round" />
        <path d="M400 420 C394 490 380 540 372 570 C384 590 416 590 428 570" fill="none" stroke="#8f887a" strokeOpacity="0.3" strokeWidth="5" strokeLinecap="round" />
      </svg>

      {anchor && (
        <div
          className="absolute aspect-square -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${anchor.x * 100}%`, top: `${anchor.y * 100}%`, width: `${form.defaultScale * 100 * 1.15}%` }}
        >
          {pieces.map((c) => (
            <span
              key={c.id}
              data-testid="placement-piece"
              className="absolute block"
              style={{ left: `${c.leftPct}%`, top: `${c.topPct}%`, width: `${c.widthPct}%`, transform: "translate(-50%, -50%)" }}
            >
              <JewelryArt art={c.art} />
            </span>
          ))}
        </div>
      )}

      <figcaption className="label-xs absolute inset-x-3 bottom-3 flex justify-between gap-4 text-ink/60">
        <span>{form.label} · wearer&rsquo;s left</span>
        <span>Featureless form, not a person. Approximate.</span>
      </figcaption>
    </figure>
  );
}
