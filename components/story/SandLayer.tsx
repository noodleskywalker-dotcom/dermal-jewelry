// The DESERT EYE collection layer, and only that: a very restrained pale sand patch and a few drifting
// grains. It is never used for the brand as a whole, and original collections never get it.
const DRIFT = [
  { x: "12%", y: "38%", s: 3, d: "0s", t: "13s" },
  { x: "31%", y: "64%", s: 2, d: "-4s", t: "17s" },
  { x: "48%", y: "30%", s: 2, d: "-9s", t: "15s" },
  { x: "63%", y: "58%", s: 3, d: "-2s", t: "19s" },
  { x: "78%", y: "42%", s: 2, d: "-7s", t: "14s" },
  { x: "90%", y: "70%", s: 2, d: "-11s", t: "18s" },
];

export function SandLayer({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" data-testid="sand-layer" className={`sand-layer ${className ?? ""}`}>
      <span className="sand-patch" />
      {DRIFT.map((g, i) => (
        <span key={i} className="sand-drift" style={{ left: g.x, top: g.y, width: g.s, height: g.s, animationDelay: g.d, animationDuration: g.t }} />
      ))}
    </span>
  );
}
