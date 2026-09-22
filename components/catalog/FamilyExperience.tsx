"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { displayTitle, filmFor, formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { AddToBagButton } from "@/components/cart/AddToBagButton";
import { RevealPlayer, type ConceptStills } from "@/components/reveal/RevealPlayer";
import { useFormChoice } from "@/components/studio/useFormChoice";
import { motionOf } from "./FloatingObject";
import { OrbitViewer } from "./OrbitViewer";
import { PieceAssembly } from "./PieceAssembly";
import { ANCHORS, PlacementPreview } from "./PlacementPreview";
import { ProductFilm } from "./ProductFilm";
import { TryOnPreview } from "./TryOnPreview";

type ViewId = "piece" | "orbit" | "assembly" | "reveal" | "placement" | "tryon";

const ORBIT = "/media/hero-orbit/desert-eye-love";

// The product page as a luxury configurator: one large cinematic stage on the left, a small fixed
// column of information on the right that stays put while the stage changes mode. The chosen
// piercing form lives in the shared Studio provider, so the stage, Face Studio and the bag agree.
export function FamilyExperience({
  product,
  initialFormId,
  fixtureSrc,
  concept,
}: {
  product: Product;
  initialFormId?: string;
  fixtureSrc?: string;
  /** Development-only stills for the local reveal prototype. */
  concept?: ConceptStills;
}) {
  const { form, choose } = useFormChoice(product, initialFormId);
  const film = filmFor(product, form.id);
  const anchor = ANCHORS[form.placement] ?? { x: 0.5, y: 0.5 };

  const views: { id: ViewId; label: string }[] = [
    { id: "piece", label: "Piece" },
    ...(film ? [{ id: "orbit" as const, label: "360°" }, { id: "assembly" as const, label: "Assembly" }] : []),
    // The concept-reveal prototype is superseded on a filmed form; development fixtures can still open it.
    ...(product.reveal.mode !== "none" && (!film || fixtureSrc || concept) ? [{ id: "reveal" as const, label: "Concept reveal" }] : []),
    { id: "placement", label: "Placement" },
    { id: "tryon", label: "Try on" },
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
    if (!delta) return;
    e.preventDefault();
    const next = views[(index + delta + views.length) % views.length];
    setView(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div className="pdp" data-testid="family" data-form={form.id}>
      {/* The stage. */}
      <div className="pdp-stage-column">
        <div role="tabpanel" id={`panel-${current}`} aria-labelledby={`tab-${current}`} data-testid="pdp-stage" data-view={current} className="pdp-stage">
          {current === "piece" && film && (
            // The beauty frame of the approved orbit: the finished piece, large. Never a schematic first.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${ORBIT}/f-001.jpg`} alt={`${product.title}, ${form.label} form, the completed piece`} data-testid="pdp-beauty" className="pdp-media" />
          )}
          {current === "piece" && !film && <PieceAssembly key={product.id} product={product} formId={form.id} sand={motionOf(product, form.id) === "sand"} />}
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
        <h1 className="mt-4 font-display text-[clamp(2rem,2.6vw,2.75rem)] font-light leading-[1.05] tracking-[0.04em]">{displayTitle(product.title)}</h1>

        <fieldset className="mt-10">
          <legend className="label-xs text-ash">Form</legend>
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

        <p className="mt-8" data-testid="family-price">
          <span className="label-xs block text-ash">Demo price</span>
          <span className="mt-1 block font-display text-3xl font-light tracking-[0.06em]">{formatPrice(form.demoPrice, product.currency)}</span>
        </p>

        <Link href={`/face-studio?product=${product.slug}&form=${form.id}`} data-testid="try-it-on" className="text-link mt-6">
          Try on your face <span aria-hidden="true">↗</span>
        </Link>

        <AddToBagButton product={product} formId={form.id} className="mt-5" />
        <p className="label-xs mt-3 text-ash">Demo · nothing can be ordered yet</p>

        <div className="mt-10 divide-y divide-line border-y border-line">
          <details className="group">
            <summary className="label-xs flex min-h-11 cursor-pointer list-none items-center justify-between">
              Details <span aria-hidden="true" className="text-ash group-open:hidden">+</span><span aria-hidden="true" className="hidden text-ash group-open:inline">−</span>
            </summary>
            <div className="pb-4 text-sm leading-relaxed text-ash">
              <p>{product.story}</p>
              <p className="mt-3" data-testid="family-form-note">{form.note}</p>
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
      </aside>
    </div>
  );
}
