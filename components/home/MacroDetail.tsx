// The close views, from the 4k piece (an upscale of the exact approved frame). Each crop stays at or
// under the source's own resolution, so the metal and the facets stay sharp. Four tiny callouts only.
const VIEWS = [
  { id: "facet", label: "Facet", x: "20%", y: "54%", size: 250, span: "half" },
  { id: "openwork", label: "Openwork", x: "68%", y: "38%", size: 230, span: "half" },
  { id: "edge", label: "Polished edge", x: "42%", y: "86%", size: 260, span: "half" },
  { id: "surface", label: "Surface form", x: "74%", y: "60%", size: 230, span: "half" },
] as const;

export function MacroDetail({ src }: { src: string }) {
  return (
    <section aria-labelledby="macro-detail-heading" data-testid="detail-section" className="macro">
      <h2 id="macro-detail-heading" className="sr-only">Close views</h2>
      {VIEWS.map((v) => (
        <figure key={v.id} data-testid="detail-crop" data-detail={v.id} className={`macro-view macro-view-${v.span}`}>
          <div role="img" aria-label={`${v.label}, close`} className="macro-media" style={{ backgroundImage: `url(${src})`, backgroundSize: `${v.size}%`, backgroundPosition: `${v.x} ${v.y}` }} />
          <figcaption className="macro-callout label-xs">{v.label}</figcaption>
        </figure>
      ))}
      <p className="macro-note label-xs text-ash">Prototype render, enlarged · not a size</p>
    </section>
  );
}
