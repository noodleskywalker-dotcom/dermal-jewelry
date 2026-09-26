"use client";

import { useState } from "react";
import type { ProductRender } from "@/lib/catalog/types";
import { MaterialHotspots, type Hotspot } from "./MaterialHotspots";

// The owner's design render on the product page: the whole piece first, a closer view beside it.
// The picture stands straight on the paper (its own paper was lifted out when it was built), keeps
// its proportions at every width, and says once what it is: a design render, not a photograph of a
// made piece. It never supplies geometry to the placement preview or Face Studio.
export function RenderStage({ render, title, hotspots }: { render: ProductRender; title: string; /** Annotations placed on the whole-piece picture. */ hotspots?: Hotspot[] }) {
  const [view, setView] = useState<"front" | "detail">("front");
  const image = view === "detail" && render.detail ? render.detail : render.hero;
  return (
    <figure data-testid="render-stage" data-view={view} className="render-stage">
      <div className="render-stage-frame">
        {/* The figure takes the picture's own proportions, so an annotation stays on its part at any size. */}
        <div className="render-stage-figure" style={{ "--ratio": image.width / image.height } as React.CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={image.src}
          src={image.src}
          width={image.width}
          height={image.height}
          alt={`${title}: ${render.alt}${view === "detail" ? ", seen closer" : ""}. Design render.`}
          decoding="async"
          fetchPriority="high"
          data-testid="render-stage-image"
          className="render-stage-image"
        />
        {hotspots && view === "front" && <MaterialHotspots spots={hotspots} />}
        </div>
      </div>
      <div className="render-stage-controls">
        {render.detail && (
          <div className="flex flex-wrap gap-x-6">
            {(["front", "detail"] as const).map((id) => (
              <button
                key={id}
                type="button"
                data-testid={`render-view-${id}`}
                aria-pressed={view === id}
                onClick={() => setView(id)}
                className={`label-xs min-h-11 ${view === id ? "text-ink" : "text-ash hover:text-ink"}`}
              >
                {id === "front" ? "Whole piece" : "Detail"}
              </button>
            ))}
          </div>
        )}
        <figcaption className="label-xs text-ash" data-testid="render-note">
          {render.note}
        </figcaption>
      </div>
    </figure>
  );
}
