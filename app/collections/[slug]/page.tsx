import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { catalog } from "@/lib/catalog";
import { site } from "@/lib/config/site";

export function generateStaticParams() {
  return [{ slug: site.collection.slug }];
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return slug === site.collection.slug ? { title: `Collection ${site.collection.number} — ${site.collection.title}` } : {};
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  if (slug !== site.collection.slug) notFound();
  const products = catalog.listProducts().filter((p) => p.collection === slug);

  return (
    <div className="mx-auto max-w-[90rem] px-5 py-14 sm:px-8">
      <p className="eyebrow">Collection {site.collection.number}</p>
      <h1 className="mt-3 font-display text-6xl leading-none sm:text-8xl">{site.collection.title}</h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-ash">
        Shapes taken from sand and wind. Concept pieces with demo prices. Materials, dimensions and compatibility are
        not verified yet.
      </p>
      <div className="mt-14">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
