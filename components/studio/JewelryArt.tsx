import { useId } from "react";
import type { ArtId } from "@/lib/catalog/types";
import { LOVE_GLYPH_PATH } from "@/lib/studio/love-glyph";

// Original concept-placeholder artwork. It interprets the approved appearance for local review and
// is not product photography, CAD or a dimensional drawing.

function MetalDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f6f7f9" />
        <stop offset="0.35" stopColor="#aeb4bd" />
        <stop offset="0.6" stopColor="#e9ecef" />
        <stop offset="1" stopColor="#6d737c" />
      </linearGradient>
      <radialGradient id={`${id}-garnet`} cx="0.38" cy="0.32" r="0.8">
        <stop offset="0" stopColor="#e0445c" />
        <stop offset="0.45" stopColor="#8f2337" />
        <stop offset="1" stopColor="#3d0c17" />
      </radialGradient>
      <radialGradient id={`${id}-void`} cx="0.4" cy="0.35" r="0.8">
        <stop offset="0" stopColor="#2b2b30" />
        <stop offset="1" stopColor="#050506" />
      </radialGradient>
      <radialGradient id={`${id}-darkstone`} cx="0.38" cy="0.3" r="0.85">
        <stop offset="0" stopColor="#4a4550" />
        <stop offset="0.5" stopColor="#1d1a22" />
        <stop offset="1" stopColor="#08070a" />
      </radialGradient>
    </defs>
  );
}

function LoveSymbol({ id }: { id: string }) {
  return (
    <>
      {/* Soft contact shadow so the piece sits on skin rather than floating. */}
      <path d={LOVE_GLYPH_PATH} transform="translate(14 22)" fill="rgba(0,0,0,0.35)" />
      <path
        d={LOVE_GLYPH_PATH}
        fill={`url(#${id}-garnet)`}
        stroke={`url(#${id}-metal)`}
        strokeWidth="26"
        strokeLinejoin="round"
        paintOrder="stroke"
      />
      <path d={LOVE_GLYPH_PATH} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="4" />
    </>
  );
}

function FacetedGem({ id, r = 330 }: { id: string; r?: number }) {
  const facets = Array.from({ length: 8 }, (_, i) => {
    const a0 = (i * Math.PI) / 4;
    const a1 = ((i + 1) * Math.PI) / 4;
    const p = (a: number, rad: number) => `${(500 + Math.cos(a) * rad).toFixed(1)},${(500 + Math.sin(a) * rad).toFixed(1)}`;
    return (
      <polygon
        key={i}
        points={`${p(a0, r)} ${p(a1, r)} ${p((a0 + a1) / 2, r * 0.45)}`}
        fill={i % 2 === 0 ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.18)"}
      />
    );
  });
  return (
    <>
      <circle cx="500" cy="500" r={r} fill={`url(#${id}-garnet)`} />
      {facets}
      <polygon
        points={Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4 + Math.PI / 8;
          return `${(500 + Math.cos(a) * r * 0.45).toFixed(1)},${(500 + Math.sin(a) * r * 0.45).toFixed(1)}`;
        }).join(" ")}
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="6"
      />
      <ellipse cx="410" cy="395" rx="70" ry="38" fill="rgba(255,255,255,0.45)" transform="rotate(-35 410 395)" />
    </>
  );
}

function GarnetGem({ id }: { id: string }) {
  const prongs = [45, 135, 225, 315].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return (
      <circle
        key={deg}
        cx={500 + Math.cos(a) * 345}
        cy={500 + Math.sin(a) * 345}
        r="78"
        fill={`url(#${id}-metal)`}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="8"
      />
    );
  });
  return (
    <>
      <circle cx="515" cy="525" r="400" fill="rgba(0,0,0,0.3)" />
      <circle cx="500" cy="500" r="385" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="50" />
      <FacetedGem id={id} />
      {prongs}
    </>
  );
}

function Vortex({ id }: { id: string }) {
  // Archimedean spiral, drawn as open metalwork.
  const points: string[] = [];
  for (let t = 0.6; t <= 5.2 * Math.PI; t += 0.12) {
    const rad = 26 * t;
    points.push(`${(500 + Math.cos(t) * rad).toFixed(1)},${(500 + Math.sin(t) * rad).toFixed(1)}`);
  }
  return (
    <>
      <polyline points={points.join(" ")} transform="translate(12 18)" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="70" strokeLinecap="round" />
      <polyline points={points.join(" ")} fill="none" stroke={`url(#${id}-metal)`} strokeWidth="62" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={points.join(" ")} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="8" strokeLinecap="round" />
    </>
  );
}

