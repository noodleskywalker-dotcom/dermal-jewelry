// 04: MACRO DETAIL. Full-width close views of the piece, composed from the strongest existing
// media (the approved orbit's stills), with four tiny callouts and nothing more. Enlarged crops of a
// prototype render, not photographs; the macro fly-through (MEDIA 02) replaces them when it exists.
const VIEWS = [
  { id: "facet", label: "Facet", frame: 1, x: "20%", y: "58%", size: 150, span: "wide" },
  { id: "openwork", label: "Openwork", frame: 1, x: "68%", y: "40%", size: 170, span: "half" },
  { id: "edge", label: "Polished edge", frame: 22, x: "52%", y: "54%", size: 170, span: "half" },
  { id: "surface", label: "Surface form", frame: 60, x: "48%", y: "62%", size: 130, span: "wide" },
] as const;

export function MacroDetail({ dir }: { dir: string }) {
  return (
    <section aria-labelledby="macro-heading" data-testid="detail-section" className="macro">
      <h2 id="macro-heading" className="sr-only">Macro detail</h2>
      <p className="macro-note label-xs text-ash">03 / DETAIL · prototype render, enlarged · not a size</p>
      {VIEWS.map((v) => (
        <figure key={v.id} data-testid="detail-crop" data-detail={v.id} className={`macro-view macro-view-${v.span}`}>
          <div role="img" aria-label={`${v.label}, close`} className="macro-media" style={{ backgroundImage: `url(${dir}/f-${String(v.frame).padStart(3, "0")}.jpg)`, backgroundSize: `${v.size}%`, backgroundPosition: `${v.x} ${v.y}` }} />
          <figcaption className="macro-callout label-xs">{v.label}</figcaption>
        </figure>
      ))}
    </section>
  );
}
