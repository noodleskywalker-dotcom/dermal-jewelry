import type { Metadata } from "next";
import Image from "next/image";
import { CommissionForm } from "@/components/commission/CommissionForm";
import { catalog } from "@/lib/catalog";
import "./commission.css";

export const metadata: Metadata = {
  title: "Commission a piece",
  description: "Send DERMAL an idea, symbol, sketch or reference, and where you want to wear it.",
};

// A commission request: the idea, where it is worn, and the references, sent to the studio by email.
// It is a request and never an order: nothing is priced, reserved or charged here.
export default function CommissionPage() {
  const render = catalog.getProduct("horus-trace")?.render;
  const image = render?.hero ?? { src: "/products/horus-trace/hero.webp", width: 1448, height: 1086 };
  const photographic = render?.presentation === "photographic";
  return (
    <div className="commission commission-atelier">
      <section className="commission-hero" aria-labelledby="commission-heading">
        <div className="commission-hero-copy">
          <p className="label-xs commission-eyebrow"><span aria-hidden="true">✦</span> The personal collection</p>
          <h1 id="commission-heading" className="commission-title">
            Commission
            <br />a piece
          </h1>
          <p className="commission-lede">Your idea. Made for the face.</p>
          <p className="commission-intro">A symbol. An initial. A shape only you could imagine. Send us your idea and the place you want to wear it. We will explore what it can become.</p>
          <a href="#request" className="btn-solid mt-10" data-testid="start-request">
            Start your request <span aria-hidden="true">↗</span>
          </a>
        </div>
        <figure className="commission-hero-figure" data-presentation={render?.presentation}>
          <div className="commission-image-stage" style={photographic ? { minHeight: 0 } : undefined}>
            {!photographic && <span className="commission-image-index label-xs" aria-hidden="true">A study in expression / 01</span>}
            {/* This existing design is inspiration, not a claim of a completed client commission. */}
            <Image src={image.src} width={image.width} height={image.height} sizes="(max-width: 899px) 100vw, 55vw" alt={render?.alt ?? "Horus Trace design study in sculptural eye geometry"} className="commission-hero-image" style={photographic ? { width: "100%", maxWidth: "100%", marginLeft: 0, filter: "none", mixBlendMode: "normal" } : undefined} preload />
            {!photographic && <span className="commission-image-word" aria-hidden="true">Yours.</span>}
          </div>
          <figcaption><span>HORUS TRACE / Design study</span><span>Render · specification pending</span></figcaption>
        </figure>
      </section>

      <section id="request" className="commission-body" aria-label="Your request">
        <aside className="commission-process">
          <p className="label-xs text-garnet">A conversation, then a creation</p>
          <h2>Begin with<br /><em>an idea.</em></h2>
          <ol className="commission-steps" aria-label="How a commission works">
          <li>
            <span className="label-xs text-garnet">01</span>
            <div><h3>Share your vision</h3><p>A sketch, a reference or just a few words. Tell us where you imagine wearing it.</p></div>
          </li>
          <li>
            <span className="label-xs text-garnet">02</span>
            <div><h3>Explore the possibilities</h3><p>We review the design, placement and production feasibility.</p></div>
          </li>
          <li>
            <span className="label-xs text-garnet">03</span>
            <div><h3>Make it personal</h3><p>We reply with a quote and next steps. Nothing is made until you agree.</p></div>
          </li>
          </ol>
          <p className="commission-process-note">A request begins the conversation. There is no payment or commitment at this stage.</p>
        </aside>
        <CommissionForm />
      </section>
    </div>
  );
}
