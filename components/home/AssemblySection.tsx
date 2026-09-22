import { filmFor, formOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { ProductFilm } from "@/components/catalog/ProductFilm";

// 05: ASSEMBLY. The approved product animation as a campaign film: the whole width of the page,
// nothing beside it. The material words are HTML over the film from the moment each part seats
// (inside ProductFilm), never baked in, and the finished piece holds large at the end.
export function AssemblySection({ product }: { product: Product }) {
  const form = formOf(product, "anti-eyebrow");
  const film = filmFor(product, form.id);
  if (!film) return null;
  return (
    <section aria-labelledby="assembly-heading" data-testid="assembly-section" className="assembly-section">
      <div className="assembly-head">
        <p className="label-xs">04 / ASSEMBLY</p>
        <h2 id="assembly-heading" className="mt-3 font-display text-[clamp(1.75rem,2.6vw,2.75rem)] font-light uppercase leading-[1.05] tracking-[0.06em]">
          Assembled with intent
        </h2>
      </div>
      <div className="assembly-film">
        <ProductFilm product={product} film={film} formId={form.id} />
      </div>
    </section>
  );
}
