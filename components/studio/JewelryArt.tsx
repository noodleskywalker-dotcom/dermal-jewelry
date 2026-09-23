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

// ANKH TRACE, from the owner's worn reference of 22 September 2026: a slim ankh with an open loop,
// a narrow crossbar and a tapered stem. Proportions follow that photograph, not a drawing standard.
const ANKH_PATH =
  "M500 80 C 392 80 322 168 322 262 C 322 338 372 392 438 418 L 300 418 L 300 508 L 438 508 L 438 920 L 562 920 L 562 508 L 700 508 L 700 418 L 562 418 C 628 392 678 338 678 262 C 678 168 608 80 500 80 Z M500 176 C 556 176 596 214 596 264 C 596 314 556 352 500 352 C 444 352 404 314 404 264 C 404 214 444 176 500 176 Z";

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

/**
 * HORUS TRACE, drawn from the owner's reference of 22 September 2026 (an internal render, not CAD):
 * one curved surface bar with a ball at each end, the eye of Horus in polished linework beneath it,
 * a dark faceted stone at its centre, the spiral curl falling from the inner corner and the pointed
 * drop below. It is the whole piece, hardware included, because that is how the piece is worn.
 * Proportions are read off the reference; no dimension here is a measurement.
 */
function HorusPiece({ id }: { id: string }) {
  const metal = `url(#${id}-metal)`;
  const BAR = "M120 372 C 330 214, 660 196, 878 318";
  const LID_TOP = "M370 470 C 520 372, 700 366, 862 330";
  const LID_LOW = "M370 470 C 470 556, 610 580, 742 534";
  const CURL = "M372 474 C 292 556, 250 646, 292 680 C 336 712, 392 668, 368 620 C 350 584, 302 588, 296 626";
  const DROP = "M676 492 L 752 500 L 724 736 Z";
  const stroke = (d: string, w: number, color: string, dx = 0, dy = 0) => (
    <path d={d} transform={dx || dy ? `translate(${dx} ${dy})` : undefined} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  );
  return (
    <>
      {/* The piece's own soft contact shadow, so it sits on a surface rather than floating. */}
      <g transform="translate(16 26)" opacity="0.32">
        {stroke(BAR, 52, "#000")}
        {stroke(LID_TOP, 44, "#000")}
        {stroke(LID_LOW, 40, "#000")}
        {stroke(CURL, 36, "#000")}
        <path d={DROP} fill="#000" />
        <circle cx="120" cy="372" r="86" fill="#000" />
        <circle cx="886" cy="316" r="78" fill="#000" />
      </g>
      {stroke(BAR, 48, metal)}
      {stroke(LID_TOP, 40, metal)}
      {stroke(LID_LOW, 36, metal)}
      {stroke(CURL, 32, metal)}
      {/* The pointed drop: polished metal with a dark face, as in the reference. */}
      <path d={DROP} fill={metal} stroke="rgba(0,0,0,0.3)" strokeWidth="6" />
      <path d="M688 502 L 736 507 L 718 686 Z" fill={`url(#${id}-darkstone)`} />
      {/* The stone, in its rim, at the centre of the eye. */}
      <circle cx="612" cy="452" r="92" fill={metal} />
      <circle cx="612" cy="452" r="74" fill={`url(#${id}-darkstone)`} />
      {Array.from({ length: 8 }, (_, i) => {
        const a0 = (i * Math.PI) / 4;
        const a1 = ((i + 1) * Math.PI) / 4;
        const pt = (a: number, r: number) => `${(612 + Math.cos(a) * r).toFixed(1)},${(452 + Math.sin(a) * r).toFixed(1)}`;
        return <polygon key={i} points={`${pt(a0, 74)} ${pt(a1, 74)} ${pt((a0 + a1) / 2, 32)}`} fill={i % 2 === 0 ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.3)"} />;
      })}
      <ellipse cx="584" cy="424" rx="22" ry="13" fill="rgba(255,255,255,0.5)" transform="rotate(-30 584 424)" />
      {/* The two balls of the surface bar. */}
      {[
        { x: 120, y: 372, r: 84 },
        { x: 886, y: 316, r: 76 },
      ].map((b) => (
        <g key={b.x}>
          <circle cx={b.x} cy={b.y} r={b.r} fill={metal} />
          <ellipse cx={b.x - b.r * 0.32} cy={b.y - b.r * 0.36} rx={b.r * 0.3} ry={b.r * 0.19} fill="rgba(255,255,255,0.65)" transform={`rotate(-35 ${b.x - b.r * 0.32} ${b.y - b.r * 0.36})`} />
        </g>
      ))}
      {/* One thin highlight along the bar, the way polished metal takes a light. */}
      {stroke(BAR, 7, "rgba(255,255,255,0.55)", 0, -12)}
      {stroke(LID_TOP, 5, "rgba(255,255,255,0.45)", 0, -9)}
    </>
  );
}

