"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { displayTitle, filmFor, isConceptFamily, lineLabels, renderFor } from "@/lib/catalog";
import { priceLabel, purchaseState } from "@/lib/commerce/display";
import type { Product } from "@/lib/catalog/types";
import { AddToBagButton } from "@/components/cart/AddToBagButton";
import { RevealPlayer, type ConceptStills } from "@/components/reveal/RevealPlayer";
import { useFormChoice } from "@/components/studio/useFormChoice";
import { motionOf } from "./FloatingObject";
import { DESERT_EYE_HOTSPOTS, DESERT_EYE_RENDER_HOTSPOTS, MaterialHotspots } from "./MaterialHotspots";
import { OrbitViewer } from "./OrbitViewer";
import { PieceAssembly } from "./PieceAssembly";
import { ProductStage } from "./ProductStage";
import { RenderStage } from "./RenderStage";
import { CommissionCta } from "@/components/commission/CommissionCta";
import { ANCHORS, PlacementPreview } from "./PlacementPreview";
import { ProductFilm } from "./ProductFilm";
import { TryOnPreview } from "./TryOnPreview";
import { ProductStory } from "./ProductStory";

type ViewId = "piece" | "motion" | "orbit" | "assembly" | "hardware" | "reveal" | "placement" | "tryon";

const ORBIT = "/media/hero-orbit/desert-eye-love";

