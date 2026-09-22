import Link from "next/link";

// 09: the final campaign frame. The piece, large and dark-toned, three lines, two ways in. Then the footer.
export function FinalCta({ still, shopHref }: { still: string; shopHref: string }) {
  return (
    <section aria-labelledby="final-heading" data-testid="final-section" className="final">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={still} alt="" aria-hidden="true" loading="lazy" decoding="async" className="final-media" />
      <div className="final-copy">
        <h2 id="final-heading" className="font-display text-[clamp(2.5rem,5.6vw,6rem)] font-light uppercase leading-[0.96] tracking-[0.03em]">
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
            Shop the collection <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
