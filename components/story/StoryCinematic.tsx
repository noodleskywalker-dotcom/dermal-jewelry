"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/catalog/types";
import { beatAt, totalSeconds, type CollectionStory, type StoryMedia } from "@/lib/story";
import { Modal } from "@/components/layout/Modal";
import { PlaceholderFigure } from "./StoryCharacter";
import { StoryVisual } from "./StoryVisual";

// The special cinematic: one short action, sand fills the frame as the hidden cut, then the close-up.
// It opens only from a press, Skip is there from the first frame, Escape skips too, and it always
// ends in the product experience. The timeline is the story's beat data.
//
// Until real footage exists this is a CONCEPT MOTION PROTOTYPE: a deliberate storyboard animatic in
// one tone of ink and one tone of sand, with a brush-figure opponent, sand arcs and speed lines. It
// is never presented as final footage. When footage is supplied in the `video` slot it plays under
// the same timeline, and the close-up still comes from the page, never from the clip.
export function StoryCinematic({
  open,
  story,
  media,
  internal,
  product,
  formId,
  onFinish,
}: {
  open: boolean;
  story: CollectionStory;
  media: StoryMedia;
  internal: boolean;
  product: Product;
  formId: string;
  /** Called once, whether the story ran to its end or was skipped. */
  onFinish: (how: "ended" | "skipped") => void;
}) {
  return (
    <Modal open={open} onClose={() => onFinish("skipped")} label={`${product.title} story`} variant="full">
      {open && <Sequence story={story} media={media} internal={internal} product={product} formId={formId} onFinish={onFinish} />}
    </Modal>
  );
}

/** A generic fighter in a flying kick, drawn with round brush strokes. It is nobody in particular. */
function BrushFighter() {
  return (
    <svg viewBox="0 0 420 340" className="block h-auto w-full" aria-hidden="true" focusable="false" fill="none" stroke="#0c0c0d" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="252" cy="68" r="30" fill="#0c0c0d" stroke="none" />
      <path d="M246 108 L286 196" strokeWidth="58" />
      <path d="M282 202 L172 216 L46 204" strokeWidth="40" />
      <path d="M46 204 L30 182" strokeWidth="30" />
      <path d="M286 202 L352 236 L316 300" strokeWidth="38" />
      <path d="M236 122 L190 152 L216 182" strokeWidth="27" />
      <path d="M262 118 L322 96 L368 122" strokeWidth="27" />
    </svg>
  );
}

const BURST = [0, 50, 100, 150, 205, 260, 310];

type Line = [number, number, number, number];

/** Turns a path written in percent of the stage into pixels. Its numbers alternate x, y. */
function scalePath(d: string, sx: number, sy: number): string {
  let isX = true;
  return d.replace(/-?\d+(\.\d+)?/g, (n) => {
    const v = Number(n) * (isX ? sx : sy);
    isX = !isX;
    return v.toFixed(1);
  });
}

/**
 * Arcs, speed lines and the impact burst for one orientation. They are authored in percent of the
 * stage and drawn in real pixels, so a brush stroke keeps one width on a wide screen and a tall one.
 */
