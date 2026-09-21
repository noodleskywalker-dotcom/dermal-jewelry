"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle cursor depth. Writes the pointer's position over the element, from -1 to 1 on each axis, to
 * the CSS variables --mx and --my, eased toward the target every frame. Children decide how far they
 * move from their own depth, so there is no per-frame React work. Mouse only; nothing with reduced motion.
 */
export function useCursorDepth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(hover: hover)").matches) return;
    let frame = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    const step = () => {
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      el.style.setProperty("--mx", x.toFixed(4));
      el.style.setProperty("--my", y.toFixed(4));
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(step) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      if (!frame) frame = requestAnimationFrame(step);
    };
    const onLeave = () => {
      tx = ty = 0;
      if (!frame) frame = requestAnimationFrame(step);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}
