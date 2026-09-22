"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import { activeItem } from "@/lib/studio/look";
import { ANCHORS, PlacementPreview } from "@/components/catalog/PlacementPreview";
import { LookRenderer } from "@/components/studio/LookRenderer";
import { useStudio } from "@/components/studio/StudioProvider";

// 07: SEE IT ON YOU. An extreme close crop around the placement (outer eye and temple), the piece
// prominent. With a photo already in this browser's memory, it is the customer's own face through
// the shared renderer; otherwise the sculptural surface. The photo never leaves the browser.
export function SeeItOnYou({ product }: { product: Product }) {
  const { photo, look } = useStudio();
  const active = activeItem(look);
  const anchor = ANCHORS["anti-eyebrow"] ?? { x: 0.66, y: 0.45 };
  return (
    <section aria-labelledby="onyou-heading" data-testid="onyou-section" className="onyou">
      <div className="onyou-crop" data-testid="onyou-crop" data-source={photo ? "photo" : "sculpture"}>
        {photo && active ? (
          <LookRenderer photo={photo} items={look.items} zoom={{ x: active.group.x, y: active.group.y, factor: 2.4 }} label="Your photo, close, with the selected piece" className="h-full w-full" />
        ) : (
          <div className="crop-head" style={{ "--px": anchor.x, "--py": anchor.y, "--s": 2.6, "--tx": 0.56, "--ty": 0.46 } as React.CSSProperties}>
            <PlacementPreview product={product} formId="anti-eyebrow" bare />
          </div>
        )}
        <p className="label-xs absolute bottom-4 left-4 text-ash">{photo ? "Your photo · stays on this device" : "Sculpted form, not a person"} · approximate</p>
      </div>
      <div className="onyou-copy">
        <p className="label-xs">06 / ON YOU</p>
        <h2 id="onyou-heading" className="mt-4 font-display text-[clamp(2.25rem,4.4vw,4.5rem)] font-light uppercase leading-[0.98] tracking-[0.04em]">
          See it on you.
        </h2>
        <Link href={`/face-studio?product=${product.slug}`} className="text-link mt-8" data-testid="onyou-try">
          Try on your face <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
