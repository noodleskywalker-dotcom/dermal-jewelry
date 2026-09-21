"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";

/**
 * A featureless standing form, in the same spirit as the featureless head in the placement preview.
 * It stands in wherever a character picture is not supplied. It is not a person.
 */
export function PlaceholderFigure({ className }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg viewBox="0 0 300 800" className={className} aria-hidden="true" focusable="false" preserveAspectRatio="xMinYMax meet">
      <defs>
        <linearGradient id={`${id}-form`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#e6e0d3" />
          <stop offset="0.55" stopColor="#cfc7b7" />
          <stop offset="1" stopColor="#a9a191" />
        </linearGradient>
      </defs>
      <g fill={`url(#${id}-form)`}>
        <ellipse cx="150" cy="78" rx="46" ry="56" />
        <path d="M132 128 L168 128 L172 158 C215 164 238 184 242 226 L254 420 C255 436 232 438 230 422 L214 262 L206 440 L212 800 L168 800 L152 480 L148 480 L132 800 L88 800 L94 440 L86 262 L70 422 C68 438 45 436 46 420 L58 226 C62 184 85 164 128 158 Z" />
      </g>
    </svg>
  );
}

// Sand lifted by the reaction. Sizes and paths differ so it reads as sand, not as a pattern.
const RISE = [
  { gx: "8%", gs: "5px", gdx: "-18px", gdy: "-150px", gdelay: "0ms" },
  { gx: "15%", gs: "8px", gdx: "12px", gdy: "-230px", gdelay: "70ms" },
  { gx: "22%", gs: "4px", gdx: "-8px", gdy: "-180px", gdelay: "30ms" },
  { gx: "29%", gs: "9px", gdx: "20px", gdy: "-270px", gdelay: "120ms" },
  { gx: "36%", gs: "6px", gdx: "-14px", gdy: "-200px", gdelay: "50ms" },
  { gx: "43%", gs: "5px", gdx: "16px", gdy: "-250px", gdelay: "150ms" },
  { gx: "50%", gs: "8px", gdx: "-10px", gdy: "-170px", gdelay: "20ms" },
  { gx: "57%", gs: "4px", gdx: "22px", gdy: "-290px", gdelay: "100ms" },
  { gx: "64%", gs: "7px", gdx: "-16px", gdy: "-210px", gdelay: "60ms" },
  { gx: "71%", gs: "5px", gdx: "10px", gdy: "-160px", gdelay: "140ms" },
  { gx: "78%", gs: "9px", gdx: "-6px", gdy: "-240px", gdelay: "90ms" },
  { gx: "85%", gs: "4px", gdx: "18px", gdy: "-190px", gdelay: "40ms" },
];

const NEAR_PX = 140;

// The character occupies the page itself and is one large control, not a card. The pointer coming
// close wakes it a little, hover or keyboard focus gives a reaction of about a second, and only a
// press does anything more. It never plays the cinematic by itself.
export function StoryCharacter({
  src,
  label,
  tag,
  reactionMs,
  onPress,
  buttonRef,
  pictureRef,
  ground = "scene",
  quiet = false,
}: {
  /** Internal still, when this build has one. Otherwise the placeholder form is drawn. */
  src?: string;
  /** Accessible name: what pressing does. */
  label: string;
  /** The small visible label beside the figure, such as "Watch story". */
  tag: string;
  reactionMs: number;
  onPress: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  /** The picture element itself, so a point on it can be found on the page. */
  pictureRef?: React.RefObject<HTMLImageElement | null>;
  /** "white": drawn on plain white and multiplied into the page, so it has no edge. "scene": has its own background. */
  ground?: "white" | "scene";
  /** True while the story plays over the figure: it holds still, because it is a still. */
  quiet?: boolean;
}) {
  const reduced = useReducedMotion();
  const [reacting, setReacting] = useState(false);
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const own = useRef<HTMLButtonElement>(null);
  const button = buttonRef ?? own;

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // Approach: a mouse within reach of the figure is enough for a first sign of life.
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const box = button.current?.getBoundingClientRect();
        if (!box) return;
        const dx = Math.max(box.left - e.clientX, 0, e.clientX - box.right);
        const dy = Math.max(box.top - e.clientY, 0, e.clientY - box.bottom);
        const next = Math.hypot(dx, dy) < NEAR_PX;
        setNear((prev) => (prev === next ? prev : next));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced, button]);

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
      ref={button}
      type="button"
      data-testid="story-character"
      data-reacting={reacting && !quiet}
      data-near={near && !quiet}
      data-media={still ? "internal-still" : "placeholder"}
      aria-label={label}
      onClick={onPress}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") react();
      }}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) react();
      }}
      className="story-character absolute inset-0 block appearance-none border-0 bg-transparent p-0 text-left"
      style={{ "--react-ms": `${reactionMs}ms` } as React.CSSProperties}
    >
      {still ? (
        // An internal still from the development server. It is never optimised, cached or deployed.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={pictureRef}
          src={src}
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
          className={`story-figure select-none ${ground === "white" ? "story-figure-cutout" : "story-figure-still object-cover"}`}
        />
      ) : (
        <PlaceholderFigure className="story-figure story-figure-placeholder" />
      )}
      {still && ground !== "white" && <span aria-hidden="true" className="story-veil" />}
      <span aria-hidden="true" className="story-puff" />
      {RISE.map((g, i) => (
        <span key={i} aria-hidden="true" className="story-rise" style={{ "--gx": g.gx, "--gs": g.gs, "--gdx": g.gdx, "--gdy": g.gdy, "--gdelay": g.gdelay } as React.CSSProperties} />
      ))}
      <span data-testid="story-tag" className="story-tag label-xs">
        {tag} <span aria-hidden="true">↗</span>
      </span>
    </button>
  );
}
