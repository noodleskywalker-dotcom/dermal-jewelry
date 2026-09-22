// THE PIECE: the meaning of DESERT EYE — LOVE, in the fewest words, beside the piece at its sharpest.
// Every material note is the owner's wording; nothing here is a specification.
export function PieceStory({ still }: { still: string }) {
  return (
    <section aria-labelledby="piece-heading" data-testid="piece-story" className="piece-story">
      <div className="piece-story-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={still} alt="DESERT EYE — LOVE: the openwork symbol, the faceted stone and the polished bar" loading="lazy" decoding="async" />
      </div>
      <div className="piece-story-copy">
        <p className="label-xs">The piece</p>
        <h2 id="piece-heading" className="mt-4 font-display text-[clamp(2.25rem,3.8vw,3.75rem)] font-light leading-[1.02]">
          愛 — worn at the edge of the eye.
        </h2>
        <div className="mt-8 space-y-5 text-[0.98rem] leading-relaxed">
          <p>
            One character, cut open so the skin shows through it. Faced in deep garnet, edged in polished metal, it is
            the word for love, written not for anyone else but for the one who wears it.
          </p>
          <p>
            Below it, lower and closer to the eye, a small faceted stone keeps its own light. Between them, a single bar
            holds the two on a diagonal: a line you draw once, and keep.
          </p>
        </div>
        <dl className="piece-story-notes">
          <div>
            <dt className="label-xs">Symbol</dt>
            <dd>Openwork · deep garnet face · polished edge</dd>
          </div>
          <div>
            <dt className="label-xs">Stone</dt>
            <dd>Deep-red faceted gemstone · material not yet confirmed</dd>
          </div>
          <div>
            <dt className="label-xs">Metal</dt>
            <dd>Titanium · proposed · polished finish, proposed</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
