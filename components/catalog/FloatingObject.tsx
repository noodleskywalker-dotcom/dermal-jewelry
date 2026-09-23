import { formOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { resolveComponents } from "@/lib/studio/geometry";
import { FormVisual } from "./FormVisual";

export type ObjectMotion = "sand" | "gem" | "blade" | "sweep" | "pendulum" | "eye" | "edge";

/** A family whose motion is its own, set by the owner with the design (23 September 2026). */
const OWN_MOTION: Record<string, ObjectMotion> = {
  crossline: "sweep",
  "ankh-trace": "pendulum",
  "horus-trace": "eye",
  "blade-trace": "edge",
};

const STONES = new Set(["garnet-gem", "orbit"]);

/**
 * Each family has its own small motion language on hover. It is derived from what the piece is:
 * the DESERT EYE design stirs sand and glints; a piece with a stone turns a little and sparkles;
 * plain metal takes one blade of light. CROSSLINE takes a light sweep and a step forward, ANKH TRACE
 * swings a little like a pendant, HORUS TRACE lights its stone and traces its own line once, and
 * BLADE TRACE takes one thin light along its edge and steps forward.
 * Original designs never get sand.
 */
export function motionOf(product: Product, formId?: string): ObjectMotion {
  if (product.origin === "anime-inspired" && product.collection === "desert-eye") return "sand";
  const own = OWN_MOTION[product.slug];
  if (own) return own;
  return formOf(product, formId).components.some((c) => STONES.has(c.art)) ? "gem" : "blade";
}

const GRAINS = [
  { gx: "-30%", gdx: "-10px", gdy: "-26px", gdelay: "0ms" },
  { gx: "-10%", gdx: "6px", gdy: "-34px", gdelay: "90ms" },
  { gx: "8%", gdx: "-5px", gdy: "-28px", gdelay: "40ms" },
  { gx: "24%", gdx: "10px", gdy: "-38px", gdelay: "130ms" },
  { gx: "38%", gdx: "-7px", gdy: "-22px", gdelay: "70ms" },
];

// A borderless piece of jewelry standing in space: the exact product artwork, a soft contact shadow
// that belongs to the jewelry alone, and the family's hover motion. It reacts when it, or any
// ancestor marked `data-object-host`, is hovered or focused. Nothing moves constantly except a slow drift.
export function FloatingObject({
  product,
  formId,
  depth = 1,
  drift = true,
  delay = 0,
  reflection = false,
}: {
  product: Product;
  formId?: string;
  /** 0 far, 2 near: used by cursor depth. */
  depth?: number;
  drift?: boolean;
  delay?: number;
  /** A faint mirrored copy under the piece, as on a polished surface. For a hero shot only. */
  reflection?: boolean;
}) {
  const form = formOf(product, formId);
  const motion = motionOf(product, form.id);
  const parts = resolveComponents(product, { side: "left", tweaks: {}, formId: form.id });
  const stone = parts.find((c) => STONES.has(c.art)) ?? parts[0];
  // The polished surface lies just under the lowest piece, so the mirror line is there, not at the box edge.
  const mirror = Math.max(...parts.map((c) => c.topPct + c.widthPct * 0.42));
  return (
    <span className="fo" data-motion={motion} data-depth={depth} style={{ "--depth": depth, "--fo-delay": `${delay}s` } as React.CSSProperties}>
      <span className={`fo-drift ${drift ? "fo-drifting" : ""}`}>
        <span className="fo-art">
          {reflection && (
            <span aria-hidden="true" className="fo-reflection" style={{ "--mirror": `${mirror}%` } as React.CSSProperties}>
              <FormVisual product={product} formId={form.id} />
            </span>
          )}
          <span className="fo-shadow">
            <FormVisual key={form.id} product={product} formId={form.id} />
          </span>
          {(motion === "blade" || motion === "sweep" || motion === "pendulum" || motion === "edge") && <span aria-hidden="true" className="fo-blade" />}
          {motion === "eye" && <span aria-hidden="true" className="fo-trace" />}
          {stone && motion !== "blade" && motion !== "sweep" && motion !== "pendulum" && motion !== "edge" && <span aria-hidden="true" className="fo-glint" style={{ left: `${stone.leftPct - stone.widthPct * 0.14}%`, top: `${stone.topPct - stone.widthPct * 0.16}%` }} />}
          {motion === "sand" &&
            GRAINS.map((g, i) => <span key={i} aria-hidden="true" className="fo-grain" style={{ "--gx": g.gx, "--gdx": g.gdx, "--gdy": g.gdy, "--gdelay": g.gdelay } as React.CSSProperties} />)}
        </span>
      </span>
    </span>
  );
}
