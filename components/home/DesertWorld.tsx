"use client";

import Link from "next/link";
import {
  useAmbientVideo,
  type VideoSource,
} from "@/lib/motion/useAmbientVideo";
import {
  useReducedMotion,
  useScrollProgress,
} from "@/lib/motion/useScrollProgress";

// 03: the world of the piece, in two movements. First the dunes at golden hour, wind lifting a veil of
// sand, and three words. Then the small reader in his dunes: the companion of the collection, lying
// with his book and his gourd. The picture pushes in slowly as the page passes. Both are generated
// atmosphere (no character motion: the platform does not allow it for this character). The companion
// picture is internal and comes only from a development server; see `internalCompanionStill`.
export function DesertWorld({
  sand,
  poster,
  companion,
}: {
  sand: VideoSource[];
  poster: string;
  companion?: string;
}) {
  const reduced = useReducedMotion();
  const first = useScrollProgress<HTMLElement>(!reduced);
  const second = useScrollProgress<HTMLElement>(!reduced);
  const dunes = useAmbientVideo(sand, !reduced);
  return (
    <>
      <section
        ref={first}
        aria-labelledby="sand-heading"
        data-testid="story-section"
        className="world"
      >
        <div className="world-frame">
          {reduced ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              aria-hidden="true"
              className="world-media"
            />
          ) : (
            <video
              ref={dunes}
              className="world-media"
              poster={poster}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              aria-hidden="true"
            />
          )}
          <div className="world-shade" aria-hidden="true" />
          <div className="world-copy">
            <p className="label-xs">02 / The world</p>
            <h2
              id="sand-heading"
              className="mt-5 font-display text-[clamp(2.5rem,6vw,6.25rem)] font-light uppercase leading-[0.95] tracking-[0.08em]"
            >
              Crafted in sand
            </h2>
            <p className="world-words mt-10 font-display text-[clamp(1.5rem,2.4vw,2.4rem)] font-light italic leading-[1.3]">
              <span>Sand.</span>
              <span>Solitude.</span>
              <span>Identity.</span>
            </p>
          </div>
        </div>
      </section>

      {/* The companion is internal concept art: a build without it leaves this section out. */}
      {companion && (
        <section
          ref={second}
          aria-labelledby="companion-heading"
          data-testid="companion-section"
          className="companion"
        >
          <div className="companion-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={companion}
              alt="The small reader of DESERT EYE, lying on a dune with his book and gourd at golden hour"
              loading="lazy"
              decoding="async"
              className="companion-media"
            />
            <div className="companion-copy">
              <p className="label-xs">The companion</p>
              <h2
                id="companion-heading"
                className="mt-4 font-display text-[clamp(2rem,3.6vw,3.5rem)] font-light leading-[1.05]"
              >
                He reads where the wind stops.
              </h2>
              <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed">
                DESERT EYE is our inspired collection: a world of sand, silence
                and a quiet strength that learned to be gentle. Its small keeper
                lies in the dunes with a book and his gourd. Wake him, and the
                sand will show you the way in.
              </p>
              <p className="label-xs mt-6 opacity-70">
                Inspired design · not an official collaboration
              </p>
              <Link
                href="/collections?family=desert-eye-love"
                className="text-link mt-8"
              >
                Enter DESERT EYE <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