function VortexStud({ id }: { id: string }) {
  return (
    <>
      <circle cx="515" cy="525" r="400" fill="rgba(0,0,0,0.3)" />
      <circle cx="500" cy="500" r="400" fill={`url(#${id}-metal)`} />
      <ellipse cx="400" cy="380" rx="120" ry="60" fill="rgba(255,255,255,0.6)" transform="rotate(-35 400 380)" />
    </>
  );
}

function Orbit({ id }: { id: string }) {
  return (
    <>
      <circle cx="512" cy="520" r="430" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="60" />
      <circle cx="500" cy="500" r="430" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="54" />
      <FacetedGem id={id} r={240} />
    </>
  );
}

function VoidTop({ id }: { id: string }) {
  return (
    <>
      <circle cx="515" cy="525" r="440" fill="rgba(0,0,0,0.3)" />
      <circle cx="500" cy="500" r="440" fill={`url(#${id}-metal)`} />
      <circle cx="500" cy="500" r="350" fill={`url(#${id}-void)`} />
      <path d="M250 400 A270 270 0 0 1 480 232" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="18" strokeLinecap="round" />
    </>
  );
}


// CROSSLINE, ANKH TRACE and HORUS TRACE (23 September 2026). Original concept-placeholder artwork
// drawn from the owner's written description of each piece. No reference photograph was on this
// machine when these were drawn, so they interpret the idea and are not the product's geometry.

/** A polished bar with rounded ends: the line of CROSSLINE. Drawn as a shape, never a stroked line:
 * a gradient has no height to fill on a flat line, and the metal would come out grey. */
function CrossLine({ id }: { id: string }) {
  const bar = (dx: number, dy: number, fill: string) => (
    <rect x={130 + dx} y={425 + dy} width="740" height="150" rx="75" fill={fill} />
  );
  return (
    <>
      {bar(14, 22, "rgba(0,0,0,0.32)")}
      {bar(0, 0, `url(#${id}-metal)`)}
      <rect x="180" y="455" width="640" height="16" rx="8" fill="rgba(255,255,255,0.55)" />
    </>
  );
}

/** The small crossing element of CROSSLINE: a short upright over a shorter arm. */
function CrossMark({ id }: { id: string }) {
  const arms = (dx: number, dy: number, fill: string) => (
    <>
      <rect x={435 + dx} y={140 + dy} width="130" height="720" rx="65" fill={fill} />
      <rect x={250 + dx} y={370 + dy} width="500" height="130" rx="65" fill={fill} />
    </>
  );
  return (
    <>
      {arms(14, 22, "rgba(0,0,0,0.32)")}
      {arms(0, 0, `url(#${id}-metal)`)}
      <rect x="468" y="190" width="14" height="620" rx="7" fill="rgba(255,255,255,0.5)" />
    </>
  );
}

const ANKH_PATH =
  "M500 90 C 360 90 300 200 300 290 C 300 372 360 430 430 470 L 240 470 L 240 600 L 430 600 L 430 930 L 570 930 L 570 600 L 760 600 L 760 470 L 570 470 C 640 430 700 372 700 290 C 700 200 640 90 500 90 Z M500 200 C 560 200 590 245 590 295 C 590 345 560 390 500 390 C 440 390 410 345 410 295 C 410 245 440 200 500 200 Z";

/** ANKH TRACE: the symbol as polished metalwork, with the loop left open. */
function Ankh({ id }: { id: string }) {
  return (
    <>
      <path d={ANKH_PATH} transform="translate(14 22)" fill="rgba(0,0,0,0.32)" fillRule="evenodd" />
      <path d={ANKH_PATH} fill={`url(#${id}-metal)`} fillRule="evenodd" stroke="rgba(0,0,0,0.25)" strokeWidth="8" />
      <path d="M430 150 C 360 190 340 250 345 300" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="16" strokeLinecap="round" />
      <line x1="470" y1="640" x2="470" y2="900" stroke="rgba(255,255,255,0.4)" strokeWidth="14" strokeLinecap="round" />
    </>
  );
}

const HORUS_BROW = "M170 430 C 300 300 640 280 820 400";
const HORUS_EYE = "M210 520 C 330 400 650 390 800 500 C 660 620 340 640 210 520 Z";
const HORUS_TAIL = "M800 500 C 860 520 900 560 910 610";
const HORUS_CURL = "M470 640 C 430 760 470 860 600 880 C 520 830 500 760 540 660";

