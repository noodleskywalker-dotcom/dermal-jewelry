// 04: MATERIAL / SURFACE DETAIL. Three close crops of the piece from the approved orbit's front
// frame, with the smallest labels only. They are enlarged crops of a prototype render, not
// photographs, and say so. The macro fly-through (MEDIA 02) replaces them when it exists.
const DETAILS = [
  { id: "gemstone", label: "Gemstone", note: "Deep-red faceted gemstone — Material not yet confirmed", x: "21%", y: "56%", zoom: 340 },
  { id: "metal", label: "Metal", note: "Titanium — Proposed · Polished finish — Proposed", x: "40%", y: "74%", zoom: 320 },
  { id: "symbol", label: "Symbol", note: "Hollow red-faced openwork symbol, polished edges", x: "66%", y: "42%", zoom: 260 },
];

export function MaterialDetail({ frame }: { frame: string }) {
  return (
    <section aria-labelledby="detail-heading" data-testid="detail-section" className="mx-auto max-w-[120rem] px-6 py-20 sm:px-10 lg:px-16 lg:py-32">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <p className="label-xs">03 / MATERIAL</p>
        <p className="label-xs text-ash">Prototype render, enlarged · not a size</p>
      </div>
      <h2 id="detail-heading" className="sr-only">Material and surface detail</h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-3 lg:gap-10">
        {DETAILS.map((d) => (
          <li key={d.id} data-testid="detail-crop" data-detail={d.id}>
            {/* The point of interest on the frame is brought to the same point of the crop, at the crop's enlargement. */}
            <div role="img" aria-label={`${d.label}, close`} className="detail-frame" style={{ backgroundImage: `url(${frame})`, backgroundSize: `${d.zoom}%`, backgroundPosition: `${d.x} ${d.y}` }} />
            <p className="label-xs mt-4">{d.label}</p>
            <p className="label-xs mt-1 text-ash">{d.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
