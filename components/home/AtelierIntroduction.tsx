import Image from "next/image";
import Link from "next/link";
import { catalog } from "@/lib/catalog";

export function AtelierIntroduction() {
  const render = catalog.getProduct("ankh-eye")?.render;
  const image = render?.hero ?? { src: "/products/ankh-eye/hero.webp", width: 1448, height: 1086 };
  const photographic = render?.presentation === "photographic";
  return (
    <section className="atelier-introduction" aria-labelledby="atelier-heading" data-testid="home-commission">
      <div className="atelier-copy">
        <p className="label-xs">06 / The custom atelier</p>
        <h2 id="atelier-heading">Your idea.<br /><em>Made for the face.</em></h2>
        <p>A symbol only you understand. A line from a sketch. Something that does not exist yet.</p>
        <p>Share your idea and where you want to wear it. We review what is possible and prepare a quote.</p>
        <Link href="/commission" className="text-link" data-testid="home-commission-link">Commission a piece <span aria-hidden="true">↗</span></Link>
        <ol className="atelier-process" aria-label="Commission process"><li><span>01</span> Your idea</li><li><span>02</span> Design review</li><li><span>03</span> Your quote</li></ol>
      </div>
      <figure className="atelier-study" data-presentation={render?.presentation} style={photographic ? { minHeight: 0, aspectRatio: "auto" } : undefined}>
        <Image src={image.src} width={image.width} height={image.height} alt={render?.alt ?? "Ankh and eye concept, an example of sculptural facial jewelry design"} sizes="(max-width: 760px) 100vw, 50vw" style={photographic ? { display: "block", width: "100%", height: "auto", padding: 0, filter: "none", mixBlendMode: "normal" } : undefined} />
        <figcaption style={photographic ? { position: "static", marginTop: "1rem" } : undefined}><span className="label-xs">From symbol to object</span><span>ANKH + EYE · Concept render</span></figcaption>
      </figure>
    </section>
  );
}
