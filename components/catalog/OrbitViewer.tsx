"use client";

import { useEffect, useRef, useState } from "react";

// A 360° view of the piece from the approved orbit's stills: drag sideways, use the arrow keys, or
// the slider. Nothing plays by itself. The rear of the piece in these frames is what the video model
// imagined; it is presentation only and never a manufacturing reference, and the label says so.
export function OrbitViewer({ dir, count, title }: { dir: string; count: number; title: string }) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(1);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const src = (i: number) => `${dir}/f-${String(i + 1).padStart(3, "0")}.jpg`;
  const wrap = (i: number) => ((i % count) + count) % count;
  // The rear faces the viewer through roughly the middle third of the turn.
  const rear = index > count * 0.32 && index < count * 0.68;

  // The rest of the turn arrives in the background once the view is open.
  useEffect(() => {
    let cancelled = false;
    let done = 1;
    for (let i = 1; i < count; i++) {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        done += 1;
        setLoaded(done);
      };
      img.src = src(i);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, count]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, start: index };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const width = e.currentTarget.clientWidth || 1;
    // One full width of drag is one full turn.
    setIndex(wrap(d.start + Math.round(((e.clientX - d.x) / width) * count)));
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <figure data-testid="orbit-viewer" data-frame={index} data-loaded={loaded >= count} className="w-full">
      <div
        role="img"
        aria-label={`${title}, turned by dragging`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setIndex((i) => wrap(i + 1));
          if (e.key === "ArrowLeft") setIndex((i) => wrap(i - 1));
        }}
        className="orbit-stage relative aspect-video w-full cursor-grab select-none overflow-hidden active:cursor-grabbing"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src(index)} alt="" draggable={false} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        {/* The far side is what the video model imagined: say so while it faces the viewer, and only then. */}
        {rear && (
          <p className="label-xs absolute right-4 top-4 bg-paper/85 px-3 py-1.5" data-testid="orbit-rear-note">
            Rear geometry conceptual
          </p>
        )}
      </div>
      <figcaption className="label-xs mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-ash">
        <span>360° · prototype orbit · concept hardware · drag, arrow keys or slider</span>
        <label className="flex items-center gap-3">
          <span>Turn</span>
          <input type="range" min={0} max={count - 1} value={index} onChange={(e) => setIndex(Number(e.target.value))} data-testid="orbit-turn" className="studio-range w-36" aria-valuetext={`${Math.round((index / count) * 360)} degrees`} />
        </label>
      </figcaption>
    </figure>
  );
}
