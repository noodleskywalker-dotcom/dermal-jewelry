import Image from "next/image";
import Link from "next/link";

export function AtelierIntroduction() {
  return (
    <section className="atelier-introduction" aria-labelledby="atelier-heading" data-testid="home-commission">
      <div className="atelier-copy">
        <p className="label-xs">05 / The custom atelier</p>
        <h2 id="atelier-heading">Your idea.<br /><em>Made for the face.</em></h2>
        <p>A symbol only you understand. A line from a sketch. Something that does not exist yet.</p>
        <p>Share your idea and where you want to wear it. We review what is possible and prepare a quote.</p>
        <Link href="/commission" className="text-link" data-testid="home-commission-link">Commission a piece <span aria-hidden="true">↗</span></Link>
        <ol className="atelier-process" aria-label="Commission process"><li><span>01</span> Your idea</li><li><span>02</span> Design review</li><li><span>03</span> Your quote</li></ol>
      </div>
      <figure className="atelier-study">
        <Image src="/products/ankh-eye/hero.webp" alt="Ankh and eye concept, an example of sculptural facial jewelry design" fill sizes="(max-width: 760px) 100vw, 50vw" />
        <figcaption><span className="label-xs">From symbol to object</span><span>ANKH + EYE · Concept render</span></figcaption>
      </figure>
    </section>
  );
}
