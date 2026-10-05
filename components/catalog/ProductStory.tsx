import Image from "next/image";
import Link from "next/link";
import { displayTitle, isConceptFamily, renderFor } from "@/lib/catalog";
import { productStories } from "@/lib/catalog/product-stories";
import type { Product } from "@/lib/catalog/types";
import { FormVisual } from "./FormVisual";

/** A prepared editorial story. It never supplies placement geometry or product specifications. */
export function ProductStory({ product, formId, editorialDetailSrc }: { product: Product; formId: string; editorialDetailSrc?: string }) {
  const story = productStories[product.slug];
  const render = renderFor(product, formId);
  const concept = isConceptFamily(product);
  const titleId = `design-story-${product.slug}`;
  const gaaraEditorial = product.slug === "desert-eye-love" && editorialDetailSrc;

  if (!story) {
    return (
      <section className="pdp-story-fallback" id="design-story" aria-labelledby={titleId}>
        <p className="label-xs">The thought behind the form</p>
        <h2 className="font-display" id={titleId}>A small object. A personal statement.</h2>
        <p>{product.story}</p>
        <Link href="/collections" className="text-link">Explore the collection <span aria-hidden="true">→</span></Link>
      </section>
    );
  }

  const visual = (detail: boolean) => {
    const image = detail ? render?.detail ?? render?.hero : render?.hero;
    return image ? (
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        sizes="(min-width: 1024px) 55vw, 100vw"
        alt={detail ? `${product.title}, close detail of the design render` : render!.alt}
      />
    ) : (
      <div className="pdp-story-drawing" aria-label={`${product.title}, ${formId} form illustration`} role="img">
        <FormVisual product={product} formId={formId} />
      </div>
    );
  };

  return (
    <section className="pdp-design-story" id="design-story" aria-labelledby={titleId} data-testid="product-design-story" data-story-family={product.slug}>
      <header className="pdp-story-masthead">
        <p className="label-xs">The story of {displayTitle(product.title)}</p>
        <p className="label-xs">Three moments / One expression</p>
      </header>

      <div className="pdp-story-atmosphere">
        <div className="pdp-story-copy">
          <p className="label-xs"><span>01</span> The atmosphere</p>
          <h2 id={titleId} className="font-display">{gaaraEditorial ? "Gaara. The mark and the quiet." : story.atmosphere.title}</h2>
          <p>{gaaraEditorial ? "Gaara’s red hair and forehead mark set the atmosphere. In this imagined portrait, the openwork love symbol and a deep-red point become a quiet extension of his character: a familiar story, brought close to the skin." : story.atmosphere.copy}</p>
        </div>
        <figure className={`pdp-story-visual ${gaaraEditorial ? "pdp-story-portrait" : "pdp-story-object"}`}>
          {gaaraEditorial ? (
            <Image
              src={gaaraEditorial}
              width={2048}
              height={2048}
              sizes="(min-width: 1024px) 55vw, 100vw"
              unoptimized
              alt="AI editorial portrait of Gaara wearing the DESERT EYE openwork love symbol and deep-red anti-eyebrow pair"
              data-testid="product-story-editorial"
            />
          ) : (
            <>
              <span className="pdp-story-word font-display" aria-hidden="true">{story.word}</span>
              {visual(false)}
            </>
          )}
          <figcaption className="label-xs">{gaaraEditorial ? "Gaara / AI editorial concept / Anti-eyebrow pair · Not an official collaboration" : `${render ? "Design render" : "Form illustration"} / ${concept ? "Concept study" : "Selected form"}`}</figcaption>
        </figure>
      </div>

      <div className="pdp-story-signature">
        <figure className="pdp-story-visual pdp-story-detail">
          {visual(true)}
          <figcaption className="label-xs">{render ? story.signature.detail : "Selected form / Design illustration"}</figcaption>
        </figure>
        <div className="pdp-story-copy">
          <p className="label-xs"><span>02</span> The signature</p>
          <h3 className="font-display">{story.signature.title}</h3>
          <p>{story.signature.copy}</p>
        </div>
      </div>

      <div className="pdp-story-expression">
        <p className="label-xs"><span>03</span> {concept ? "The next chapter" : "Your expression"}</p>
        <div>
          <h3 className="font-display">{story.expression.title}</h3>
          <p>{story.expression.copy}</p>
          <div className="pdp-story-links">
            {concept ? (
              <Link href="/commission" className="text-link">Begin a personal design <span aria-hidden="true">↗</span></Link>
            ) : (
              <Link href={`/face-studio?product=${product.slug}&form=${formId}`} className="text-link">See it on you <span aria-hidden="true">↗</span></Link>
            )}
            <Link href="/collections" className="text-link">Another story <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
