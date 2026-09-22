import Link from "next/link";

// 09: the last frame of the launch film. The piece once more, three lines, two ways in.
export function FinalCta({ still, shopHref }: { still: string; shopHref: string }) {
  return (
    <section aria-labelledby="final-heading" data-testid="final-section" className="final-section">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={still} alt="" aria-hidden="true" loading="lazy" decoding="async" className="final-media" />
      <div className="final-copy">
        <h2 id="final-heading" className="font-display text-[clamp(2.25rem,5.4vw,5.5rem)] font-light uppercase leading-[0.98] tracking-[0.03em]">
          Your face.
          <br />
          Your placement.
          <br />
          Your piece.
        </h2>
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-2">
          <Link href="/face-studio" className="text-link" data-testid="final-studio">
            Enter Face Studio <span aria-hidden="true">↗</span>
          </Link>
          <Link href={shopHref} className="text-link" data-testid="final-shop">
            Shop DESERT EYE <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
