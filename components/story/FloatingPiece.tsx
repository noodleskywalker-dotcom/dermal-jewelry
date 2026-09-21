"use client";

import { formatPrice } from "@/lib/catalog";
import type { FloatingPiece as Piece } from "@/lib/story";
import { resolveComponents } from "@/lib/studio/geometry";
import { FormVisual } from "@/components/catalog/FormVisual";

const GRAINS = [
  { gx: "-34%", gdx: "-8px", gdy: "-22px", gdelay: "0ms" },
  { gx: "-12%", gdx: "5px", gdy: "-30px", gdelay: "80ms" },
  { gx: "8%", gdx: "-4px", gdy: "-26px", gdelay: "30ms" },
  { gx: "26%", gdx: "9px", gdy: "-34px", gdelay: "120ms" },
  { gx: "40%", gdx: "-6px", gdy: "-20px", gdelay: "60ms" },
];

const STONES = new Set(["garnet-gem", "orbit"]);

// One jewelry object on the open canvas: no card, no frame. The object is a link to this product
// and form, so it is always directly shoppable, and the small label beside it carries the name, the
// form, the demo price and TRY ON. Hover only ever moves light across it; it never plays a story.
export function FloatingPiece({
  piece,
  index,
  collectionSlug,
  sand,
  onOpen,
}: {
  piece: Piece;
  index: number;
  collectionSlug: string;
  /** Sand grains lift off under the object on hover. A story's own motion language. */
  sand: boolean;
  onOpen: (view: "concept" | "tryon") => void;
}) {
  const { product, form, spot } = piece;
  const stone = resolveComponents(product, { side: "left", tweaks: {}, formId: form.id }).find((c) => STONES.has(c.art));

  return (
    <li
      data-testid="story-piece"
      data-product={product.slug}
      data-form={form.id}
      data-pieces={form.components.length}
      className="story-piece"
      style={
        {
          "--x": `${spot.x}%`,
          "--y": `${spot.y}%`,
          "--size": `${spot.size}rem`,
          "--tilt": `${spot.tilt}deg`,
          "--float-delay": `${index * -1.7}s`,
        } as React.CSSProperties
      }
    >
      <a
        href={`/collections/${collectionSlug}?product=${product.slug}&form=${form.id}`}
        data-testid="story-piece-link"
        aria-label={`${product.title}, ${form.label} form, demo price ${formatPrice(form.demoPrice, product.currency)}`}
        onClick={(e) => {
          // A modified click keeps its browser meaning, such as opening a new tab.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          onOpen("concept");
        }}
        className="story-piece-link"
      >
        <span className="story-piece-float">
          <span className="story-piece-art">
            <FormVisual product={product} formId={form.id} />
            <span aria-hidden="true" className="story-sweep" />
            {stone && <span aria-hidden="true" className="story-glint" style={{ left: `${stone.leftPct - stone.widthPct * 0.14}%`, top: `${stone.topPct - stone.widthPct * 0.16}%` }} />}
            {sand &&
              GRAINS.map((g, i) => (
                <span key={i} aria-hidden="true" className="story-grain" style={{ "--gx": g.gx, "--gdx": g.gdx, "--gdy": g.gdy, "--gdelay": g.gdelay } as React.CSSProperties} />
              ))}
          </span>
        </span>
      </a>

      <div className="story-piece-label">
        <p className="font-display text-lg font-light leading-tight">{product.title}</p>
        <p className="label-xs mt-1 text-ink/60">
          {form.label} · <span className="sr-only">Demo price </span>
          {formatPrice(form.demoPrice, product.currency)} · Demo
        </p>
        <button type="button" data-testid="story-piece-tryon" onClick={() => onOpen("tryon")} className="text-link">
          Try on<span className="sr-only"> {product.title}, {form.label} form</span> <span aria-hidden="true">↗</span>
        </button>
      </div>
    </li>
  );
}
