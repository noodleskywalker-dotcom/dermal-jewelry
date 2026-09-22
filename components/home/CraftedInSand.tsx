"use client";

import Link from "next/link";
import type { MascotMedia } from "@/lib/story/registry";
import { useScrollProgress } from "@/lib/motion/useScrollProgress";
import { Mascot } from "./Mascot";
import { SandLayer } from "@/components/story/SandLayer";

// 03: CRAFTED IN SAND. The sand takes the viewport in a slow cinematic push, three words, nothing
// else. The picture is the vortex of the approved product animation, cropped close; it gives way to
// the macro fly-through (MEDIA 02) when that exists. The small companion rests here and only here.
export function CraftedInSand({ still, href, mascot }: { still: string; href: string; mascot: MascotMedia | null }) {
  const section = useScrollProgress<HTMLElement>(true);
  return (
    <section ref={section} aria-labelledby="sand-heading" data-testid="story-section" className="sand">
      <div className="sand-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={still} alt="" aria-hidden="true" loading="lazy" decoding="async" className="sand-media" />
        <SandLayer className="sand-grains" />
      </div>
      <div className="sand-copy">
        <p className="label-xs">02 / DESERT EYE</p>
        <h2 id="sand-heading" className="mt-4 font-display text-[clamp(2.25rem,5vw,5rem)] font-light uppercase leading-[0.98] tracking-[0.06em]">
          Crafted in sand
        </h2>
        <p className="mt-8 font-display text-[clamp(1.5rem,2.2vw,2.25rem)] font-light leading-[1.3]">
          Sand.
          <br />
          Solitude.
          <br />
          Identity.
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
