"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useScrollProgress } from "@/lib/motion/useScrollProgress";

// The opening of the launch film: the piece, alone, filling the screen, turned by the page's own
// scroll (sections 01 and 02 of the owner's flow, 22 September 2026). First only a name; as the
// turn goes on, the headline and the two ways in. Frames are stills of the approved hero orbit,
// so nothing plays by itself; the rear of the piece in them is conceptual, never a manufacturing
// reference. With reduced motion the opening is a plain still with the same words. Nothing is
// locked: the section is a few screens tall and scrolls past at once.

export type ScrubFrames = {
  /** Folder of `f-001.jpg` … `f-NNN.jpg`. Data only, so a server component can pass it. */
  dir: string;
  count: number;
  poster: string;
  /** Where the frames come from, for the small label on the stage. */
  source: string;
};

const frameSrc = (frames: ScrubFrames, index: number) => `${frames.dir}/f-${String(index + 1).padStart(3, "0")}.jpg`;

export function LaunchHero({ frames }: { frames: ScrubFrames }) {
  const reduced = useReducedMotion();
  return reduced ? <StillOpening frames={frames} /> : <ScrubOpening frames={frames} />;
}

function Name() {
  return (
    <>
      <p className="label-xs">01 / DESERT EYE</p>
      <p className="mt-2 font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-light tracking-[0.06em]">DESERT EYE&nbsp;—&nbsp;LOVE</p>
    </>
  );
}

function Headline() {
  return (
    <>
      <h1 id="landing-heading" className="font-display text-[clamp(2.75rem,6.4vw,6.25rem)] font-light uppercase leading-[0.96] tracking-[0.02em]">
        Jewelry for the face you chose.
      </h1>
      <div className="mt-8 flex flex-wrap gap-x-10 gap-y-2">
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
    <section aria-labelledby="landing-heading" data-testid="scrub-hero" data-mode="still" className="launch-still mx-auto max-w-[120rem] px-6 pb-16 pt-6 sm:px-10 lg:px-16">
      <Name />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frameSrc(frames, 0)} alt="DESERT EYE — LOVE, the completed piece" decoding="async" className="my-8 aspect-video w-full object-contain" />
      <Headline />
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
      const index = Math.min(frames.count - 1, Math.max(0, Math.round(p * (frames.count - 1))));
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
        {/* The piece fills the stage. The first frame stands in until the sequence has arrived. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={frames.poster} alt="" aria-hidden="true" className={`launch-media transition-opacity duration-500 ${complete ? "opacity-0" : "opacity-100"}`} />
        <canvas ref={canvas} data-testid="scrub-canvas" aria-label="DESERT EYE — LOVE, turned by scrolling" role="img" className={`launch-media transition-opacity duration-500 ${complete ? "opacity-100" : "opacity-0"}`} />

        {/* 01: the name alone. */}
        <div className="launch-name" data-from="0" data-to="0.42">
          <Name />
        </div>
        {/* 02: the headline and the two ways in, as the turn goes on. */}
        <div className="launch-copy" data-from="0.36" data-to="1">
          <Headline />
        </div>
        <p className="launch-note label-xs text-ash">{frames.source}</p>
      </div>
    </section>
  );
}
