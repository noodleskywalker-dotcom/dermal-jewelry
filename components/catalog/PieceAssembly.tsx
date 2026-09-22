"use client";

import { useEffect, useState } from "react";
import { formOf } from "@/lib/catalog";
import type { MaterialNote, PlacementId, Product } from "@/lib/catalog/types";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";
import { SandLayer } from "@/components/story/SandLayer";
import { PieceArt } from "./FormVisual";

// The complete piercing, not only its decorative front: the tops, the short posts they seat on and
// the base under the skin. It opens separated, glides into alignment, the tops approach and settle,
// and one sweep of light crosses the finished piece. It can be opened out again as an exploded view.
//
// The tops are the approved product artwork, untouched. The hardware is CONCEPT HARDWARE: our own
// drawing, proportioned like real body jewelry (a slim surface bar with two short risers, a small
// dermal anchor with a low footplate, a nostril screw with a curved tail) so the piece reads as
// jewelry, but no maker has confirmed its type, size or thread, so it says so and carries no
// measurement. Material callouts are real page text with leader lines, never part of an image.
//
// An optional themed opening (for DESERT EYE: a small sand spirit drawn into the piece) can be passed
// as `renderIntro`. It runs before the standard assembly and hands over by calling `done`. Nothing is
// produced for it yet, and the standard assembly never depends on it.

type Top = { componentId: string; art: Product["components"][number]["art"]; x: number; y: number; width: number; seat: number; foot: number };
type Hardware = "bar" | "anchor" | "stud";
type Phase = "intro" | "assembling" | "assembled" | "exploded";

const SECONDS = 4;
const STONES = new Set(["garnet-gem", "orbit"]);

/**
 * Layout in a 100 x 100 stage. `y` is the centre of a top. Its riser is hidden under the art from
 * `seat` and shows from the art's lower edge down to `foot`, where the base is. `metal` is where the
 * titanium callout points: a spot on the base or the post.
 */
function layout(placement: PlacementId, product: Product, formId: string): { tops: Top[]; hardware: Hardware; metal: [number, number] } {
  const parts = formOf(product, formId).components;
  if (parts.length > 1) {
    // A surface bar: one slim base with two short risers, on the approved diagonal. The larger piece
    // is upper and outer. Both risers are the same short length; the tops sit right on them.
    const [a, b] = [...parts].sort((p, q) => q.size - p.size);
    return {
      hardware: "bar",
      tops: [
        { componentId: a.id, art: a.art, x: 60, y: 38, width: 30, seat: 49, foot: 59 },
        { componentId: b.id, art: b.art, x: 37, y: 59, width: 11.5, seat: 61.5, foot: 71 },
      ],
      metal: [48.5, 65],
    };
  }
  const [only] = parts;
  if (placement === "nostril") {
    // A nostril screw: a short straight post under the stone, then a curved tail.
    return { hardware: "stud", tops: [{ componentId: only.id, art: only.art, x: 50, y: 44, width: 13, seat: 47, foot: 58.5 }], metal: [51.5, 60.5] };
  }
  // A dermal anchor: a short post on a small, low footplate.
  return { hardware: "anchor", tops: [{ componentId: only.id, art: only.art, x: 50, y: 43, width: 30, seat: 53.5, foot: 62 }], metal: [50, 60] };
}

/** The segment from `a` to `b`, lengthened by `by` at both ends. */
function extend(a: [number, number], b: [number, number], by: number): [[number, number], [number, number]] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = (dx / len) * by;
  const uy = (dy / len) * by;
  return [
    [a[0] - ux, a[1] - uy],
    [b[0] + ux, b[1] + uy],
  ];
}

type Props = {
  product: Product;
  formId: string;
  /** DESERT EYE stands on a little sand; it is drawn inside the stage so it never lies behind text. */
  sand?: boolean;
  /** Optional themed opening. Call `done` to hand over to the standard assembly. */
  renderIntro?: (done: () => void) => React.ReactNode;
};

// A new form, a replay or a change of the motion preference starts a fresh stage, so the sequence
// always begins from its own first state and never has to be reset from an effect.
export function PieceAssembly(props: Props) {
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  const form = formOf(props.product, props.formId);
  return <Stage key={`${form.id}:${run}:${reduced}`} {...props} reduced={reduced} onReplay={() => setRun((n) => n + 1)} />;
}

