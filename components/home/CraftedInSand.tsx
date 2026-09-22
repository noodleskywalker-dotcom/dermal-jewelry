import Link from "next/link";
import type { MascotMedia } from "@/lib/story/registry";
import { Mascot } from "./Mascot";
import { SandLayer } from "@/components/story/SandLayer";

// 03: CRAFTED IN SAND. The media takes the whole viewport, sand-toned, then the interface returns
// to ivory. Three words, nothing else. The still is the sand vortex of the approved product
// animation; it stands in for the macro fly-through (MEDIA 02) until that clip exists. The small
// companion, internal concept art, rests in this environment and nowhere else on the page.
export function CraftedInSand({ still, href, mascot }: { still: string; href: string; mascot: MascotMedia | null }) {
  return (
    <section aria-labelledby="sand-heading" data-testid="story-section" className="sand-section">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={still} alt="" aria-hidden="true" loading="lazy" decoding="async" className="sand-media" />
      <SandLayer className="sand-section-grains" />
      <div className="sand-copy">
        <p className="label-xs">02 / DESERT EYE</p>
        <h2 id="sand-heading" className="mt-3 font-display text-[clamp(2.25rem,5vw,4.75rem)] font-light uppercase leading-none tracking-[0.06em]">
          Crafted in sand
        </h2>
        <p className="story-words mt-8 font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-light leading-[1.25]">
          <span>Sand.</span>
          <br />
          <span>Solitude.</span>
          <br />
          <span>Identity.</span>
        </p>
        <Link href={href} className="text-link mt-8">
          View DESERT EYE <span aria-hidden="true">↗</span>
        </Link>
      </div>
      {mascot && (
        <div className="sand-mascot">
          <Mascot media={mascot} href="/collections?family=desert-eye-love" label="Wake him and open DESERT EYE" />
        </div>
      )}
    </section>
  );
}
