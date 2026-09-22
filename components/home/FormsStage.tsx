"use client";

import Link from "next/link";
import { availableForms, filmFor, formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { PieceAssembly } from "@/components/catalog/PieceAssembly";
import { useFormChoice } from "@/components/studio/useFormChoice";

// 06: THE FORMS. One stage; the piercing form changes in place. The chosen form is the shared one
// from the Studio provider, so the product page, Face Studio and the bag agree with it. The filmed
// form shows the completed piece from the approved orbit; the others show the drawn assembly.
export function FormsStage({ product, still }: { product: Product; still: string }) {
  const { form, choose } = useFormChoice(product);
  const film = filmFor(product, form.id);
  return (
    <section aria-labelledby="forms-heading" data-testid="forms-section" data-form={form.id} className="mx-auto max-w-[120rem] px-6 py-20 sm:px-10 lg:px-16 lg:py-32">
      <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-center">
        <div className="forms-stage relative">
          {film ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={form.id} src={still} alt={`${product.title}, ${form.label} form`} loading="lazy" decoding="async" className="forms-still" />
          ) : (
            <PieceAssembly key={form.id} product={product} formId={form.id} sand />
          )}
        </div>
        <div>
          <p className="label-xs">05 / FORM</p>
          <h2 id="forms-heading" className="mt-3 font-display text-[clamp(2rem,3vw,3rem)] font-light uppercase leading-[1.05] tracking-[0.04em]">
            The forms
          </h2>
          <fieldset className="mt-8">
            <legend className="sr-only">Piercing form</legend>
            <div className="flex flex-col gap-y-1">
              {availableForms(product).map((f) => {
                const selected = f.id === form.id;
                return (
                  <label key={f.id} className={`label-xs flex min-h-11 cursor-pointer items-center gap-4 border-b has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-garnet ${selected ? "border-garnet text-ink" : "border-transparent text-ash hover:text-ink"}`}>
                    <input type="radio" name={`home-form-${product.id}`} value={f.id} checked={selected} onChange={() => choose(f.id)} data-testid={`home-form-${f.id}`} className="sr-only" />
                    <span className="w-7 text-ash">{selected ? "●" : "○"}</span>
                    {f.label}
                    <span className="ml-auto text-ash">{formatPrice(f.demoPrice, product.currency)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <p className="mt-4 text-xs leading-relaxed text-ash">Demo prices. Concept hardware; nothing here is a confirmed specification.</p>
          <Link href={`/product/${product.slug}?form=${form.id}`} className="text-link mt-8" data-testid="forms-explore">
            Explore the piece <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
