import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { catalog } from "@/lib/catalog";
import { site } from "@/lib/config/site";

const find = (slug: string) => site.collections.find((c) => c.slug === slug);

export function generateStaticParams() {
  return site.collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const collection = find(slug);
  return collection ? { title: `Collection ${collection.number} — ${collection.title}` } : {};
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const collection = find(slug);
  if (!collection) notFound();
  const products = catalog.listProducts().filter((p) => p.collection === slug);

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
