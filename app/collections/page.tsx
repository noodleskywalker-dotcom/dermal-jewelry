import type { Metadata } from "next";
import Link from "next/link";
import { SelectionRail } from "@/components/catalog/SelectionRail";
import { WaysIn } from "@/components/catalog/WaysIn";
import { CommissionCta } from "@/components/commission/CommissionCta";
import { catalog } from "@/lib/catalog";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "Selection" };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// The selection: every design family, browsed sideways on one stage each. An address may name the
// family to open on. There is one browser here and not two: the ways into the catalogue are text
// under it, so nothing competes with the pieces themselves.
export default async function SelectionPage({ searchParams }: PageProps<"/collections">) {
  const query = await searchParams;
  return (
    <div className="gallery">
      <h1 className="sr-only">The selection</h1>
      <p className="label-xs px-6 pt-10 sm:px-10 lg:px-16 lg:pt-16">The pieces</p>
      <SelectionRail products={catalog.listProducts()} concepts={site.concepts} initialSlug={first(query.family)} />
      <section aria-labelledby="ways-heading" className="pb-4">
        <h2 id="ways-heading" className="sr-only">Ways in</h2>
        <WaysIn />
      </section>
      <nav aria-label="Collections" className="mx-auto flex max-w-[120rem] flex-wrap gap-x-8 border-t border-line px-6 py-5 sm:px-10 lg:px-16">
        {site.collections.map((collection) => (
          <Link key={collection.slug} href={`/collections/${collection.slug}`} className="text-link">
            View {collection.title} <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </nav>
      <div className="commission-cta-section">
        <CommissionCta />
      </div>
    </div>
  );
}