/** The eye alone, without the bar: for the small views where the hardware would be lost. */
function HorusEye({ id }: { id: string }) {
  const metal = `url(#${id}-metal)`;
  const LID_TOP = "M180 470 C 380 300, 700 290, 900 400";
  const LID_LOW = "M180 470 C 330 610, 640 640, 842 470";
  const CURL = "M184 476 C 110 570, 82 660, 118 690 C 152 718, 196 684, 178 642";
  const stroke = (d: string, w: number, color: string, dx = 0, dy = 0) => (
    <path d={d} transform={dx || dy ? `translate(${dx} ${dy})` : undefined} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  );
  return (
    <>
      <g transform="translate(16 26)" opacity="0.3">
        {stroke(LID_TOP, 54, "#000")}
        {stroke(LID_LOW, 48, "#000")}
        {stroke(CURL, 44, "#000")}
      </g>
      {stroke(LID_TOP, 50, metal)}
      {stroke(LID_LOW, 44, metal)}
      {stroke(CURL, 40, metal)}
      <path d="M630 500 L 726 506 L 680 800 Z" fill={metal} stroke="rgba(0,0,0,0.3)" strokeWidth="6" />
      <circle cx="512" cy="470" r="124" fill={metal} />
      <circle cx="512" cy="470" r="100" fill={`url(#${id}-darkstone)`} />
      <ellipse cx="474" cy="432" rx="30" ry="17" fill="rgba(255,255,255,0.5)" transform="rotate(-30 474 432)" />
      {stroke(LID_TOP, 7, "rgba(255,255,255,0.5)", 0, -14)}
    </>
  );
}

/**
 * BLADE TRACE, drawn from the owner's worn reference of 22 September 2026: a long tapered blade with
 * a centre ridge, a short ribbed grip and an open ring at the end, worn on a diagonal. Proportions
 * follow that photograph. It is jewelry shaped by blade geometry, kept small and plain.
 */
function BladeTrace({ id }: { id: string }) {
  const metal = `url(#${id}-metal)`;
  const UPPER = "M70 470 L 610 396 L 636 486 Z";
  const LOWER = "M70 470 L 636 486 L 606 580 Z";
  const ribs = Array.from({ length: 5 }, (_, i) => 690 + i * 34);
  return (
    <>
      {/* Contact shadow: the piece lies on a surface, it does not float. */}
      <g transform="translate(14 22)" opacity="0.3">
        <path d={UPPER} fill="#000" />
        <path d={LOWER} fill="#000" />
        <rect x="640" y="452" width="230" height="76" rx="30" fill="#000" />
        <circle cx="905" cy="492" r="66" fill="none" stroke="#000" strokeWidth="30" />
      </g>
      {/* The blade: two facets either side of the centre ridge. */}
      <path d={UPPER} fill={metal} />
      <path d={LOWER} fill={metal} opacity="0.82" />
      <path d="M70 470 L 636 486" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="6" strokeLinecap="round" />
      <path d="M150 462 L 596 408" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="9" strokeLinecap="round" />
      {/* The shoulder, then the short ribbed grip. */}
      <path d="M606 580 L 636 486 L 610 396 L 664 412 L 686 486 L 664 566 Z" fill={metal} stroke="rgba(0,0,0,0.28)" strokeWidth="5" />
      <rect x="664" y="452" width="206" height="72" rx="30" fill={metal} stroke="rgba(0,0,0,0.25)" strokeWidth="5" />
      {ribs.map((x) => (
        <rect key={x} x={x} y="456" width="12" height="64" rx="6" fill="rgba(0,0,0,0.32)" />
      ))}
      <rect x="678" y="466" width="176" height="10" rx="5" fill="rgba(255,255,255,0.45)" />
      {/* The open ring at the end. */}
      <circle cx="905" cy="492" r="66" fill="none" stroke={metal} strokeWidth="30" />
      <path d="M862 452 A 60 60 0 0 1 916 432" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="8" strokeLinecap="round" />
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
  "horus-piece": HorusPiece,
  "horus-eye": HorusEye,
  "dark-gem": DarkGem,
  blade: BladeTrace,
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
