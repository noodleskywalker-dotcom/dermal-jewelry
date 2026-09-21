"use client";

import { useState } from "react";
import { formOf } from "@/lib/catalog";
import type { PlacementId, Product } from "@/lib/catalog/types";
import { PieceArt } from "./FormVisual";

// The whole piercing, not only its decorative front: the tops, the posts they sit on and the base
// under the skin, shown apart and then brought together, with what each part is made of.
//
// The hardware is a SCHEMATIC. Its type, size, thread and shape are not confirmed by a maker, so it is
// drawn plainly, says so, and gives no measurements. The tops are the product artwork itself.
// It plays once when the view opens, can be replayed, and with reduced motion it is simply assembled.

type Top = { componentId: string; art: Product["components"][number]["art"]; x: number; y: number; width: number; post: { x: number; y: number }; foot: number };

/** Layout in a 100 x 100 box. `post` is where the top of each post ends; `foot` is where it meets the base. */
function layout(placement: PlacementId, product: Product, formId: string): { tops: Top[]; hardware: "bar" | "anchor" | "stud" } {
  const parts = formOf(product, formId).components;
  if (parts.length > 1) {
    // A surface bar: two posts on one base, on the approved diagonal. The larger piece is upper and outer.
    const [a, b] = [...parts].sort((p, q) => q.size - p.size);
    return {
      hardware: "bar",
      tops: [
        { componentId: a.id, art: a.art, x: 63, y: 34, width: 36, post: { x: 63, y: 52 }, foot: 66 },
        { componentId: b.id, art: b.art, x: 35, y: 58, width: 13, post: { x: 35, y: 66 }, foot: 80 },
      ],
    };
  }
  const [only] = parts;
  if (placement === "nostril") return { hardware: "stud", tops: [{ componentId: only.id, art: only.art, x: 50, y: 38, width: 18, post: { x: 50, y: 46 }, foot: 82 }] };
  return { hardware: "anchor", tops: [{ componentId: only.id, art: only.art, x: 50, y: 34, width: 38, post: { x: 50, y: 54 }, foot: 79 }] };
}

export function PieceAssembly({ product, formId }: { product: Product; formId: string }) {
  const form = formOf(product, formId);
  const [run, setRun] = useState(0);
  const { tops, hardware } = layout(form.placement, product, form.id);
  const notes = product.materials ?? [];

  return (
    <figure data-testid="piece-assembly" data-form={form.id} data-hardware={hardware} className="w-full">
      <div key={`${form.id}:${run}`} className="assembly relative aspect-square w-full overflow-hidden">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="assembly-metal" gradientUnits="userSpaceOnUse" x1="20" y1="40" x2="80" y2="95">
              <stop offset="0" stopColor="#f4f5f7" />
              <stop offset="0.4" stopColor="#a9afb8" />
              <stop offset="0.62" stopColor="#e6e9ec" />
              <stop offset="1" stopColor="#70767f" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="91" rx="28" ry="2.6" fill="rgba(40,30,20,0.09)" />
          {/* Base first, then the posts that rise from it. */}
          <g className="assembly-part" style={{ "--from": "12px", "--at": "0s" } as React.CSSProperties} data-part="base">
            {hardware === "bar" && <path d="M35 80 L63 66" stroke="url(#assembly-metal)" strokeWidth="3.6" strokeLinecap="round" fill="none" />}
            {hardware === "anchor" && (
              <g>
                <rect x="37" y="78" width="26" height="5" rx="2.5" fill="url(#assembly-metal)" />
                <circle cx="43.5" cy="80.5" r="1.1" fill="#f3efe7" />
                <circle cx="56.5" cy="80.5" r="1.1" fill="#f3efe7" />
              </g>
            )}
            {hardware === "stud" && <circle cx="50" cy="84" r="2.3" fill="url(#assembly-metal)" />}
          </g>
          <g className="assembly-part" style={{ "--from": "10px", "--at": "0.55s" } as React.CSSProperties} data-part="posts">
            {tops.map((top) => (
              <rect key={top.componentId} x={top.post.x - 1.1} y={top.post.y} width="2.2" height={top.foot - top.post.y} rx="1.1" fill="url(#assembly-metal)" />
            ))}
          </g>
        </svg>

        {tops.map((top, i) => (
          <span
            key={top.componentId}
            data-part={top.componentId}
            className="assembly-part absolute block"
            style={{ left: `${top.x}%`, top: `${top.y}%`, width: `${top.width}%`, translate: "-50% -50%", "--from": "-64px", "--at": `${1.7 - i * 0.5}s`, filter: "drop-shadow(0 10px 9px rgba(40,30,20,0.18))" } as React.CSSProperties}
          >
            <PieceArt product={product} formId={form.id} componentId={top.componentId} art={top.art} />
          </span>
        ))}
      </div>

      <figcaption className="mt-3">
        <dl key={`${form.id}:${run}:notes`} data-testid="assembly-notes" className="grid gap-x-8 sm:grid-cols-2">
          {notes.map((note, i) => (
            <div key={note.part} className="assembly-note flex items-baseline gap-3 border-t border-ink/15 py-2" style={{ "--at": `${2.7 + i * 0.22}s` } as React.CSSProperties}>
              <dt className="label-xs w-24 shrink-0 text-ink/55">{note.part}</dt>
              <dd className="text-sm leading-snug">
                {note.value} <span className="label-xs ml-1 whitespace-nowrap text-garnet">{note.status}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="label-xs flex flex-wrap items-center justify-between gap-x-6 border-t border-ink/15 pt-1 leading-relaxed text-ink/50">
          <span>Hardware shown as a schematic · type, size and thread not confirmed</span>
          <button type="button" data-testid="assembly-replay" onClick={() => setRun((n) => n + 1)} className="label-xs inline-flex min-h-11 items-center text-ink/70 underline underline-offset-4 hover:text-ink">
            Replay
          </button>
        </p>
      </figcaption>
    </figure>
  );
}
