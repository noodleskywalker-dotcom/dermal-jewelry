import type { Metadata } from "next";
import Link from "next/link";
import { SelectionRail } from "@/components/catalog/SelectionRail";
import { catalog } from "@/lib/catalog";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "Selection" };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// The selection: every design family, browsed sideways. An address may name the family to open on.
export default async function SelectionPage({ searchParams }: PageProps<"/collections">) {
  const query = await searchParams;
  return (
    <div className="story-light">
      <header className="mx-auto flex max-w-[110rem] flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-5 pt-8 sm:px-8 lg:px-12 lg:pt-10">
        <h1 className="font-display text-4xl font-light leading-none sm:text-5xl">The selection</h1>
        <p className="label-xs text-ink/55">Swipe, or use the arrows · original and anime-inspired designs</p>
      </header>
      <SelectionRail products={catalog.listProducts()} initialSlug={first(query.family)} />
      <nav aria-label="Collections" className="mx-auto flex max-w-[110rem] flex-wrap gap-x-8 border-t border-ink/15 px-5 py-5 sm:px-8 lg:px-12">
        {site.collections.map((collection) => (
          <Link key={collection.slug} href={`/collections/${collection.slug}`} className="text-link">
            View {collection.title} <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
