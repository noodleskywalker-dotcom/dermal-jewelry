"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";
import { pointOnContained } from "@/lib/story";
import type { MascotClips, MascotMedia } from "@/lib/story/registry";
import { useSandTransition } from "@/components/transition/SandTransition";

type Pose = keyof MascotMedia;

// Where the opening of the mini gourd is on the mascot pictures, 0 to 1. All five share one framing.
const GOURD = { x: 0.668, y: 0.355 };
const ASPECT = 2528 / 1696;

// The homepage mascot: a small, calm figure reading on the floor. He is five registered stills, not a
// video, and the page only ever swaps between them: a slow blink, a page turned, a rare tiny yawn, and a
// gentle breathing movement. Pressing him makes him look up and raise a hand, then sand leaves his
// gourd and becomes the transition into the selection. Internal concept art: a build never gets it.
export function Mascot({ media, clips, href, label, transition = true }: { media: MascotMedia; /** Animated clips, generated locally. Without them he is the five stills. */ clips?: MascotClips | null; href: string; label: string; /** false: a press simply opens the page, no sand. */ transition?: boolean }) {
  const reduced = useReducedMotion();
  const live = Boolean(clips) && !reduced;
  const video = useRef<HTMLVideoElement>(null);
  // "idle" loops; "react" runs once when he is pressed and then holds its last frame.
  const [clip, setClip] = useState<"idle" | "react">("idle");
  // A product film or a cinematic stage is worth more than the mascot, so he stops while one plays.
  const [yielding, setYielding] = useState(false);
  const router = useRouter();
  const glance = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { play, busy } = useSandTransition();
  const [pose, setPose] = useState<Pose>("idle");
  const [called, setCalled] = useState(false);
  // Either the still or the clip: whichever is on screen is what the sand is aimed at.
  const picture = useRef<HTMLImageElement | null>(null);

  // While any other video on the page is playing, the mascot's own clip pauses: two decoders on a
  // small machine cost more than the motion is worth.
  useEffect(() => {
    if (!live) return;
    const others = () => [...document.querySelectorAll("video")].filter((v) => v !== video.current && !v.paused && !v.ended);
    const read = () => setYielding(others().length > 0);
    read();
    for (const type of ["play", "playing", "pause", "ended", "emptied"]) document.addEventListener(type, read, true);
    return () => {
      for (const type of ["play", "playing", "pause", "ended", "emptied"]) document.removeEventListener(type, read, true);
    };
  }, [live]);

  useEffect(() => {
    const v = video.current;
    if (!v || !live) return;
    if (yielding && clip === "idle") v.pause();
    else void v.play().catch(() => undefined);
  }, [yielding, clip, live]);

  // Idle life for the still version. Each beat is short and returns to the reading pose.
  useEffect(() => {
    if (reduced || called || live) return;
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
  }, [reduced, called, live]);

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
      setClip("idle");
    }, 600);
    return () => clearTimeout(timer);
  }, [busy]);

  // Hover: he pauses, glances up at the viewer for a moment, and goes back to his book. Never the
  // transition. The animated version cannot pose on demand, so it only slows for a moment instead.
  const onHover = () => {
    if (called || reduced) return;
    if (live) {
      const v = video.current;
      if (v) {
        v.playbackRate = 0.5;
        if (glance.current) clearTimeout(glance.current);
        glance.current = setTimeout(() => {
          if (video.current) video.current.playbackRate = 1;
        }, 1100);
      }
      return;
    }
    setPose("look");
    if (glance.current) clearTimeout(glance.current);
    glance.current = setTimeout(() => setPose((p) => (p === "look" ? "idle" : p)), 1100);
  };
  useEffect(() => () => {
    if (glance.current) clearTimeout(glance.current);
  }, []);

  const press = () => {
    // Only a transition that is actually running blocks another press; once it is over he answers again
    // at once, without waiting for his own pose to settle back.
    if (busy) return;
    if (!transition) {
      router.push(href);
      return;
    }
    setCalled(true);
    setPose("look");
    if (live) {
      setClip("react");
      const v = video.current;
      if (v) {
        v.currentTime = 0;
        void v.play().catch(() => undefined);
      }
    }
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
    <button type="button" data-testid="mascot" data-pose={pose} aria-label={label} onClick={press} onMouseEnter={onHover} onFocus={onHover} className="mascot group relative block w-full cursor-pointer appearance-none border-0 bg-transparent p-0">
      <span className="mascot-body relative block" style={{ aspectRatio: String(ASPECT) }}>
        {live && clips && (
          // The locally generated clip, drawn with multiply so its white ground disappears into the page.
          <video
            ref={(el) => {
              video.current = el;
              picture.current = el as unknown as HTMLImageElement;
            }}
            key={clip}
            data-testid="mascot-clip"
            data-clip={clip}
            src={clip === "idle" ? clips.idle : clips.react}
            poster={media.idle}
            muted
            playsInline
            autoPlay
            loop={clip === "idle"}
            preload="auto"
            aria-hidden="true"
            className="mascot-layer absolute inset-0 h-full w-full select-none object-contain object-[left_bottom]"
          />
        )}
        {!live && (Object.keys(media) as Pose[]).map((name) => (
          // Internal stills from the development server. They are never optimised, cached or deployed.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={name}
            ref={name === "idle" && !live ? picture : undefined}
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
