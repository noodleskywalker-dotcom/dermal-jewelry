"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";
import { LOCAL_SAND_EFFECT, SAND_EFFECT } from "@/lib/story/sand-effect";
import type { StoryEffect } from "@/lib/story";
import { KeyedEffect } from "@/components/story/KeyedEffect";

// A page transition made of sand. It starts at a point of the page (the mascot's mini gourd), grows,
// covers the screen, and the next page is opened under it. It lives above every route, so it survives
// the navigation it hides. The sand is the same generic, keyed effect clip used elsewhere.
//
// It is never required: with no clip, with reduced motion, on a slow load, or on Skip, the link simply opens.

export type SandOrigin = { x: number; y: number; pictureWidth: number };
type Play = (options: { origin: SandOrigin; href: string }) => void;

const SandContext = createContext<{ play: Play; available: boolean; busy: boolean }>({ play: () => {}, available: false, busy: false });
export const useSandTransition = () => useContext(SandContext);

const LOAD_TIMEOUT_MS = 6000;
type Job = { video: HTMLVideoElement; origin: SandOrigin; href: string; effect: StoryEffect };

export function SandTransitionProvider({
  src,
  fallbackSrc,
  children,
}: {
  /** The clip the transition uses: the local one. Builds get none. */
  src?: string;
  /** The earlier supplied clip, used only if the first one cannot be loaded. */
  fallbackSrc?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [job, setJob] = useState<Job | null>(null);
  const [leaving, setLeaving] = useState(false);
  // True from the press until the clip is playing, so the caller can hold its pose while the clip loads.
  const [loading, setLoading] = useState(false);
  const pushed = useRef(false);
  const skip = useRef<HTMLButtonElement>(null);
  // Each clip carries its own measurements: the local one is keyed on brightness, the older supplied
  // one on its blue ground.
  const effects = useMemo(
    () => ({
      local: { ...LOCAL_SAND_EFFECT, origin: { x: 0, y: 0 } } as StoryEffect,
      supplied: { ...SAND_EFFECT, origin: { x: 0, y: 0 } } as StoryEffect,
    }),
    [],
  );
  const available = Boolean(src ?? fallbackSrc) && !reduced;

  const end = useCallback(() => {
    setJob((current) => {
      current?.video.pause();
      return null;
    });
    setLeaving(false);
  }, []);

  const play = useCallback<Play>(
    ({ origin, href }) => {
      const sources: { url: string; effect: StoryEffect }[] = [];
      if (src) sources.push({ url: src, effect: effects.local });
      if (fallbackSrc) sources.push({ url: fallbackSrc, effect: effects.supplied });
      if (!sources.length || reduced) {
        router.push(href);
        return;
      }
      setLoading(true);

      // Each source is given one chance to load. If none of them does, the link simply opens: a
      // visitor is never trapped waiting for an effect.
      const attempt = (index: number) => {
        const source = sources[index];
        if (!source) {
          setLoading(false);
          router.push(href);
          return;
        }
        const video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";
        let settled = false;
        const give = (next: () => void) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          next();
        };
        const timer = setTimeout(() => give(() => attempt(index + 1)), LOAD_TIMEOUT_MS);
        video.oncanplaythrough = () =>
          give(() => {
            pushed.current = false;
            setLeaving(false);
            setLoading(false);
            setJob({ video, origin, href, effect: source.effect });
          });
        video.onerror = () => give(() => attempt(index + 1));
        video.src = source.url;
        video.load();
      };
      attempt(0);
    },
    [src, fallbackSrc, effects, reduced, router],
  );

  // The clip is the clock: the next page opens only once the sand really covers this one.
  useEffect(() => {
    if (!job) return;
    let frame = 0;
    void job.video.play().catch(() => {
      router.push(job.href);
      end();
    });
    requestAnimationFrame(() => skip.current?.focus());
    const tick = () => {
      const t = job.video.currentTime;
      if (!pushed.current && t >= job.effect.coveredAt) {
        pushed.current = true;
        router.push(job.href);
      }
      if (job.video.ended || t >= job.video.duration - 0.05) {
        setLeaving(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [job, router, end]);

  // Once the new page is there, the sand clears from it.
  useEffect(() => {
    if (!job || !leaving) return;
    if (pathname !== new URL(job.href, window.location.href).pathname) return;
    const timer = setTimeout(end, 900);
    return () => clearTimeout(timer);
  }, [job, leaving, pathname, end]);

  const skipNow = useCallback(() => {
    if (!job) return;
    if (!pushed.current) router.push(job.href);
    end();
  }, [job, router, end]);

  useEffect(() => {
    if (!job) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skipNow();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [job, skipNow]);

  const value = useMemo(() => ({ play, available, busy: loading || job !== null }), [play, available, loading, job]);

  return (
    <SandContext.Provider value={value}>
      {children}
      {job && (
        <div data-testid="sand-transition" data-source={job.effect.slot} data-leaving={leaving} className="sand-transition fixed inset-0 z-[90] overflow-hidden">
          <KeyedEffect video={job.video} effect={job.effect} target={job.origin} onUnavailable={skipNow} />
          <button ref={skip} type="button" data-testid="sand-skip" onClick={skipNow} className="label-xs absolute right-4 top-20 inline-flex min-h-11 items-center bg-ink px-4 text-ivory sm:right-6">
            Skip <span aria-hidden="true">&nbsp;→</span>
          </button>
        </div>
      )}
    </SandContext.Provider>
  );
}
