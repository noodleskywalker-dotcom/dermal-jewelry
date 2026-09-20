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

const ART: Record<ArtId, (props: { id: string }) => React.ReactNode> = {
  "love-symbol": LoveSymbol,
  "garnet-gem": GarnetGem,
  vortex: Vortex,
  "vortex-stud": VortexStud,
  orbit: Orbit,
  void: VoidTop,
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
