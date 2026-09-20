import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FamilyExperience } from "@/components/catalog/FamilyExperience";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { catalog } from "@/lib/catalog";

export function generateStaticParams() {
  return catalog.listProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = catalog.getProduct(slug);
  return product ? { title: product.title, description: product.summary } : {};
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// Development-only media used to exercise the reveal player. A production build never serves it,
// so an unfinished reveal can only ever appear as a still with "in preparation".
function fixtureFor(flag: string | undefined): string | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
  if (flag === "1") return "/fixtures/reveal-test-pattern.webm";
  if (flag === "missing") return "/fixtures/does-not-exist.webm";
  return undefined;
}

// Development-only local prototype built from two internal stills. They live in the gitignored
// `references/generated/` folder and are served by a route that answers 404 in production.
function conceptFor(flag: string | undefined, slug: string) {
  if (process.env.NODE_ENV === "production" || flag !== "concept" || slug !== "desert-eye-love") return undefined;
  return { start: "/api/dev-concept/start", sand: "/api/dev-concept/sand" };
}

export default async function ProductPage({ params, searchParams }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const product = catalog.getProduct(slug);
  if (!product) notFound();

  // Related means the same placement first, then the rest. Never random.
  const others = catalog.listProducts().filter((p) => p.id !== product.id);
  const related = [
    ...others.filter((p) => p.placements.some((pl) => product.placements.includes(pl))),
    ...others.filter((p) => !p.placements.some((pl) => product.placements.includes(pl))),
  ].slice(0, 3);

  return (
    <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8">
      <nav aria-label="Breadcrumb" className="label-xs text-ash">
        <Link href="/shop" className="hover:text-ivory">Shop</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{product.title}</span>
      </nav>

      <div className="mt-8">
        <FamilyExperience product={product} initialFormId={first(query.form)} fixtureSrc={fixtureFor(first(query.revealFixture))} concept={conceptFor(first(query.revealFixture), slug)} />
      </div>

      <section aria-labelledby="specs-heading" className="mt-16 max-w-2xl border-t border-line pt-6">
        <h2 id="specs-heading" className="label-xs text-ash">Specifications</h2>
        <dl className="mt-3 divide-y divide-line text-sm">
          {product.specs.map((spec) => (
            <div key={spec.label} className="grid grid-cols-[9rem_1fr] gap-4 py-3">
              <dt className="text-ash">{spec.label}</dt>
              <dd>
                {spec.value}
                {spec.status === "unverified" && <span className="label-xs ml-2 whitespace-nowrap text-garnet-text">Unverified</span>}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-ash">
          Specifications are published only after a supplier confirms them. Ask a professional piercer about
          compatibility with your existing jewelry.
        </p>
      </section>

      <section aria-labelledby="related-heading" className="mt-24 border-t border-line pt-12">
        <h2 id="related-heading" className="font-display text-4xl font-light">More pieces</h2>
        <div className="mt-10">
          <ProductGrid products={related} className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3" />
        </div>
      </section>
    </div>
  );
}
