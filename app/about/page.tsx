import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./about.css";

export const metadata: Metadata = {
  title: "About DERMAL",
  description: "Unconventional facial jewelry. Original designs, symbolic forms and personal commissions, considered around placement and expression.",
};

// A brand editorial page: the piece large, a few lines, the privacy facts. No founder story.
export default function AboutPage() {
  return (
    <div className="dermal-about">
      <section className="dermal-about-intro" aria-labelledby="about-heading">
        <p className="label-xs text-garnet">The DERMAL point of view</p>
        <h1 id="about-heading">Small pieces.<br /><em>A different presence.</em></h1>
        <div className="dermal-about-opening">
          <p className="label-xs">Designed for expression</p>
          <p>DERMAL creates unconventional facial jewelry and custom commissions. Objects that become personal through the way you wear them.</p>
        </div>
      </section>

      <section className="dermal-about-object" aria-label="An exploration of symbolic form">
        <div className="dermal-about-object-text"><span className="label-xs">An exploration of form / 01</span><p>A line.<br />A symbol.<br /><em>A point of view.</em></p></div>
        <figure>
          <Image src="/products/ankh-eye/hero.webp" width={1448} height={1086} sizes="(max-width: 800px) 100vw, 65vw" alt="Ankh and eye geometry joined in one sculptural jewelry design" preload />
          <figcaption className="label-xs">ANKH + EYE · concept render · specification pending</figcaption>
        </figure>
      </section>

      <section className="dermal-about-principles" aria-label="Our approach">
        <article><span className="label-xs text-garnet">01 / Design</span><h2>Beyond the familiar.</h2><p>Minimal lines sit alongside symbolic and sculptural forms. Each collection has its own identity, held together by an interest in the unexpected.</p><Link href="/collections" className="text-link">Discover the collections <span aria-hidden="true">↗</span></Link></article>
        <article><span className="label-xs text-garnet">02 / Placement</span><h2>Considered on you.</h2><p>Placement changes the way a piece is seen. Face Studio offers an approximate visual study on your own photo, before you choose a direction.</p><Link href="/face-studio" className="text-link">Enter Face Studio <span aria-hidden="true">↗</span></Link></article>
        <article><span className="label-xs text-garnet">03 / Commission</span><h2>A personal beginning.</h2><p>An initial, a shape, a sketch. Share your idea and where you want to wear it. We review feasibility before discussing a quote or production.</p><Link href="/commission" className="text-link">Commission a piece <span aria-hidden="true">↗</span></Link></article>
      </section>

      <section id="privacy" aria-labelledby="privacy-heading" className="dermal-about-privacy">
        <div><p className="label-xs text-garnet">Face Studio / Privacy</p><h2 id="privacy-heading">Your photo.<br /><em>Your device.</em></h2></div>
        <div className="dermal-about-facts">
          <p className="dermal-about-privacy-lede">Your Face Studio photo stays on this device.</p>
          <ul>
            <li>Opened by your browser and kept in this tab&rsquo;s memory only.</li>
            <li>Never uploaded, saved by us, sent to analytics or put in a link.</li>
            <li>Clear photo removes it everywhere. A reload removes it too.</li>
            <li>The preview is flat and approximate: not a size, not a fitting, not piercing advice.</li>
          </ul>
          <p className="dermal-about-status">Collection imagery includes design and concept renders. Production specifications and availability are stated on each piece. Checkout remains closed until the collection is ready.</p>
          <p className="dermal-about-status">References submitted with a commission request are sent to the studio for review when you press Send request. This is separate from Face Studio.</p>
        </div>
      </section>
    </div>
  );
}
