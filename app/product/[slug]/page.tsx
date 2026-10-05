import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FamilyExperience } from "@/components/catalog/FamilyExperience";
import { catalog } from "@/lib/catalog";
import { getDermalProduct } from "@/lib/commerce/catalog";
import { canonicalOrigin } from "@/lib/config/metadata";
import { editorialPreviewUrl } from "@/lib/story/editorial-preview";
import "./product-remodel.css";

export function generateStaticParams() {
  return catalog.listProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getDermalProduct(slug);
  if (!product) return {};
  const origin = canonicalOrigin();
  return {
    title: product.title,
    description: product.summary,
    alternates: origin ? { canonical: new URL(`/product/${slug}`, origin).href } : undefined,
    openGraph: {
      title: product.title,
      description: product.summary,
      ...(origin && product.render ? { images: [{ url: new URL(product.render.catalogue.src, origin).href, alt: product.render.alt }] } : {}),
    },
  };
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
  const product = await getDermalProduct(slug);
  if (!product) notFound();

  return (
    <div className="story-light product-remodel">
    <div className="pdp-page">
      <nav aria-label="Breadcrumb" className="label-xs pdp-crumb text-ash">
        <Link href="/collections" className="hover:text-ink">Collections</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{product.title}</span>
      </nav>

      <div>
        <FamilyExperience
          product={product}
          initialFormId={first(query.form)}
          fixtureSrc={fixtureFor(first(query.revealFixture))}
          concept={conceptFor(first(query.revealFixture), slug)}
          editorialDetailSrc={slug === "desert-eye-love" ? editorialPreviewUrl("gaara-detail") : undefined}
          editorialReferenceSrc={slug === "ankh-trace" ? editorialPreviewUrl("ankh-reference") : slug === "crossline" ? editorialPreviewUrl("crossline-reference") : undefined}
        />
      </div>

    </div>
    </div>
  );
}
