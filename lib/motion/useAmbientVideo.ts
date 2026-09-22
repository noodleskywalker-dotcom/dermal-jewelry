"use client";

import { useEffect, useRef } from "react";

export type VideoSource = { src: string; type: string };

/**
 * An ambient loop whose sources are attached only after hydration. The server sends a bare <video>
 * with its poster, so the page's load event never waits on media (WebKit holds it for a server-rendered
 * source it cannot decode), and the first paint is the poster. Pass `enabled: false` to keep the poster.
 */
export function useAmbientVideo(sources: VideoSource[], enabled: boolean) {
  const ref = useRef<HTMLVideoElement>(null);
  const key = sources.map((s) => s.src).join("|");

  useEffect(() => {
    const v = ref.current;
    if (!v || !enabled) return;
    const added = sources.map((s) => {
      const el = document.createElement("source");
      el.src = s.src;
      el.type = s.type;
      v.appendChild(el);
      return el;
    });
    v.load();
    return () => {
      for (const el of added) el.remove();
    };
    // The key stands for the sources; the array itself is rebuilt on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return ref;
}
