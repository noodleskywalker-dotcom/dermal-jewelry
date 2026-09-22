import type { Metadata } from "next";
import Link from "next/link";
import { BrowseRail } from "@/components/catalog/BrowseRail";
import { SelectionRail } from "@/components/catalog/SelectionRail";
import { catalog } from "@/lib/catalog";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "Selection" };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// The selection: every design family, browsed sideways. An address may name the family to open on.
export default async function SelectionPage({ searchParams }: PageProps<"/collections">) {
  const query = await searchParams;
  return (
    <div className="gallery">
      <h1 className="sr-only">The selection</h1>
      <section aria-labelledby="browse-heading" className="pt-6 lg:pt-10">
        <h2 id="browse-heading" className="sr-only">Ways in</h2>
        <BrowseRail products={catalog.listProducts()} />
      </section>
      <p className="label-xs px-6 pt-16 sm:px-10 lg:px-16">The pieces</p>
      <SelectionRail products={catalog.listProducts()} concepts={site.concepts} initialSlug={first(query.family)} />
      <nav aria-label="Collections" className="mx-auto flex max-w-[120rem] flex-wrap gap-x-8 border-t border-line px-6 py-5 sm:px-10 lg:px-16">
        {site.collections.map((collection) => (
          <Link key={collection.slug} href={`/collections/${collection.slug}`} className="text-link">
            View {collection.title} <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
