import Link from "next/link";

/** A campaign portrait, with the current photographic product scene as its public fallback. */
export function CinemaHero({ poster, posterAlt, cinematicPortrait }: { poster: string; posterAlt: string; cinematicPortrait?: string }) {
  return (
    <section aria-labelledby="landing-heading" data-testid="cinema-hero" data-presentation={cinematicPortrait ? "portrait" : "product"} data-mode={cinematicPortrait ? "portrait" : "still"} className={`cinema-hero ${cinematicPortrait ? "cinema-hero-portrait" : "cinema-hero-product"}`}>
      {/* Private review portraits must not enter Next's public image-optimization cache. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cinematicPortrait ?? poster}
        alt={cinematicPortrait ? "Hyperrealistic interpretation of adult Gaara wearing the DESERT EYE LOVE anti-eyebrow design, with the openwork symbol above the deep-red stone" : posterAlt}
        data-testid={cinematicPortrait ? "cinema-hero-portrait" : "cinema-hero-product"}
        className="cinema-hero-media"
        fetchPriority="high"
      />
      <div className="cinema-hero-veil" aria-hidden="true" />
      <div className="cinema-hero-copy">
        <p className="label-xs">01 / {cinematicPortrait ? "The first story" : "The launch collection"}</p>
        <p className="mt-4 font-display text-[clamp(1.25rem,1.7vw,1.6rem)] font-light tracking-[0.14em]">DESERT EYE&nbsp;—&nbsp;LOVE</p>
        <h1 id="landing-heading" className="mt-5 font-display text-[clamp(2.5rem,5.2vw,5.25rem)] font-light leading-[1.02] tracking-[0.01em]">
          {cinematicPortrait ? <>A story,<br /><em>worn close.</em></> : <>Love, worn<br /><em>your way.</em></>}
        </h1>
        <p className="hero-introduction">{cinematicPortrait ? "From a mark of solitude to a sign of belonging. A symbol and a deep-red stone, made personal." : "A symbol. A deep-red stone. A different kind of signature."}</p>
        <div className="mt-9 flex flex-wrap gap-x-10 gap-y-2">
          <Link href="/product/desert-eye-love" data-testid="cta-piece" className="text-link">
            {cinematicPortrait ? "Enter the story" : "Discover the piece"} <span aria-hidden="true">↗</span>
          </Link>
          <Link href="#selection" data-testid="cta-selection" className="text-link">
            Explore DERMAL <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <p className="cinema-hero-edition label-xs">{cinematicPortrait ? "Gaara / AI editorial study" : "DESERT EYE — LOVE / AI design render"}</p>
      <a href="#reveal" className="cinema-hero-scroll label-xs" aria-label="Continue to the jewelry reveal">The story continues <span aria-hidden="true">↓</span></a>
    </section>
  );
}
