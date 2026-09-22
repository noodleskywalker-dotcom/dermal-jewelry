"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useScrollProgress } from "@/lib/motion/useScrollProgress";

// 01–02: the cinematic product hero and the 360° scroll experience, one pinned stage.
// The piece, huge, fills the screen from the first frame; scrolling turns it through front, side,
// rear, other side and front again (the approved orbit, 72 stills, one true turn, never ping-pong).
// The words live in the corners at chosen points and never cover the piece. The rear the video
// model imagined is concept imagery only. With reduced motion: one beauty frame and the words.

export type ScrubFrames = {
  /** Folder of `f-001.jpg` … `f-NNN.jpg`. Data only, so a server component can pass it. */
  dir: string;
  count: number;
  poster: string;
};

const frameSrc = (frames: ScrubFrames, index: number) => `${frames.dir}/f-${String(index + 1).padStart(3, "0")}.jpg`;

export function LaunchHero({ frames }: { frames: ScrubFrames }) {
  const reduced = useReducedMotion();
  return reduced ? <StillOpening frames={frames} /> : <ScrubOpening frames={frames} />;
}

function HeroCopy() {
  return (
    <>
      <p className="label-xs">DERMAL</p>
      <p className="mt-3 font-display text-[clamp(1.25rem,1.8vw,1.75rem)] font-light tracking-[0.08em]">DESERT EYE&nbsp;—&nbsp;LOVE</p>
      <h1 id="landing-heading" className="mt-5 font-display text-[clamp(2rem,3.4vw,3.5rem)] font-light leading-[1.05] tracking-[0.02em]">
        Jewelry for the face you chose.
      </h1>
      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-1">
        <Link href="/face-studio" data-testid="cta-face" className="text-link">
          View on your face <span aria-hidden="true">↗</span>
        </Link>
        <Link href="/collections" data-testid="cta-selection" className="text-link">
          View selection <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </>
  );
}

function StillOpening({ frames }: { frames: ScrubFrames }) {
  return (
    <section aria-labelledby="landing-heading" data-testid="scrub-hero" data-mode="still" className="launch-still">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frameSrc(frames, 0)} alt="DESERT EYE — LOVE, the completed piece" decoding="async" className="launch-still-media" />
      <div className="launch-still-copy">
        <HeroCopy />
      </div>
    </section>
  );
}

function ScrubOpening({ frames }: { frames: ScrubFrames }) {
  const section = useScrollProgress<HTMLElement>(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const [ready, setReady] = useState(0);
  const [frame, setFrame] = useState(0);

  // The opening is on screen at once, so its frames are fetched at once: the hero media of the site.
  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    const list: (HTMLImageElement | null)[] = new Array(frames.count).fill(null);
    for (let i = 0; i < frames.count; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (cancelled) return;
        list[i] = img;
        loaded += 1;
        setReady(loaded);
      };
      img.src = frameSrc(frames, i);
    }
    images.current = list;
    return () => {
      cancelled = true;
    };
  }, [frames]);

  // The scroll progress lives in --p on the section; the frame is read from it each animation frame.
  // The first fifth of the travel holds the beauty frame with the words; the turn takes the rest.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let raf = 0;
    let last = -1;
    const draw = (index: number) => {
      const c = canvas.current;
      const img = images.current[index] ?? images.current.slice(0, index).reverse().find(Boolean);
      if (!c || !img) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      if (c.width !== img.naturalWidth || c.height !== img.naturalHeight) {
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
      }
      ctx.drawImage(img, 0, 0);
    };
    const tick = () => {
      raf = 0;
      const p = Number(getComputedStyle(el).getPropertyValue("--p")) || 0;
      const turn = Math.min(1, Math.max(0, (p - 0.18) / 0.82));
      const index = Math.min(frames.count - 1, Math.max(0, Math.round(turn * (frames.count - 1))));
      if (index !== last) {
        last = index;
        setFrame(index);
        draw(index);
      }
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    request();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [section, frames.count, ready]);

  const complete = ready >= frames.count;

  return (
    <section ref={section} aria-labelledby="landing-heading" data-testid="scrub-hero" data-mode="scrub" data-frame={frame} data-ready={complete} className="launch">
      <div className="launch-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={frames.poster} alt="" aria-hidden="true" className={`launch-media transition-opacity duration-700 ${complete ? "opacity-0" : "opacity-100"}`} />
        <canvas ref={canvas} data-testid="scrub-canvas" aria-label="DESERT EYE — LOVE, turned by scrolling" role="img" className={`launch-media transition-opacity duration-700 ${complete ? "opacity-100" : "opacity-0"}`} />

        {/* 01: the hero words, at the start, in the lower left. */}
        <div className="launch-copy launch-copy-hero" data-from="0" data-to="0.3">
          <HeroCopy />
        </div>
        {/* 02: two words at chosen points of the turn, in the corners. */}
        <p className="launch-copy launch-copy-mid font-display text-[clamp(1.75rem,3.2vw,3.25rem)] font-light uppercase leading-[1.05] tracking-[0.06em]" data-from="0.36" data-to="0.62">
          Engineered
          <br />
          for the face.
        </p>
        <p className="launch-copy launch-copy-end" data-from="0.7" data-to="1">
          <span className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-light tracking-[0.1em]">DESERT EYE</span>
          <span className="label-xs mt-2 block">01 / 04</span>
        </p>
        <p className="launch-note label-xs text-ash">Prototype orbit · concept hardware · rear side conceptual · scroll to turn</p>
      </div>
    </section>
  );
}
