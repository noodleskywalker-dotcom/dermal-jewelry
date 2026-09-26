"use client";

import { useEffect, useRef, useState } from "react";

// The jewelry itself is clickable. Each hotspot sits on a part of the piece in the beauty frame; a
// press (or Enter or Space on its focus) opens a luxury annotation beside it with a fine leader line.
// Escape or a second press closes it. Only one annotation is open at a time.
//
// Every value is the owner's wording or "pending": nothing is invented. No purity, no grade, no
// dimensions until a supplier confirms them.

export type Hotspot = {
  id: string;
  /** Position on the beauty frame, 0..1 of its width and height. */
  x: number;
  y: number;
  /** Which side the annotation opens to. */
  side: "left" | "right";
  title: string;
  rows: { label: string; value: string }[];
};

export function MaterialHotspots({ spots }: { spots: Hotspot[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={root} className="hotspots" data-testid="hotspots">
      {spots.map((s) => {
        const isOpen = open === s.id;
        return (
          <div key={s.id} className="hotspot" data-open={isOpen} data-side={s.side} style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}>
            <button
              type="button"
              data-testid={`hotspot-${s.id}`}
              aria-expanded={isOpen}
              aria-controls={`hotspot-note-${s.id}`}
              aria-label={`${s.title}: material details`}
              onClick={() => setOpen(isOpen ? null : s.id)}
              className="hotspot-dot"
            >
              <span aria-hidden="true" className="hotspot-ring" />
            </button>
            <div id={`hotspot-note-${s.id}`} role="region" aria-label={s.title} hidden={!isOpen} data-testid={`hotspot-note-${s.id}`} className="hotspot-note">
              <span aria-hidden="true" className="hotspot-leader" />
              <p className="label-xs">{s.title}</p>
              <dl className="mt-3 space-y-2">
                {s.rows.map((r) => (
                  <div key={r.label}>
                    <dt className="label-xs text-ash">{r.label}</dt>
                    <dd className="mt-0.5 font-display text-[1.05rem] font-light leading-snug">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** The anti-eyebrow piece in the orbit's first frame: gemstone, surface bar, symbol. The owner's wording. */
/**
 * The same annotations placed on the owner's design render of 26 September 2026 (the product page's
 * lead picture for the anti-eyebrow form), measured on public/products/desert-eye/hero.webp.
 */
export const DESERT_EYE_RENDER_POSITIONS: Record<string, { x: number; y: number }> = {
  gemstone: { x: 0.136, y: 0.46 },
  bar: { x: 0.36, y: 0.43 },
  symbol: { x: 0.71, y: 0.52 },
};

export const DESERT_EYE_HOTSPOTS: Hotspot[] = [
  {
    id: "gemstone",
    x: 0.3,
    y: 0.44,
    side: "right",
    title: "Deep-red faceted gemstone",
    rows: [
      { label: "Material", value: "Not yet confirmed" },
      { label: "Cut", value: "Faceted" },
      { label: "Setting", value: "Four-prong concept" },
      { label: "Purity / grade", value: "Pending supplier confirmation" },
    ],
  },
  {
    id: "bar",
    x: 0.47,
    y: 0.71,
    side: "right",
    title: "Titanium",
    rows: [
      { label: "Grade", value: "Proposed · pending confirmation" },
      { label: "Finish", value: "Polished" },
      { label: "Hardware", value: "Prototype surface-bar concept" },
    ],
  },
  {
    id: "symbol",
    x: 0.66,
    y: 0.34,
    side: "left",
    title: "Openwork symbol",
    rows: [
      { label: "Front", value: "Deep garnet" },
      { label: "Edge", value: "Polished metallic finish" },
      { label: "Status", value: "Prototype art · manufacturing geometry pending" },
    ],
  },
];

export const DESERT_EYE_RENDER_HOTSPOTS: Hotspot[] = DESERT_EYE_HOTSPOTS.map((spot) => ({ ...spot, ...DESERT_EYE_RENDER_POSITIONS[spot.id] }));
