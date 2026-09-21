"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";

/**
 * A featureless standing form, in the same spirit as the featureless head in the placement preview.
 * It stands in wherever a character picture is not supplied, and says so. It is not a person.
 */
export function PlaceholderFigure({ className, tone = "bone" }: { className?: string; tone?: "bone" | "slate" }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [light, mid, deep] = tone === "bone" ? ["#e6e0d3", "#cfc7b7", "#a9a191"] : ["#c9ccd1", "#a5a9b0", "#7b8088"];
  return (
    <svg viewBox="0 0 300 800" className={className} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id={`${id}-form`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.55" stopColor={mid} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>
      <ellipse cx="150" cy="792" rx="120" ry="8" fill="rgba(40,30,20,0.12)" />
      <g fill={`url(#${id}-form)`}>
        <ellipse cx="150" cy="78" rx="46" ry="56" />
        <path d="M132 128 L168 128 L172 158 C215 164 238 184 242 226 L254 420 C255 436 232 438 230 422 L214 262 L206 440 L212 770 C212 790 170 790 168 770 L152 480 L148 480 L132 770 C130 790 88 790 88 770 L94 440 L86 262 L70 422 C68 438 45 436 46 420 L58 226 C62 184 85 164 128 158 Z" />
      </g>
    </svg>
  );
}

const RISE = [
  { gx: "18%", gdx: "-14px", gdy: "-120px", gdelay: "0ms" },
  { gx: "30%", gdx: "10px", gdy: "-170px", gdelay: "90ms" },
  { gx: "44%", gdx: "-6px", gdy: "-140px", gdelay: "40ms" },
  { gx: "58%", gdx: "16px", gdy: "-190px", gdelay: "140ms" },
  { gx: "70%", gdx: "-10px", gdy: "-130px", gdelay: "60ms" },
  { gx: "82%", gdx: "12px", gdy: "-160px", gdelay: "180ms" },
];

// The character occupies the page itself and is one large button. Hover or keyboard focus gives a
// short reaction as a hint; only a press does anything more. It never plays the cinematic by itself.
export function StoryCharacter({
  src,
  label,
  caption,
  reactionMs,
  onPress,
  buttonRef,
}: {
  /** Internal still, when this build has one. Otherwise the labelled placeholder is drawn. */
  src?: string;
  /** Accessible name: what pressing does. */
  label: string;
  /** Small editorial label under the figure. */
  caption: string;
  reactionMs: number;
  onPress: () => void;
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  const reduced = useReducedMotion();
  const [reacting, setReacting] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const react = () => {
    if (reduced || timer.current) return;
    setReacting(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setReacting(false);
    }, reactionMs);
  };

  const still = src && !failed;

  return (
    <button
      ref={buttonRef}
      type="button"
      data-testid="story-character"
      data-reacting={reacting}
      data-media={still ? "internal-still" : "placeholder"}
      aria-label={label}
      onClick={onPress}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") react();
      }}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) react();
      }}
      className="story-character relative block h-full w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-left"
      style={{ "--react-ms": `${reactionMs}ms` } as React.CSSProperties}
    >
      <span className="story-figure">
        {still ? (
          // An internal still from the development server. It is never optimised, cached or deployed.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" draggable={false} onError={() => setFailed(true)} className="story-figure-still block h-full w-full select-none object-cover object-top" />
        ) : (
          <PlaceholderFigure className="block h-full w-full" />
        )}
      </span>
      {RISE.map((g, i) => (
        <span key={i} aria-hidden="true" className="story-rise" style={{ "--gx": g.gx, "--gdx": g.gdx, "--gdy": g.gdy, "--gdelay": g.gdelay } as React.CSSProperties} />
      ))}
      <span className="label-xs absolute bottom-3 left-0 max-w-[16rem] leading-relaxed text-ink/60">{caption}</span>
    </button>
  );
}