function Stage({ product, formId, sand, renderIntro, reduced, onReplay }: Props & { reduced: boolean; onReplay: () => void }) {
  const form = formOf(product, formId);
  // With reduced motion the piece is simply there.
  const [phase, setPhase] = useState<Phase>(reduced ? "assembled" : renderIntro ? "intro" : "assembling");
  const { tops, hardware, metal } = layout(form.placement, product, form.id);
  const hasStone = tops.some((t) => STONES.has(t.art));
  const notes = (product.materials ?? []).filter((n) => n.id !== "stone" || hasStone);

  useEffect(() => {
    if (phase !== "assembling") return;
    const timer = setTimeout(() => setPhase("assembled"), SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [phase]);

  // Where each callout points, and where its label sits. Labels stay clear of the piece on either side.
  const stoneTop = tops.find((t) => STONES.has(t.art));
  const metalTop = tops.find((t) => !STONES.has(t.art)) ?? tops[0];
  const callouts: Record<MaterialNote["id"], { from: [number, number]; to: [number, number]; side: "left" | "right" }> = {
    finish: { from: [metalTop.x + metalTop.width * 0.36, metalTop.y - metalTop.width * 0.3], to: [84, metalTop.y - metalTop.width * 0.3 - 8], side: "right" },
    stone: stoneTop ? { from: [stoneTop.x - stoneTop.width * 0.52, stoneTop.y], to: [16, stoneTop.y - 7], side: "left" } : { from: [0, 0], to: [0, 0], side: "left" },
    metal: { from: metal, to: [84, metal[1] + 9], side: "right" },
  };

  // The base bar runs between the two feet and a little past each, with rounded ends.
  const bar = hardware === "bar" ? extend([tops[1].x, tops[1].foot], [tops[0].x, tops[0].foot], 2.6) : null;

  return (
    <figure data-testid="piece-assembly" data-form={form.id} data-hardware={hardware} data-phase={phase} className="assembly-figure w-full">
      <div className="assembly relative w-full" style={{ "--assembly": `${SECONDS}s` } as React.CSSProperties}>
        {sand && <SandLayer className="product-sand" />}
        {phase === "intro" && renderIntro?.(() => setPhase("assembling"))}

        {/* Base: the part under the skin. */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" data-part="base" className="assembly-part assembly-base assembly-metal absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          <defs>
            {/* Polished titanium: a bright top edge, a dark turning band, a second reflection. */}
            <linearGradient id="assembly-metal" gradientUnits="userSpaceOnUse" x1="40" y1="44" x2="60" y2="74">
              <stop offset="0" stopColor="#f4f6f8" />
              <stop offset="0.3" stopColor="#a9afb7" />
              <stop offset="0.52" stopColor="#e4e7eb" />
              <stop offset="0.72" stopColor="#767c85" />
              <stop offset="1" stopColor="#4f545c" />
            </linearGradient>
            <linearGradient id="assembly-metal-dark" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1" gradientTransform="scale(100)">
              <stop offset="0" stopColor="#9aa0a8" />
              <stop offset="1" stopColor="#4e535b" />
            </linearGradient>
            <filter id="assembly-contact" filterUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
          </defs>
          {/* Contact shadow, close under the base, so the piece stands rather than floats. */}
          {hardware === "bar" && bar && (
            <ellipse cx={(bar[0][0] + bar[1][0]) / 2} cy={(bar[0][1] + bar[1][1]) / 2 + 4.5} rx="15" ry="2" fill="rgba(40,30,20,0.16)" filter="url(#assembly-contact)" />
          )}
          {hardware !== "bar" && <ellipse cx="50" cy={tops[0].foot + 4} rx="7" ry="1.4" fill="rgba(40,30,20,0.16)" filter="url(#assembly-contact)" />}

          {hardware === "bar" && bar && (
            <g>
              <path d={`M${bar[0][0]} ${bar[0][1]} L${bar[1][0]} ${bar[1][1]}`} stroke="url(#assembly-metal)" strokeWidth="2.3" strokeLinecap="round" fill="none" />
              <path d={`M${bar[0][0]} ${bar[0][1] - 0.6} L${bar[1][0]} ${bar[1][1] - 0.6}`} stroke="rgba(255,255,255,0.8)" strokeWidth="0.35" strokeLinecap="round" fill="none" />
              <path d={`M${bar[0][0]} ${bar[0][1] + 0.7} L${bar[1][0]} ${bar[1][1] + 0.7}`} stroke="rgba(40,40,45,0.35)" strokeWidth="0.3" strokeLinecap="round" fill="none" />
            </g>
          )}
          {hardware === "anchor" && (
            <g>
              {/* A low footplate, seen from slightly above: a small rounded plate with its two holes. */}
              <rect x="43" y={tops[0].foot - 1.1} width="14" height="2.6" rx="1.3" fill="url(#assembly-metal)" />
              <rect x="43.5" y={tops[0].foot - 0.85} width="13" height="0.5" rx="0.25" fill="rgba(255,255,255,0.75)" />
              <circle cx="45.8" cy={tops[0].foot + 0.2} r="0.55" fill="#4e535b" />
              <circle cx="54.2" cy={tops[0].foot + 0.2} r="0.55" fill="#4e535b" />
            </g>
          )}
        </svg>

        {/* Posts: the short riser each top seats on, and the collar it sits in. A nostril screw is one
            piece, so its curved tail belongs to the post, not to a separate base. */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" data-part="posts" className="assembly-part assembly-posts assembly-metal absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          {hardware === "stud" && (
            <g>
              <path d={`M50 ${tops[0].foot - 3} C50 ${tops[0].foot + 2.5} 52.5 ${tops[0].foot + 4.2} 55.6 ${tops[0].foot + 4.2}`} stroke="url(#assembly-metal)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d={`M49.7 ${tops[0].foot - 3} C49.7 ${tops[0].foot + 2} 52 ${tops[0].foot + 3.6} 55.4 ${tops[0].foot + 3.6}`} stroke="rgba(255,255,255,0.7)" strokeWidth="0.28" strokeLinecap="round" fill="none" />
            </g>
          )}
          {tops.map((top) => (
            <g key={top.componentId} data-post={top.componentId}>
              <rect x={top.x - 0.7} y={top.seat} width="1.4" height={top.foot - top.seat} rx="0.7" fill="url(#assembly-metal)" />
              <rect x={top.x - 0.42} y={top.seat + 0.6} width="0.28" height={top.foot - top.seat - 1.4} rx="0.14" fill="rgba(255,255,255,0.8)" />
              {/* The seat: a small threaded collar just under the art. */}
              <ellipse cx={top.x} cy={top.seat + 1.2} rx="1.7" ry="0.65" fill="url(#assembly-metal-dark)" />
              <ellipse cx={top.x} cy={top.seat + 0.95} rx="1.7" ry="0.55" fill="url(#assembly-metal)" />
            </g>
          ))}
        </svg>

        {/* Fine guides, seen only while the piece is open. */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="assembly-guides absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          {tops.map((top) => (
            <line key={top.componentId} x1={top.x} y1={top.y - 12} x2={top.x} y2={top.seat + 1} stroke="#0c0c0d" strokeOpacity="0.35" strokeWidth="0.2" strokeDasharray="0.6 1" />
          ))}
        </svg>

        {tops.map((top, i) => (
          <span
            key={top.componentId}
            data-part={top.componentId}
            className="assembly-part assembly-top absolute block"
            style={{ left: `${top.x}%`, top: `${top.y}%`, width: `${top.width}%`, "--order": i } as React.CSSProperties}
          >
            <PieceArt product={product} formId={form.id} componentId={top.componentId} art={top.art} />
          </span>
        ))}

        <span aria-hidden="true" className="assembly-sweep" />

        {/* Leader lines. The words themselves are the list below, positioned over the stage on wide screens. */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="assembly-leaders absolute inset-0 hidden h-full w-full sm:block" aria-hidden="true" focusable="false">
          {notes.map((note) => {
            const c = callouts[note.id];
            return (
              <g key={note.id}>
                <line x1={c.from[0]} y1={c.from[1]} x2={c.to[0]} y2={c.to[1]} stroke="#0c0c0d" strokeOpacity="0.45" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <circle cx={c.from[0]} cy={c.from[1]} r="0.45" fill="#0c0c0d" />
              </g>
            );
          })}
        </svg>
        <dl data-testid="assembly-notes" className="assembly-notes">
          {notes.map((note) => {
            const c = callouts[note.id];
            return (
              <div key={note.id} data-side={c.side} className="assembly-note" style={{ "--nx": `${c.to[0]}%`, "--ny": `${c.to[1]}%` } as React.CSSProperties}>
                <dt className="label-xs">{note.label}</dt>
                <dd className="label-xs text-ash">{note.status}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      <figcaption className="label-xs mt-3 flex flex-wrap items-center justify-between gap-x-6 text-ash">
        <span>Concept hardware · type, size and thread not confirmed</span>
        <span className="flex gap-x-6">
          <button
            type="button"
            data-testid="assembly-explode"
            aria-pressed={phase === "exploded"}
            onClick={() => setPhase((p) => (p === "exploded" ? "assembled" : "exploded"))}
            className="label-xs inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline"
          >
            {phase === "exploded" ? "Assemble" : "Exploded view"}
          </button>
          <button type="button" data-testid="assembly-replay" onClick={onReplay} className="label-xs inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline">
            Replay
          </button>
        </span>
      </figcaption>
    </figure>
  );
}
