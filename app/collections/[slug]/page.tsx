import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CollectionStage } from "@/components/story/CollectionStage";
import { OriginalsStrip } from "@/components/story/OriginalsStrip";
import { catalog } from "@/lib/catalog";
import { site } from "@/lib/config/site";
import { internalStoryMedia, isInternalReview, storyFor, storyForBuild } from "@/lib/story/registry";

const find = (slug: string) => site.collections.find((c) => c.slug === slug);
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function generateStaticParams() {
  return site.collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const collection = find(slug);
  return collection ? { title: `Collection ${collection.number} — ${collection.title}` } : {};
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const collection = find(slug);
  if (!collection) notFound();
  const products = catalog.listProducts().filter((p) => p.collection === slug);

  // A story-driven collection replaces the product-card grid with its character-led stage.
  // Internal concept media and working names reach the page only on a development server.
  const story = storyFor(slug);
  if (story) {
    const query = await searchParams;
    const internal = isInternalReview();
    // The brand is not anime only: original designs follow every story-driven stage.
    const originals = catalog.listProducts().filter((p) => p.origin === "original" && p.collection !== slug);
    return (
      <>
        <CollectionStage
          story={storyForBuild(story, internal)}
          collection={collection}
          products={products}
          media={internalStoryMedia(story, internal)}
          internal={internal}
          initialProduct={first(query.product)}
          initialForm={first(query.form)}
          continuesId="originals"
        />
        <OriginalsStrip id="originals" products={originals} />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-[90rem] px-5 py-14 sm:px-8">
      <p className="label-xs text-ash">Collection {collection.number}</p>
      <h1 className="mt-3 font-display text-6xl font-light leading-none sm:text-8xl">{collection.title}</h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-ash">
        {collection.blurb} Concept pieces with demo prices. Materials, dimensions and compatibility are not verified yet.
      </p>
      <div className="mt-14">
        <ProductGrid products={products} className="grid grid-cols-1 gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-3" />
      </div>
    </div>
  );
}