// The product page as a luxury configurator: one large cinematic stage on the left, a small fixed
// column of information on the right that stays put while the stage changes mode. The chosen
// piercing form lives in the shared Studio provider, so the stage, Face Studio and the bag agree.
export function FamilyExperience({
  product,
  initialFormId,
  fixtureSrc,
  concept,
  editorialDetailSrc,
}: {
  product: Product;
  initialFormId?: string;
  fixtureSrc?: string;
  /** Development-only stills for the local reveal prototype. */
  concept?: ConceptStills;
  /** Server-gated character campaign artwork, isolated from product/form geometry. */
  editorialDetailSrc?: string;
}) {
  const { form, choose } = useFormChoice(product, initialFormId);
  const film = filmFor(product, form.id);
  const anchor = ANCHORS[form.placement] ?? { x: 0.5, y: 0.5 };
  // The price and the purchase state both come from the commerce layer, so a piece with a real
  // Shopify variant and one with none are presented by the same code and neither is guessed at.
  const price = priceLabel(product, form.id);
  const purchase = purchaseState(product, form.id);
  // A family known only from its render has no form drawn yet: nothing to place or try on.
  const conceptOnly = isConceptFamily(product);
  // The render leads only for a form it really shows; any other form keeps its own drawn piece.
  const render = renderFor(product, form.id);

  const views: { id: ViewId; label: string }[] = [
    { id: "piece", label: "The piece" },
    // With a design render as the piece, prepared film media moves to a view of its own.
    ...(render && product.media ? [{ id: "motion" as const, label: product.media.film?.length ? "In motion" : "More views" }] : []),
    // A piece with prepared media shows the drawn hardware on its own; without media, "The piece" is it.
    ...(product.media ? [{ id: "hardware" as const, label: "Hardware" }] : []),
    ...(film ? [{ id: "orbit" as const, label: "Orbit study" }, { id: "assembly" as const, label: "Assembly" }] : []),
    // The concept-reveal prototype is superseded on a filmed form; development fixtures can still open it.
    ...(product.reveal.mode !== "none" && (!film || fixtureSrc || concept) ? [{ id: "reveal" as const, label: "Concept reveal" }] : []),
    ...(conceptOnly
      ? []
      : [
          { id: "placement" as const, label: "Placement" },
          { id: "tryon" as const, label: "Try on" },
        ]),
  ];
  const [view, setView] = useState<ViewId>("piece");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const current = views.some((v) => v.id === view) ? view : "piece";

  const chooseForm = (formId: string) => {
    choose(formId);
    // Shareable address for this product and form. Nothing about a photo is ever written to the URL.
    const url = new URL(window.location.href);
    url.searchParams.set("form", formId);
    window.history.replaceState(null, "", url);
  };

  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next = views[e.key === "Home" ? 0 : e.key === "End" ? views.length - 1 : (index + delta + views.length) % views.length];
    setView(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div className="pdp-experience" data-product={product.slug}>
    <div className="pdp" data-testid="family" data-form={form.id}>
      {/* The stage. */}
      <div className="pdp-stage-column">
        <div className="pdp-stage-label label-xs">
          <span>DERMAL / {conceptOnly ? "Concept study" : "The design"}</span>
          <span>{current === "piece" ? "01" : String(views.findIndex((v) => v.id === current) + 1).padStart(2, "0")} / {String(views.length).padStart(2, "0")}</span>
        </div>
        <div role="tabpanel" id={`panel-${current}`} aria-labelledby={`tab-${current}`} data-testid="pdp-stage" data-view={current} className="pdp-stage">
          {current === "piece" && render && (
            <RenderStage render={render} title={product.title} hotspots={film ? DESERT_EYE_RENDER_HOTSPOTS : undefined} />
          )}
          {current === "motion" && product.media && <ProductStage media={product.media} title={product.title} />}
          {current === "piece" && !render && film && (
            // The beauty frame of the approved orbit: the finished piece, large, never a schematic first.
            // The frame box matches the picture's cover crop, so the hotspots stay on the parts.
            <div className="pdp-cover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${ORBIT}/f-001.jpg`} alt={`${product.title}, ${form.label} form, the completed piece`} data-testid="pdp-beauty" className="h-full w-full" />
              <MaterialHotspots spots={DESERT_EYE_HOTSPOTS} />
            </div>
          )}
          {current === "piece" && !render && product.media && <ProductStage media={product.media} title={product.title} />}
          {current === "piece" && !render && !film && !product.media && <PieceAssembly key={product.id} product={product} formId={form.id} sand={motionOf(product, form.id) === "sand"} />}
          {current === "hardware" && <PieceAssembly key={`hw:${product.id}`} product={product} formId={form.id} sand={false} />}
          {current === "orbit" && film && <OrbitViewer dir={ORBIT} count={72} title={product.title} />}
          {current === "assembly" && film && <ProductFilm key={`${product.id}:${form.id}`} product={product} film={film} formId={form.id} />}
          {current === "reveal" && (
            <div className="w-full max-w-[max(16rem,56svh)]">
              <RevealPlayer key={product.id} product={product} formId={form.id} fixtureSrc={fixtureSrc} concept={concept} />
            </div>
          )}
          {current === "placement" && (
            // A tight sculptural crop around this form's placement: outer eye and temple, the nostril, the cheek.
            <div className="pdp-crop" data-testid="pdp-placement-crop">
              <div className="crop-head" style={{ "--px": anchor.x, "--py": anchor.y, "--s": 2.2, "--tx": 0.5, "--ty": 0.46 } as React.CSSProperties}>
                <PlacementPreview product={product} formId={form.id} bare />
              </div>
              <p className="label-xs absolute bottom-4 left-4 text-ash">{form.label} · wearer&rsquo;s left · sculpted form, not a person · approximate</p>
            </div>
          )}
          {current === "tryon" && (
            <div className="w-full max-w-[max(16rem,60svh)]">
              <TryOnPreview product={product} formId={form.id} allowUpload />
            </div>
          )}
        </div>

        {/* Tiny editorial mode controls, not tabs in boxes. */}
        <div role="tablist" aria-label="Ways to look at this piece" className="pdp-modes">
          {views.map((v, i) => (
            <button
              key={v.id}
              ref={(el) => {
                tabRefs.current[v.id] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${v.id}`}
              aria-selected={current === v.id}
              aria-controls={`panel-${v.id}`}
              tabIndex={current === v.id ? 0 : -1}
              onClick={() => setView(v.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`label-xs inline-flex min-h-11 items-center border-b transition-colors duration-500 ${current === v.id ? "border-ink text-ink" : "border-transparent text-ash hover:text-ink"}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* The information column. It stays while the stage changes. */}
      <aside className="pdp-info">
        <p className="label-xs text-ash">{product.origin === "anime-inspired" ? "Anime-inspired design · not an official collaboration" : "Original design"}</p>
        <p className="label-xs mt-2 text-ash" data-testid="family-lines">{lineLabels(product).join(" · ")}</p>
        <h1 className="pdp-title font-display">{displayTitle(product.title)}</h1>
        <p className="pdp-summary">{product.summary}</p>
        <a className="pdp-story-invitation text-link" href="#design-story">Enter the story <span aria-hidden="true">↓</span></a>

        <fieldset className="pdp-forms">
          <legend className="label-xs text-ash">Choose your form</legend>
          <div className="mt-3 flex flex-col">
            {product.forms.map((f) => {
              const pending = f.status !== "available";
              const selected = !pending && f.id === form.id;
              return (
                <label
                  key={f.id}
                  className={`label-xs flex min-h-11 items-center gap-4 border-b has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-garnet ${
                    selected ? "border-garnet text-ink" : pending ? "cursor-not-allowed border-transparent text-ash" : "cursor-pointer border-transparent text-ash hover:text-ink"
                  }`}
                >
                  <input type="radio" name={`form-${product.id}`} value={f.id} checked={selected} disabled={pending} onChange={() => chooseForm(f.id)} data-testid={`form-${f.id}`} className="sr-only" />
                  <span aria-hidden="true" className="w-4 text-ash">{selected ? "●" : "○"}</span>
                  {f.label}
                  {pending && <span className="ml-auto normal-case tracking-normal">Concept pending</span>}
                </label>
              );
            })}
          </div>
        </fieldset>

        <p className="pdp-price" data-testid="family-price">
          {/* Price and state stay owned by the commerce layer. */}
          <span className="label-xs block text-ash">{price.caption}</span>
          <span className="mt-1 block font-display text-3xl font-light tracking-[0.06em]">{price.value}</span>
        </p>

        {!conceptOnly && (
          <Link href={`/face-studio?product=${product.slug}&form=${form.id}`} data-testid="try-it-on" className="pdp-try-link">
            <span>See it on you</span><span aria-hidden="true">↗</span>
          </Link>
        )}

        <AddToBagButton product={product} formId={form.id} className="pdp-purchase" />
        {/* Without an action the button's place already carries the note, so it is not said twice. */}
        {purchase.action && purchase.note && <p className="label-xs mt-3 text-ash" data-testid="purchase-note">{purchase.note}</p>}

        <div className="pdp-details divide-y divide-line border-y border-line">
          <details className="group">
            <summary className="label-xs flex min-h-11 cursor-pointer list-none items-center justify-between">
              Details <span aria-hidden="true" className="text-ash group-open:hidden">+</span><span aria-hidden="true" className="hidden text-ash group-open:inline">−</span>
            </summary>
            <div className="pb-4 text-sm leading-relaxed text-ash">
              <p data-testid="family-form-note">{form.note}</p>
              <p className="mt-2" data-testid="family-package">{form.packageContents}</p>
            </div>
          </details>
          <details className="group">
            <summary className="label-xs flex min-h-11 cursor-pointer list-none items-center justify-between">
              Materials <span aria-hidden="true" className="text-ash group-open:hidden">+</span><span aria-hidden="true" className="hidden text-ash group-open:inline">−</span>
            </summary>
            <dl className="pb-4 text-sm">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-4 py-1.5">
                  <dt className="text-ash">{spec.label}</dt>
                  <dd className="text-right">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </details>
          <details className="group">
            <summary className="label-xs flex min-h-11 cursor-pointer list-none items-center justify-between">
              Care <span aria-hidden="true" className="text-ash group-open:hidden">+</span><span aria-hidden="true" className="hidden text-ash group-open:inline">−</span>
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-ash">Care guidance is published once a supplier confirms the materials. Ask a professional piercer about placement and aftercare.</p>
          </details>
        </div>
        <p className="label-xs mt-4 text-ash" data-testid="spec-status">
          {product.specs.some((s) => s.status === "unverified") ? "Prototype specification · final production details pending · unverified" : "Confirmed specification"}
        </p>
        <CommissionCta className="pdp-commission" />
      </aside>
    </div>

    <ProductStory product={product} formId={form.id} editorialDetailSrc={editorialDetailSrc} />
    </div>
  );
}
