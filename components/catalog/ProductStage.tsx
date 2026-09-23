"use client";

import { useEffect, useState } from "react";
import type { ProductMedia } from "@/lib/catalog/types";
import { useAmbientVideo } from "@/lib/motion/useAmbientVideo";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";

// The premium stage for a piece that has real media: the hero clip, held on its last frame, with the
// still views beside it. It is presentation only. The media is generated from the owner's reference
// and preserves the piece's shape; it is not photography of a made product, and it says so once.
type StageView = "film" | "front" | "angle" | "macro";

export function ProductStage({ media, title }: { media: ProductMedia; title: string }) {
  const reduced = useReducedMotion();
  const [view, setView] = useState<StageView>("film");
  const [paused, setPaused] = useState(false);
  const live = !reduced && view === "film" && !!media.film;
  const video = useAmbientVideo(media.film ?? [], live);

  useEffect(() => {
    const v = video.current;
    if (!v || !live) return;
    if (paused) v.pause();
    else void v.play().catch(() => undefined);
  }, [paused, live, video]);

  const stills: { id: Exclude<StageView, "film">; label: string; src: string | undefined }[] = [
    { id: "front", label: "Front", src: media.hero },
    { id: "angle", label: "Angle", src: media.angle },
    { id: "macro", label: "Detail", src: media.macro },
  ];
  const stillSrc = view === "angle" ? (media.angle ?? media.hero) : view === "macro" ? (media.macro ?? media.hero) : media.hero;

  return (
    <figure data-testid="product-stage" data-view={view} className="product-stage">
      <div className="product-stage-frame">
        {view === "film" && media.film && !reduced ? (
          <video
            ref={video}
            data-testid="product-stage-film"
            className="product-stage-media"
            poster={media.poster ?? media.hero}
            muted
            loop
            playsInline
            autoPlay={!paused}
            preload="metadata"
            aria-label={`${title}, turning slowly in the light`}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stillSrc}
            alt={`${title}, ${view === "macro" ? "close" : view === "angle" ? "at an angle" : "whole, from the front"}`}
            className="product-stage-media"
            decoding="async"
          />
        )}
      </div>

      <div className="product-stage-controls">
        <div className="flex flex-wrap gap-x-6">
          <button type="button" data-testid="stage-view-film" aria-pressed={view === "film"} onClick={() => setView("film")} className={`label-xs min-h-11 ${view === "film" ? "text-ink" : "text-ash hover:text-ink"}`}>
            In motion
          </button>
          {stills
            .filter((s) => s.src)
            .map((s) => (
              <button key={s.id} type="button" data-testid={`stage-view-${s.id}`} aria-pressed={view === s.id} onClick={() => setView(s.id)} className={`label-xs min-h-11 ${view === s.id ? "text-ink" : "text-ash hover:text-ink"}`}>
                {s.label}
              </button>
            ))}
        </div>
        {view === "film" && media.film && !reduced && (
          <button
            type="button"
            data-testid="stage-pause"
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
            className="label-xs min-h-11 text-ash hover:text-ink"
          >
            {paused ? "Play" : "Pause"}
          </button>
        )}
      </div>
      <figcaption className="label-xs mt-3 text-ash">{media.note}</figcaption>
    </figure>
  );
}
