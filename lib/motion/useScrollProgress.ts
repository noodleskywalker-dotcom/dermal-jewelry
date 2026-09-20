"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

/** True when the visitor asked for reduced motion. Chapters then render as plain, unpinned sections. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

/**
 * Writes the element's scroll progress (0 at its top meeting the viewport top, 1 when its bottom
 * meets the viewport bottom) to the CSS variable --p. All chapter motion is plain CSS driven by
 * that one variable, so there is no per-frame React work.
 */
export function useScrollProgress<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let frame = 0;
    const windowed = Array.from(el.querySelectorAll<HTMLElement>("[data-from]"));
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel));
      el.style.setProperty("--p", p.toFixed(4));
      // Layers that are fully faded out are also hidden from pointer and keyboard.
      for (const node of windowed) {
        const from = Number(node.dataset.from ?? 0);
        const to = Number(node.dataset.to ?? 1);
        node.style.visibility = p >= from && p <= to ? "visible" : "hidden";
      }
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [enabled]);

  return ref;
}

/** Marks an element with data-in="true" the first time it enters the viewport. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-in", "true");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    el.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return ref;
}
