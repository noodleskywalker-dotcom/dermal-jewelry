"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useScrollProgress } from "@/lib/motion/useScrollProgress";

// 04: MACRO. A pinned stage where scrolling travels from the whole piece down into the stone:
// the macro film (generated from the exact approved frame) played as stills, backwards, so the
// camera moves in. Four callouts arrive at their moments. With reduced motion: the closest frame.
const CALLOUTS = [
  { label: "Surface form", from: 0.08, to: 0.32, x: "8%", y: "70%" },
  { label: "Polished edge", from: 0.32, to: 0.55, x: "62%", y: "74%" },
  { label: "Openwork", from: 0.55, to: 0.74, x: "70%", y: "18%" },
  { label: "Facet", from: 0.74, to: 1.01, x: "8%", y: "18%" },
];

export function MacroScrub({ dir, count }: { dir: string; count: number }) {
  const reduced = useReducedMotion();
  const src = (i: number) => `${dir}/f-${String(i + 1).padStart(3, "0")}.jpg`;
  const section = useScrollProgress<HTMLElement>(!reduced);
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(0);
  const [frame, setFrame] = useState(0);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = section.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && (setNear(true), io.disconnect()), { rootMargin: "80% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [section, reduced]);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    let loaded = 0;
    const list: (HTMLImageElement | null)[] = new Array(count).fill(null);
    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (cancelled) return;
        list[i] = img;
        loaded += 1;
        setReady(loaded);
      };
      img.src = src(i);
    }
    images.current = list;
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near, count, dir]);

  useEffect(() => {
    const el = section.current;
    if (!el || reduced) return;
    let raf = 0;
    let last = -1;
    const tick = () => {
      raf = 0;
      const progress = Number(getComputedStyle(el).getPropertyValue("--p")) || 0;
      setP(progress);
      // The film pulls back; the page pushes in. So the last frame comes first.
      const index = count - 1 - Math.min(count - 1, Math.max(0, Math.round(progress * (count - 1))));
      if (index === last) return;
      last = index;
      setFrame(index);
      const c = canvas.current;
      const img = images.current[index] ?? images.current.slice(index).find(Boolean);
      if (!c || !img) return;
      if (c.width !== img.naturalWidth) {
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
      }
      c.getContext("2d")?.drawImage(img, 0, 0);
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
  }, [section, count, ready, reduced]);

  if (reduced) {
    return (
      <section aria-labelledby="macro-heading" data-testid="macro-scrub" data-mode="still" className="macro-still">
        <h2 id="macro-heading" className="sr-only">Macro detail</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src(0)} alt="The faceted stone in its four prongs, close" className="h-full w-full object-cover" />
      </section>
    );
  }

  return (
    <section ref={section} aria-labelledby="macro-heading" data-testid="macro-scrub" data-mode="scrub" data-frame={frame} data-ready={ready >= count} className="macro-scrub">
      <div className="macro-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src(count - 1)} alt="" aria-hidden="true" className={`macro-media transition-opacity duration-700 ${ready >= count ? "opacity-0" : "opacity-100"}`} />
        <canvas ref={canvas} role="img" aria-label="DESERT EYE — LOVE, closer with each scroll: surface, edge, openwork and facet" className="macro-media" />
        <h2 id="macro-heading" className="macro-title label-xs">03 / Detail</h2>
        {CALLOUTS.map((c) => (
          <p key={c.label} className="macro-callout-live font-display" data-testid="macro-callout" data-on={p >= c.from && p < c.to} style={{ left: c.x, top: c.y }}>
            {c.label}
          </p>
        ))}
        <p className="macro-note label-xs">Prototype render · macro · not a size</p>
      </div>
    </section>
  );
}
