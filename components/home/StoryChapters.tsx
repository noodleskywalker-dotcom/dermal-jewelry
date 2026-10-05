"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { displayTitle, isConceptFamily } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { productStories } from "@/lib/catalog/product-stories";

/** One chapter at a time, at the visitor's pace. No autoplay and no scroll capture. */
export function StoryChapters({ products, cinematicPortrait, ankhReference, crosslineReference }: { products: Product[]; cinematicPortrait?: string; ankhReference?: string; crosslineReference?: string }) {
  const chapters = products.filter((product) => productStories[product.slug] && product.render);
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const product = chapters[index] ?? chapters[0];
  if (!product?.render) return null;
  const story = productStories[product.slug];
  const image = product.render.hero;
  const compactReference = product.slug === "crossline" ? crosslineReference : undefined;
  const reference = product.slug === "ankh-trace" ? ankhReference : compactReference;
  const portrait = product.slug === "desert-eye-love" ? cinematicPortrait : reference;
  const photographic = !portrait && product.render.presentation === "photographic";
  const beats = [story.signature, story.expression];

  function move(event: KeyboardEvent<HTMLButtonElement>, at: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (at + 1) % chapters.length;
    else if (event.key === "ArrowLeft") next = (at - 1 + chapters.length) % chapters.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = chapters.length - 1;
    else return;
    event.preventDefault();
    setIndex(next);
    tabs.current[next]?.focus();
  }

  return (
    <section className="home-stories" aria-labelledby="home-stories-heading" data-testid="home-stories">
      <div className="home-stories-heading">
        <div>
          <p className="label-xs">04 / The stories behind the forms</p>
          <h2 id="home-stories-heading">Every piece.<br /><em>A point of view.</em></h2>
        </div>
        <p>Before it becomes a signature,<br />it begins as a feeling.</p>
      </div>
      <div className="home-story-tabs" role="tablist" aria-label="Choose a design story">
        {chapters.map((chapter, at) => (
          <button
            key={chapter.slug}
            ref={(el) => { tabs.current[at] = el; }}
            type="button"
            role="tab"
            id={`home-story-tab-${chapter.slug}`}
            aria-selected={index === at}
            aria-controls="home-story-panel"
            tabIndex={index === at ? 0 : -1}
            onClick={() => setIndex(at)}
            onKeyDown={(event) => move(event, at)}
          >
            <span>{String(at + 1).padStart(2, "0")}</span>{displayTitle(chapter.title)}
          </button>
        ))}
      </div>
      <div id="home-story-panel" role="tabpanel" aria-labelledby={`home-story-tab-${product.slug}`} tabIndex={0} className="home-story-panel" data-family={product.slug} data-mode={portrait ? "portrait" : "product"} data-testid="home-story-panel">
        <figure className={`home-story-visual${portrait ? " home-story-visual-portrait" : photographic ? " home-story-visual-photographic" : ""}${reference ? " home-story-visual-reference" : ""}${compactReference ? " home-story-visual-reference-compact" : ""}`} key={product.slug}>
          {portrait ? (
            // Private preview art must not enter Next's public image-optimization cache.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={portrait} alt={compactReference ? "Original CROSSLINE placement reference: a thin dark line and separate small silver cross below the eye" : reference ? "Original ANKH TRACE design reference: a silver-haired wearer with a small ankh below the eye" : "Adult Gaara interpreted as a hyperrealistic portrait, wearing the DESERT EYE LOVE anti-eyebrow design"} className="home-story-portrait" loading="lazy" />
          ) : (
            <>
              {!photographic && <span className="home-story-word" aria-hidden="true">{story.word}</span>}
              <Image src={image.src} alt={product.render.alt} width={image.width} height={image.height} sizes="(max-width: 760px) 90vw, 50vw" className="home-story-image" />
            </>
          )}
          <figcaption><span>{displayTitle(product.title)}</span><span>{compactReference ? "Original placement reference" : reference ? "Original design reference" : portrait ? "Gaara / AI editorial study" : isConceptFamily(product) ? "Concept study" : "Design render"}</span></figcaption>
        </figure>
        <div className="home-story-copy">
          <p className="label-xs">Chapter {String(index + 1).padStart(2, "0")} / {story.word}</p>
          <h3>{story.atmosphere.title}</h3>
          <p className="home-story-introduction">{story.atmosphere.copy}</p>
          <ol className="home-story-beats" start={2} aria-label="The form and the expression">
            {beats.map((beat, at) => (
              <li key={beat.title}>
                <span>{String(at + 2).padStart(2, "0")}</span>
                <div><h4>{beat.title}</h4><p>{beat.copy}</p></div>
              </li>
            ))}
          </ol>
          <Link href={`/product/${product.slug}#design-story`} className="text-link" data-testid="home-story-link">Explore {displayTitle(product.title)} <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </section>
  );
}
