"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";
import { pointOnContained } from "@/lib/story";
import type { MascotMedia } from "@/lib/story/registry";
import { useSandTransition } from "@/components/transition/SandTransition";

type Pose = keyof MascotMedia;

// Where the opening of the mini gourd is on the mascot pictures, 0 to 1. All five share one framing.
const GOURD = { x: 0.668, y: 0.355 };
const ASPECT = 2528 / 1696;

// The homepage mascot: a small, calm figure reading on the floor. He is five registered stills, not a
// video, and the page only ever swaps between them: a slow blink, a page turned, a rare tiny yawn, and a
// gentle breathing movement. Pressing him makes him look up and raise a hand, then sand leaves his
// gourd and becomes the transition into the selection. Internal concept art: a build never gets it.
export function Mascot({ media, href, label }: { media: MascotMedia; href: string; label: string }) {
  const reduced = useReducedMotion();
  const { play, busy } = useSandTransition();
  const [pose, setPose] = useState<Pose>("idle");
  const [called, setCalled] = useState(false);
  const picture = useRef<HTMLImageElement>(null);

  // Idle life. Each beat is short and returns to the reading pose.
  useEffect(() => {
    if (reduced || called) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const beat = (name: Pose, every: number, hold: number, offset: number) => {
      const run = () => {
        setPose((current) => (current === "idle" ? name : current));
        timers.push(setTimeout(() => setPose((current) => (current === name ? "idle" : current)), hold));
        timers.push(setTimeout(run, every + Math.random() * every * 0.4));
      };
      timers.push(setTimeout(run, offset));
    };
    beat("blink", 3600, 170, 1800);
    beat("page", 9500, 900, 5200);
    beat("yawn", 21000, 1500, 13000);
    return () => timers.forEach(clearTimeout);
  }, [reduced, called]);

  // He holds his look for as long as the sand is loading or playing, so the point the sand was aimed
  // at never moves under it. Once the transition is over and he is still on screen, he reads again.
  const wasBusy = useRef(false);
  useEffect(() => {
    if (busy) {
      wasBusy.current = true;
      return;
    }
    if (!wasBusy.current) return;
    wasBusy.current = false;
    const timer = setTimeout(() => {
      setCalled(false);
      setPose("idle");
    }, 600);
    return () => clearTimeout(timer);
  }, [busy]);

  const press = () => {
    if (called) return;
    setCalled(true);
    setPose("look");
    // He looks up and raises his hand first; the sand answers a moment later.
    setTimeout(
      () => {
        const el = picture.current;
        if (!el) return;
        // By now he has finished looking up and holds that pose, so the picture is measured as it is drawn.
        const box = el.getBoundingClientRect();
        play({ origin: { ...pointOnContained(box, ASPECT, GOURD), pictureWidth: Math.min(box.width, box.height * ASPECT) * 0.5 }, href });
      },
      reduced ? 0 : 520,
    );
  };

  return (
    <button type="button" data-testid="mascot" data-pose={pose} aria-label={label} onClick={press} className="mascot group relative block w-full cursor-pointer appearance-none border-0 bg-transparent p-0">
      <span className="mascot-body relative block" style={{ aspectRatio: String(ASPECT) }}>
        {(Object.keys(media) as Pose[]).map((name) => (
          // Internal stills from the development server. They are never optimised, cached or deployed.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={name}
            ref={name === "idle" ? picture : undefined}
            src={media[name]}
            alt=""
            draggable={false}
            data-pose-layer={name}
            className="mascot-layer absolute inset-0 h-full w-full select-none object-contain object-[left_bottom]"
            style={{ opacity: pose === name ? 1 : 0 }}
          />
        ))}
      </span>
      <span className="label-xs mt-1 flex items-center justify-end gap-2 text-ash transition-colors duration-300 group-hover:text-ink">
        Wake him <span aria-hidden="true">↗</span>
      </span>
    </button>
  );
}
