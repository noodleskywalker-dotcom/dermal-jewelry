"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAmbientVideo, type VideoSource } from "@/lib/motion/useAmbientVideo";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";

// 01: the opening shot. The piece in low-key light, sand drifting through the beam, one glint on the
// stone: an ambient loop, muted, with a pause control (it moves for longer than five seconds). It is
// atmosphere, not a story reveal, and it starts from the exact approved product frame. With reduced
// motion it is the still. The words sit low on the left, in ivory, and never cover the piece.
export function CinemaHero({ sources, poster }: { sources: VideoSource[]; poster: string }) {
  const reduced = useReducedMotion();
  const video = useAmbientVideo(sources, !reduced);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v || reduced) return;
    if (paused) v.pause();
    // Only a refused autoplay means paused; an AbortError is a newer load taking over and is ignored.
    else void v.play().catch((e: unknown) => e instanceof DOMException && e.name === "NotAllowedError" && setPaused(true));
  }, [paused, reduced, video]);

  return (
    <section aria-labelledby="landing-heading" data-testid="cinema-hero" className="cinema-hero">
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" aria-hidden="true" className="cinema-hero-media" />
      ) : (
        <video ref={video} data-testid="cinema-hero-video" className="cinema-hero-media" poster={poster} muted loop playsInline autoPlay preload="auto" aria-hidden="true" />
      )}
      <div className="cinema-hero-veil" aria-hidden="true" />
      <div className="cinema-hero-copy">
        <p className="label-xs">DERMAL · Collection 001</p>
        <p className="mt-4 font-display text-[clamp(1.25rem,1.7vw,1.6rem)] font-light tracking-[0.14em]">DESERT EYE&nbsp;—&nbsp;LOVE</p>
        <h1 id="landing-heading" className="mt-5 font-display text-[clamp(2.5rem,5.2vw,5.25rem)] font-light leading-[1.02] tracking-[0.01em]">
          Jewelry for the face you chose.
        </h1>
        <div className="mt-9 flex flex-wrap gap-x-10 gap-y-2">
          <Link href="/face-studio" data-testid="cta-face" className="text-link">
            View on your face <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/collections" data-testid="cta-selection" className="text-link">
            View selection <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      {!reduced && (
        <button type="button" data-testid="cinema-hero-pause" aria-pressed={paused} onClick={() => setPaused((p) => !p)} className="cinema-hero-pause label-xs">
          {paused ? "Play" : "Pause"}
        </button>
      )}
      <p className="cinema-hero-scroll label-xs" aria-hidden="true">
        Scroll
      </p>
    </section>
  );
}
