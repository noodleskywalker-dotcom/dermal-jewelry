import Image from "next/image";
import Link from "next/link";
import { displayTitle, isConceptFamily, renderFor } from "@/lib/catalog";
import { productStories } from "@/lib/catalog/product-stories";
import type { Product } from "@/lib/catalog/types";
import { FormVisual } from "./FormVisual";

/** A prepared editorial story. It never supplies placement geometry or product specifications. */
export function ProductStory({ product, formId, editorialDetailSrc, editorialReferenceSrc }: { product: Product; formId: string; editorialDetailSrc?: string; editorialReferenceSrc?: string }) {
  const story = productStories[product.slug];
  const render = renderFor(product, formId);
  const concept = isConceptFamily(product);
  const titleId = `design-story-${product.slug}`;
  const gaaraEditorial = product.slug === "desert-eye-love" && editorialDetailSrc;
  const reference = editorialReferenceSrc && (product.slug === "ankh-trace"
    ? { src: editorialReferenceSrc, width: 1374, height: 1145, compact: false, alt: "Original ANKH TRACE design reference: a silver-haired wearer with a small ankh below the eye", caption: "Original design reference / ANKH TRACE" }
    : product.slug === "crossline"
      ? { src: editorialReferenceSrc, width: 179, height: 359, compact: true, alt: "Original CROSSLINE placement reference: a thin dark line and separate small silver cross below the eye", caption: "Original placement reference / CROSSLINE" }
      : undefined);
  const photographic = render?.presentation === "photographic";

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

  const signature = product.slug === "desert-eye-love" && formId === "nose"
    ? { title: "One point of deep red.", copy: "The gemstone carries the colour of the larger design into a single accent. Its facets catch a little light while the small setting keeps the outline clear.", detail: "Deep-red gemstone / Selected nose form" }
    : product.slug === "desert-eye-love" && formId === "micro-dermal"
      ? { title: "The mark, on its own.", copy: "The openwork love symbol stands alone in this form. Light follows its edges, while the openings let the space around it remain part of the design.", detail: "Openwork love symbol / Selected micro dermal form" }
      : story.signature;

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
        <figure className={`pdp-story-visual ${gaaraEditorial ? "pdp-story-portrait" : reference ? `pdp-story-photographic pdp-story-reference${reference.compact ? " pdp-story-reference-compact" : ""}` : photographic ? "pdp-story-photographic" : "pdp-story-object"}`}>
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
          ) : reference ? (
            <Image
              src={reference.src}
              width={reference.width}
              height={reference.height}
              sizes={reference.compact ? "179px" : "(min-width: 1024px) 55vw, 100vw"}
              unoptimized
              alt={reference.alt}
              data-testid="product-story-reference"
            />
          ) : (
            <>
              {!photographic && <span className="pdp-story-word font-display" aria-hidden="true">{story.word}</span>}
              {visual(false)}
            </>
          )}
          <figcaption className="label-xs">{gaaraEditorial ? "Gaara / AI editorial concept / Anti-eyebrow pair · Not an official collaboration" : reference ? reference.caption : `${render ? "Design render" : "Form illustration"} / ${concept ? "Concept study" : "Selected form"}`}</figcaption>
        </figure>
      </div>

      <div className="pdp-story-signature">
        <figure className={`pdp-story-visual ${photographic ? "pdp-story-photographic" : "pdp-story-detail"}`}>
          {visual(true)}
          <figcaption className="label-xs">{render ? signature.detail : "Selected form / Design illustration"}</figcaption>
        </figure>
        <div className="pdp-story-copy">
          <p className="label-xs"><span>02</span> The signature</p>
          <h3 className="font-display">{signature.title}</h3>
          <p>{signature.copy}</p>
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
