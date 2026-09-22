import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FamilyExperience } from "@/components/catalog/FamilyExperience";
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

  return (
    <div className="story-light">
    <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8">
      <nav aria-label="Breadcrumb" className="label-xs text-ash">
        <Link href="/collections" className="hover:text-ink">Selection</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{product.title}</span>
      </nav>

      <div className="mt-8">
        <FamilyExperience product={product} initialFormId={first(query.form)} fixtureSrc={fixtureFor(first(query.revealFixture))} concept={conceptFor(first(query.revealFixture), slug)} />
      </div>

      {/* One status for the whole specification, said once and quietly. The rows carry no warning tags:
          a field that is not confirmed simply says so in words, in the same grey as everything secondary. */}
      <section aria-labelledby="specs-heading" className="mt-16 max-w-2xl border-t border-line pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
          <h2 id="specs-heading" className="label-xs">Material status</h2>
          <p className="label-xs text-ash" data-testid="spec-status">
            {product.specs.some((s) => s.status === "unverified") ? "Prototype specification · unverified" : "Confirmed specification"}
          </p>
        </div>
        <dl className="mt-4 divide-y divide-line text-sm">
          {product.specs.map((spec) => (
            <div key={spec.label} className="grid grid-cols-[9rem_1fr] gap-4 py-3">
              <dt>{spec.label}</dt>
              <dd className="text-ash">{spec.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-ash">
          Specifications are published only after a supplier confirms them. Ask a professional piercer about
          compatibility with your existing jewelry.
        </p>
      </section>

      <p className="mt-16 border-t border-line pt-6">
        <Link href="/collections" className="text-link">
          <span aria-hidden="true">←</span> Back to the selection
        </Link>
      </p>
    </div>
    </div>
  );
}
