import Link from "next/link";
import { SandLayer } from "@/components/story/SandLayer";

// One quiet story section for DESERT EYE: three words and sand. The picture is a still from the
// approved product animation with the collection's drifting grains over it. It stands in for the
// macro fly-through (MEDIA 02) until that clip is approved and generated; nothing here plays.
export function StorySection({ still, href }: { still: string; href: string }) {
  return (
    <section aria-labelledby="story-heading" data-testid="story-section" className="story-section mx-auto max-w-[120rem] px-6 py-16 sm:px-10 lg:px-16 lg:py-28">
      <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="lg:pb-10">
          <p className="label-xs text-ash">Collection 001</p>
          <h2 id="story-heading" className="mt-3 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-light leading-none tracking-[0.06em]">
            DESERT EYE
          </h2>
          <p className="story-words mt-8 font-display text-[clamp(1.5rem,2.6vw,2.5rem)] font-light leading-[1.25]">
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
        <div className="story-still relative aspect-video w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={still} alt="Sand rising in a slow vortex" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          <SandLayer className="story-still-sand" />
        </div>
      </div>
    </section>
  );
}
