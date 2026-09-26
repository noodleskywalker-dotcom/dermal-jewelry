import type { Metadata } from "next";
import { CommissionForm } from "@/components/commission/CommissionForm";

export const metadata: Metadata = {
  title: "Commission a piece",
  description: "Send DERMAL an idea, symbol, sketch or reference, and where you want to wear it.",
};

// A commission request: the idea, where it is worn, and the references, sent to the studio by email.
// It is a request and never an order: nothing is priced, reserved or charged here.
export default function CommissionPage() {
  return (
    <div className="commission">
      <section className="commission-hero" aria-labelledby="commission-heading">
        <div className="commission-hero-copy">
          <p className="label-xs">Commission</p>
          <h1 id="commission-heading" className="commission-title">
            Commission
            <br />a piece
          </h1>
          <p className="commission-lede">Your idea. Made for the face.</p>
          <p className="commission-intro">
            Send us an idea, symbol, sketch, reference or existing design. Tell us where you want to wear it and what you want it to become.
          </p>
          <a href="#request" className="btn-solid mt-10" data-testid="start-request">
            Start your request
          </a>
        </div>
        <figure className="commission-hero-figure">
          {/* An existing DERMAL design render, as a mood for the page. It is not a past commission. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/products/japanese-angel/detail.webp" width={590} height={470} alt="" decoding="async" className="commission-hero-image" />
          <figcaption className="label-xs text-ash">Design render · JAPANESE ANGEL</figcaption>
        </figure>
      </section>

      <section id="request" className="commission-body" aria-label="Your request">
        <ol className="commission-steps" aria-label="How a commission works">
          <li>
            <span className="label-xs text-garnet">01</span>
            <p>You send the idea and your references.</p>
          </li>
          <li>
            <span className="label-xs text-garnet">02</span>
            <p>We review the design, the placement and whether it can be made.</p>
          </li>
          <li>
            <span className="label-xs text-garnet">03</span>
            <p>We reply with a quote and next steps. Nothing is made until you agree.</p>
          </li>
        </ol>
        <CommissionForm />
      </section>
    </div>
  );
}
