import Link from "next/link";
import { filmFor, formOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { ProductFilm } from "@/components/catalog/ProductFilm";

// The piece, assembled: the approved product animation on the left, the material words on the
// right. The words are the owner's, and nothing here is confirmed by a maker.
export function AssemblySection({ product }: { product: Product }) {
  const form = formOf(product, "anti-eyebrow");
  const film = filmFor(product, form.id);
  if (!film) return null;
  return (
    <section aria-labelledby="assembly-heading" data-testid="assembly-section" className="mx-auto max-w-[120rem] px-6 py-16 sm:px-10 lg:px-16 lg:py-28">
      <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <ProductFilm product={product} film={film} formId={form.id} />
        </div>
        <div className="lg:pt-[8svh]">
          <p className="label-xs">04 / ASSEMBLY</p>
          <h2 id="assembly-heading" className="mt-3 font-display text-[clamp(2rem,3vw,3rem)] font-light uppercase leading-[1.05] tracking-[0.04em]">
            Assembled with intent
          </h2>
          <dl className="mt-10 divide-y divide-line border-y border-line">
            {(product.materials ?? []).map((m) => (
              <div key={m.id} className="py-4">
                <dt className="label-xs">{m.label}</dt>
                <dd className="label-xs mt-1 text-ash">{m.status}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-ash">Concept hardware. Type, size and thread are not confirmed.</p>
          <Link href={`/product/${product.slug}?form=${form.id}`} className="text-link mt-8">
            View the piece <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
