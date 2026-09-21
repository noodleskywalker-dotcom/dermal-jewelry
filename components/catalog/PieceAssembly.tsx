"use client";

import { useEffect, useState } from "react";
import { formOf } from "@/lib/catalog";
import type { MaterialNote, PlacementId, Product } from "@/lib/catalog/types";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";
import { PieceArt } from "./FormVisual";

// The complete piercing, not only its decorative front: the tops, the posts they sit on and the base
// under the skin. It opens separated, glides into alignment, the tops approach and settle, and one
// sweep of light crosses the finished piece. It can be opened out again as an exploded view.
//
// The tops are the approved product artwork, untouched. The hardware is our own CONCEPTUAL geometry:
// no maker has confirmed its type, size or thread, so it is drawn plainly, says so, and carries no
// measurement. Material callouts are real page text with leader lines, never part of an image.
//
// An optional themed opening (for DESERT EYE: a small sand spirit drawn into the piece) can be passed
// as `renderIntro`. It runs before the standard assembly and hands over by calling `done`. Nothing is
// produced for it yet, and the standard assembly never depends on it.

type Top = { componentId: string; art: Product["components"][number]["art"]; x: number; y: number; width: number; foot: number };
type Hardware = "bar" | "anchor" | "stud";
type Phase = "intro" | "assembling" | "assembled" | "exploded";

const SECONDS = 4;
const STONES = new Set(["garnet-gem", "orbit"]);

/** Layout in a 100 x 100 stage. `y` is the centre of a top; its post runs from under it down to `foot`. */
function layout(placement: PlacementId, product: Product, formId: string): { tops: Top[]; hardware: Hardware } {
  const parts = formOf(product, formId).components;
  if (parts.length > 1) {
    // A surface bar: two posts on one base, on the approved diagonal. The larger piece is upper and outer.
    const [a, b] = [...parts].sort((p, q) => q.size - p.size);
    return {
      hardware: "bar",
      tops: [
        { componentId: a.id, art: a.art, x: 60, y: 33, width: 26, foot: 68 },
        { componentId: b.id, art: b.art, x: 39, y: 50, width: 9.5, foot: 78 },
      ],
    };
  }
  const [only] = parts;
  if (placement === "nostril") return { hardware: "stud", tops: [{ componentId: only.id, art: only.art, x: 50, y: 36, width: 12, foot: 78 }] };
  return { hardware: "anchor", tops: [{ componentId: only.id, art: only.art, x: 50, y: 33, width: 28, foot: 74 }] };
}

type Props = {
  product: Product;
  formId: string;
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

function Stage({ product, formId, renderIntro, reduced, onReplay }: Props & { reduced: boolean; onReplay: () => void }) {
  const form = formOf(product, formId);
  // With reduced motion the piece is simply there.
  const [phase, setPhase] = useState<Phase>(reduced ? "assembled" : renderIntro ? "intro" : "assembling");
  const { tops, hardware } = layout(form.placement, product, form.id);
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
    finish: { from: [metalTop.x + metalTop.width * 0.42, metalTop.y - 6], to: [84, metalTop.y - 12], side: "right" },
    stone: stoneTop ? { from: [stoneTop.x - stoneTop.width * 0.6, stoneTop.y], to: [16, stoneTop.y - 8], side: "left" } : { from: [0, 0], to: [0, 0], side: "left" },
    metal: { from: [tops[0].x + 2.5, tops[0].foot - 8], to: [84, tops[0].foot + 2], side: "right" },
  };

  return (
    <figure data-testid="piece-assembly" data-form={form.id} data-hardware={hardware} data-phase={phase} className="assembly-figure w-full">
      <div className="assembly relative w-full" style={{ "--assembly": `${SECONDS}s` } as React.CSSProperties}>
        {phase === "intro" && renderIntro?.(() => setPhase("assembling"))}

        {/* Base: the part under the skin. */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" data-part="base" className="assembly-part assembly-base absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="assembly-metal" gradientUnits="userSpaceOnUse" x1="25" y1="55" x2="75" y2="90">
              <stop offset="0" stopColor="#f7f8f9" />
              <stop offset="0.35" stopColor="#b4bac2" />
              <stop offset="0.6" stopColor="#eceef1" />
              <stop offset="1" stopColor="#7c828b" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="92" rx="24" ry="1.8" fill="rgba(40,30,20,0.07)" />
          {hardware === "bar" && (
            <g>
              <path d={`M${tops[1].x} ${tops[1].foot} L${tops[0].x} ${tops[0].foot}`} stroke="url(#assembly-metal)" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              <path d={`M${tops[1].x} ${tops[1].foot - 0.9} L${tops[0].x} ${tops[0].foot - 0.9}`} stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" strokeLinecap="round" fill="none" />
            </g>
          )}
          {hardware === "anchor" && (
            <g>
              <rect x="38" y={tops[0].foot - 1.6} width="24" height="3.6" rx="1.8" fill="url(#assembly-metal)" />
              <circle cx="43.5" cy={tops[0].foot + 0.2} r="0.9" fill="#fbfaf7" />
              <circle cx="56.5" cy={tops[0].foot + 0.2} r="0.9" fill="#fbfaf7" />
            </g>
          )}
          {hardware === "stud" && <circle cx="50" cy={tops[0].foot} r="1.9" fill="url(#assembly-metal)" />}
        </svg>

        {/* Posts: what each top sits on. */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" data-part="posts" className="assembly-part assembly-posts absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          {tops.map((top) => (
            <g key={top.componentId} data-post={top.componentId}>
              <rect x={top.x - 0.95} y={top.y + 3} width="1.9" height={top.foot - top.y - 3} rx="0.95" fill="url(#assembly-metal)" />
              <rect x={top.x - 0.5} y={top.y + 4} width="0.35" height={top.foot - top.y - 6} rx="0.17" fill="rgba(255,255,255,0.75)" />
            </g>
          ))}
        </svg>

        {/* Fine guides, seen only while the piece is open. */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="assembly-guides absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          {tops.map((top) => (
            <line key={top.componentId} x1={top.x} y1={top.y - 12} x2={top.x} y2={top.y + 2} stroke="#0c0c0d" strokeOpacity="0.35" strokeWidth="0.2" strokeDasharray="0.6 1" />
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
        <span>Hardware shown conceptually · type, size and thread not confirmed</span>
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