function MotionLines({
  className,
  arc1: arc1Pct,
  arc2: arc2Pct,
  speedIn: speedInPct,
  speedOut: speedOutPct,
  hit: hitPct,
  sx,
  sy,
}: {
  className: string;
  arc1: string;
  arc2: string;
  speedIn: Line[];
  speedOut: Line[];
  hit: [number, number];
  sx: number;
  sy: number;
}) {
  const px = ([x1, y1, x2, y2]: Line): Line => [x1 * sx, y1 * sy, x2 * sx, y2 * sy];
  const arc1 = scalePath(arc1Pct, sx, sy);
  const arc2 = scalePath(arc2Pct, sx, sy);
  const speedIn = speedInPct.map(px);
  const speedOut = speedOutPct.map(px);
  const hit: [number, number] = [hitPct[0] * sx, hitPct[1] * sy];
  const unit = Math.min(sx, sy) * 100 * 0.01;
  return (
    <g className={className}>
      <g className="cine-speed cine-speed-in">
        {speedIn.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      <path data-testid="cine-arc" className="cine-arc cine-arc-1" pathLength={1} d={arc1} />
      <path className="cine-arc-ink cine-arc-1" pathLength={1} d={arc1} />
      <path className="cine-arc cine-arc-2" pathLength={1} d={arc2} />
      <path className="cine-arc-ink cine-arc-2" pathLength={1} d={arc2} />
      <g className="cine-burst" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        {BURST.map((deg) => {
          const a = (deg * Math.PI) / 180;
          return <line key={deg} x1={hit[0] + Math.cos(a) * unit * 4} y1={hit[1] + Math.sin(a) * unit * 4} x2={hit[0] + Math.cos(a) * unit * 10} y2={hit[1] + Math.sin(a) * unit * 10} />;
        })}
      </g>
      <g className="cine-speed cine-speed-out">
        {speedOut.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
    </g>
  );
}

function Sequence({
  story,
  media,
  internal,
  product,
  formId,
  onFinish,
}: {
  story: CollectionStory;
  media: StoryMedia;
  internal: boolean;
  product: Product;
  formId: string;
  onFinish: (how: "ended" | "skipped") => void;
}) {
  const total = totalSeconds(story);
  const [beat, setBeat] = useState(story.beats[0]);
  const [videoFailed, setVideoFailed] = useState(false);
  const finish = useRef(onFinish);
  useEffect(() => {
    finish.current = onFinish;
  });

  // Skip takes focus as the dialog opens. It is asked for a frame late, because the dialog itself
  // opens after this component mounts, and not every browser focuses a button by itself.
  const skip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => skip.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const seconds = (now - started) / 1000;
      if (seconds >= total) {
        finish.current("ended");
        return;
      }
      const current = beatAt(story, seconds);
      setBeat((prev) => (prev.id === current.id ? prev : current));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [story, total]);

  // The motion lines are drawn in real pixels, so the stage is measured.
  const root = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStage((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const footage = media.video && !videoFailed ? media.video : undefined;
  const closeupAt = story.beats.find((b) => b.id === "closeup")?.from ?? total;
  const characterAspect = story.slots.find((s) => s.id === "character")?.aspect ?? 0.75;
  const index = story.beats.findIndex((b) => b.id === beat.id) + 1;
  const onMedia = beat.id === "fill" || beat.id === "closeup";

  return (
    <div
      ref={root}
      data-testid="story-cinematic"
      data-beat={beat.id}
      data-footage={footage ? "video" : "animatic"}
      className="cine story-light relative h-full w-full overflow-hidden"
      style={{ "--beat": `${beat.to - beat.from}s`, "--total": `${total}s` } as React.CSSProperties}
    >
      {footage ? (
        <video
          data-testid="story-video"
          className="absolute inset-0 h-full w-full object-cover"
          src={footage}
          muted
          playsInline
          autoPlay
          onTimeUpdate={(e) => {
            // The clip only ever covers the action. The close-up belongs to the page.
            if (e.currentTarget.currentTime >= closeupAt) e.currentTarget.pause();
          }}
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <>
          <div data-testid="cine-character" className="cine-character" style={{ aspectRatio: String(characterAspect) }}>
            {media.character ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media.character} alt="" draggable={false} className="block h-full w-full select-none" />
            ) : (
              <PlaceholderFigure className="block h-full w-full" />
            )}
            {/* Where the face is, from the story data. Nothing is drawn: motion is checked against it. */}
            <span
              data-testid="cine-face"
              aria-hidden="true"
              className="pointer-events-none absolute"
              style={{ left: `${story.face.x * 100}%`, top: `${story.face.y * 100}%`, width: `${story.face.w * 100}%`, height: `${story.face.h * 100}%` }}
            />
          </div>
          <div className="cine-ground" aria-hidden="true" />
          {stage.w > 0 && (
          <svg className="cine-lines" viewBox={`0 0 ${stage.w} ${stage.h}`} aria-hidden="true" focusable="false">
            <MotionLines
              sx={stage.w / 100}
              sy={stage.h / 100}
              className="cine-land"
              arc1="M 30 104 C 33 70, 36 34, 46 16"
              arc2="M 34 96 C 48 78, 58 50, 108 22"
              speedIn={[
                [68, 24, 92, 20],
                [70, 31, 99, 27],
                [72, 39, 100, 36],
                [74, 47, 96, 45],
              ]}
              speedOut={[
                [66, 18, 95, 8],
                [60, 26, 97, 14],
                [63, 34, 100, 24],
              ]}
              hit={[40, 42]}
            />
            <MotionLines
              sx={stage.w / 100}
              sy={stage.h / 100}
              className="cine-port"
              arc1="M -4 52 C 14 30, 58 26, 104 50"
              arc2="M 20 44 C 40 34, 64 20, 108 2"
              speedIn={[
                [62, 8, 96, 3],
                [66, 14, 100, 10],
                [70, 20, 98, 17],
              ]}
              speedOut={[
                [58, 10, 98, -2],
                [62, 17, 102, 7],
              ]}
              hit={[40, 31]}
            />
          </svg>
          )}
          <div data-testid="cine-opponent" className="cine-opponent">
            <BrushFighter />
          </div>
          <div className="cine-flash" aria-hidden="true" />
        </>
      )}

      <div className="cine-sand grain" aria-hidden="true" style={media.sand ? { backgroundImage: `url(${media.sand})` } : undefined} />

      <div className="cine-closeup">{beat.id === "closeup" && <StoryVisual story={story} media={media} product={product} formId={formId} captions={false} />}</div>

      <div className={`absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 sm:p-6 ${onMedia ? "text-ivory" : "text-ink"}`}>
        <p data-testid="story-cinematic-tag" className="label-xs leading-relaxed">
          {story.storyLabel}
          {/* Development-only. A build plays a story only once real, approved footage exists. */}
          {internal && !footage && <span className="story-dev block">Concept motion prototype · not final footage</span>}
        </p>
        <button ref={skip} type="button" data-testid="story-skip" onClick={() => onFinish("skipped")} className="label-xs inline-flex min-h-11 items-center bg-ink px-4 text-ivory">
          Skip <span aria-hidden="true">&nbsp;→</span>
        </button>
      </div>

      <div className={`absolute inset-x-0 bottom-0 p-4 sm:p-6 ${onMedia ? "text-ivory" : "text-ink"}`}>
        <p data-testid="story-beat" className="label-xs" aria-hidden="true">
          {String(index).padStart(2, "0")} — {beat.title}
        </p>
        <p role="status" className="sr-only">
          {beat.caption}
        </p>
        <div className="mt-3 h-px w-full bg-current/20">
          <div className="cine-progress h-px w-full bg-current" />
        </div>
      </div>
    </div>
  );
}
