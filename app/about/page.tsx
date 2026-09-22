import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "About" };

const ORBIT = "/media/hero-orbit/desert-eye-love";

// A brand editorial page: the piece large, a few lines, the privacy facts. No founder story.
export default function AboutPage() {
  return (
    <div className="about">
      <section className="about-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${ORBIT}/f-036.jpg`} alt="" aria-hidden="true" decoding="async" className="about-media" />
        <div className="about-copy">
          <p className="label-xs">{site.brand}</p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,5.6vw,6rem)] font-light uppercase leading-[0.96] tracking-[0.04em]">
            Small pieces.
            <br />
            Chosen placement.
          </h1>
        </div>
      </section>

      <section className="about-lines">
        <p className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-light leading-[1.3]">
          Facial jewelry, seen on your own face before you choose it.
          <br />
          Original designs beside anime-inspired ones. Never an official collaboration.
        </p>
        <Link href="/face-studio" className="text-link mt-10">
          Enter Face Studio <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <section id="privacy" aria-labelledby="privacy-heading" className="about-facts">
        <h2 id="privacy-heading" className="label-xs">Your photo</h2>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ash">
          <li>Opened by your browser and kept in this tab&rsquo;s memory only.</li>
          <li>Never uploaded, saved by us, sent to analytics or put in a link.</li>
          <li>Clear photo removes it everywhere. A reload removes it too.</li>
          <li>The preview is flat and approximate: not a size, not a fitting, not piercing advice.</li>
        </ul>
        <h2 className="label-xs mt-12">Where things stand</h2>
        <p className="mt-4 text-sm leading-relaxed text-ash">A preview. Demo prices. Prototype specifications; final production details pending. Nothing can be ordered yet.</p>
      </section>
    </div>
  );
}