/** HORUS TRACE: an eye-of-horus-inspired openwork frame around a dark stone. */
function HorusEye({ id }: { id: string }) {
  const line = (d: string, stroke: string, width: number, dx = 0, dy = 0) => (
    <path d={d} transform={dx || dy ? `translate(${dx} ${dy})` : undefined} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" />
  );
  return (
    <>
      {line(HORUS_BROW, "rgba(0,0,0,0.3)", 74, 12, 20)}
      {line(HORUS_TAIL, "rgba(0,0,0,0.3)", 74, 12, 20)}
      {line(HORUS_CURL, "rgba(0,0,0,0.3)", 74, 12, 20)}
      <path d={HORUS_EYE} transform="translate(12 20)" fill="rgba(0,0,0,0.3)" />
      <path d={HORUS_EYE} fill={`url(#${id}-darkstone)`} stroke={`url(#${id}-metal)`} strokeWidth="56" strokeLinejoin="round" paintOrder="stroke" />
      {line(HORUS_BROW, `url(#${id}-metal)`, 66)}
      {line(HORUS_TAIL, `url(#${id}-metal)`, 66)}
      {line(HORUS_CURL, `url(#${id}-metal)`, 66)}
      <circle cx="500" cy="510" r="120" fill={`url(#${id}-darkstone)`} stroke={`url(#${id}-metal)`} strokeWidth="26" />
      <ellipse cx="455" cy="470" rx="42" ry="24" fill="rgba(255,255,255,0.5)" transform="rotate(-30 455 470)" />
      {line(HORUS_BROW, "rgba(255,255,255,0.35)", 8)}
    </>
  );
}

/** The lower pointed element of HORUS TRACE, on its own. */
function HorusDrop({ id }: { id: string }) {
  const drop = "M500 120 C 640 380 760 560 760 680 C 760 820 640 900 500 900 C 360 900 240 820 240 680 C 240 560 360 380 500 120 Z";
  return (
    <>
      <path d={drop} transform="translate(14 22)" fill="rgba(0,0,0,0.3)" />
      <path d={drop} fill={`url(#${id}-metal)`} stroke="rgba(0,0,0,0.25)" strokeWidth="8" />
      <path d="M430 300 C 350 450 320 580 340 680" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="18" strokeLinecap="round" />
    </>
  );
}

/** A dark faceted stone, of unconfirmed material, in four prongs. */
function DarkGem({ id }: { id: string }) {
  const prongs = [45, 135, 225, 315].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return <circle key={deg} cx={500 + Math.cos(a) * 345} cy={500 + Math.sin(a) * 345} r="78" fill={`url(#${id}-metal)`} stroke="rgba(0,0,0,0.35)" strokeWidth="8" />;
  });
  const facets = Array.from({ length: 8 }, (_, i) => {
    const a0 = (i * Math.PI) / 4;
    const a1 = ((i + 1) * Math.PI) / 4;
    const p = (a: number, rad: number) => `${(500 + Math.cos(a) * rad).toFixed(1)},${(500 + Math.sin(a) * rad).toFixed(1)}`;
    return <polygon key={i} points={`${p(a0, 330)} ${p(a1, 330)} ${p((a0 + a1) / 2, 148)}`} fill={i % 2 === 0 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.25)"} />;
  });
  return (
    <>
      <circle cx="515" cy="525" r="400" fill="rgba(0,0,0,0.3)" />
      <circle cx="500" cy="500" r="385" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="50" />
      <circle cx="500" cy="500" r="330" fill={`url(#${id}-darkstone)`} />
      {facets}
      <ellipse cx="410" cy="395" rx="70" ry="38" fill="rgba(255,255,255,0.35)" transform="rotate(-35 410 395)" />
      {prongs}
    </>
  );
}

const ART: Record<ArtId, (props: { id: string }) => React.ReactNode> = {
  "love-symbol": LoveSymbol,
  "garnet-gem": GarnetGem,
  vortex: Vortex,
  "vortex-stud": VortexStud,
  orbit: Orbit,
  void: VoidTop,
  "cross-line": CrossLine,
  "cross-mark": CrossMark,
  ankh: Ankh,
  "horus-eye": HorusEye,
  "horus-drop": HorusDrop,
  "dark-gem": DarkGem,
};

export function JewelryArt({ art, className }: { art: ArtId; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const Shape = ART[art];
  return (
    <svg viewBox="-40 -40 1080 1080" className={className} aria-hidden="true" focusable="false" style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}>
      <MetalDefs id={id} />
      <Shape id={id} />
    </svg>
  );
}
