"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useScrollProgress } from "@/lib/motion/useScrollProgress";

// One cinematic moment inside an otherwise normally scrolling page: a frame sequence of the piece,
// scrubbed by the page's own scroll while its stage stays in view, with two short lines of copy.
// The owner asked for this one pinned section on 22 September 2026; the rest of the site keeps
// scrolling normally. The frames are still images, so nothing plays by itself.
//
// Fallbacks: with reduced motion, or before the frames have arrived, the section is a plain still
// with the same words. Keyboard scrolling scrubs it like any other scroll. Nothing is locked: the
// section is a little over two screens tall and can be scrolled past at once.
//
// Frames come from `film.frames`: today the assembly beats of the approved product animation, a
// placeholder until the hero orbit (MEDIA 01) is approved and generated. The label says so.

export type ScrubFrames = {
  /** Folder of `f-001.jpg` … `f-NNN.jpg`. Data only, so a server component can pass it. */
  dir: string;
  count: number;
  poster: string;
  /** Where the frames come from, for the small label under the stage. */
  source: string;
};

const frameSrc = (frames: ScrubFrames, index: number) => `${frames.dir}/f-${String(index + 1).padStart(3, "0")}.jpg`;

export function ScrubHero({ frames, href }: { frames: ScrubFrames; href: string }) {
  const reduced = useReducedMotion();
  return reduced ? <StillHero frames={frames} href={href} /> : <ScrubStage frames={frames} href={href} />;
}

function Copy({ href }: { href: string }) {
  return (
    <>
      <p className="label-xs text-ash">DESERT EYE</p>
      <h2 className="mt-3 font-display text-[clamp(2.25rem,5vw,4.5rem)] font-light leading-none tracking-[0.03em]">DESERT EYE&nbsp;—&nbsp;LOVE</h2>
      <p className="scrub-line-2 mt-4 font-display text-[clamp(1.25rem,2vw,1.75rem)] font-light text-ash">Crafted for the face.</p>
      <Link href={href} className="text-link mt-6">
        View the piece <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}

function StillHero({ frames, href }: { frames: ScrubFrames; href: string }) {
  return (
    <section aria-labelledby="scrub-heading" data-testid="scrub-hero" data-mode="still" className="mx-auto max-w-[120rem] px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={frameSrc(frames, frames.count - 1)} alt="DESERT EYE — LOVE, the completed piece" loading="lazy" decoding="async" className="aspect-video w-full object-contain" />
        <div id="scrub-heading">
          <Copy href={href} />
        </div>
      </div>
    </section>
  );
}

function ScrubStage({ frames, href }: { frames: ScrubFrames; href: string }) {
  const section = useScrollProgress<HTMLElement>(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const [ready, setReady] = useState(0);
  const [near, setNear] = useState(false);
  const [frame, setFrame] = useState(0);

  // The frames are fetched only when the section is about to come into view.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "60% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [section]);

  useEffect(() => {
    if (!near) return;
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
  }, [near, frames]);

  // The scroll progress lives in --p on the section; the frame is read from it each animation frame.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let raf = 0;
    let last = -1;
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
    <section ref={section} aria-labelledby="scrub-heading" data-testid="scrub-hero" data-mode="scrub" data-frame={frame} data-ready={complete} className="scrub">
      <div className="scrub-stage">
        <div className="scrub-media">
          {/* The first frame stands in until the sequence has arrived. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={frames.poster} alt="" aria-hidden="true" className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${complete ? "opacity-0" : "opacity-100"}`} />
          <canvas ref={canvas} data-testid="scrub-canvas" aria-label="DESERT EYE — LOVE, turned by scrolling" role="img" className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${complete ? "opacity-100" : "opacity-0"}`} />
        </div>
        <div className="scrub-copy" id="scrub-heading">
          <Copy href={href} />
        </div>
        <p className="scrub-note label-xs text-ash">{frames.source}</p>
      </div>
    </section>
  );
}
