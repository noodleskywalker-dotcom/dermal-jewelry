import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { catalog, placements } from "@/lib/catalog";
import type { PlacementId } from "@/lib/catalog/types";

export const metadata: Metadata = { title: "Shop" };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const placementParam = first(params.placement);
  const placement = placements.find((p) => p.id === placementParam)?.id as PlacementId | undefined;
  const query = (first(params.q) ?? "").trim().slice(0, 60);

  let products = placement ? catalog.listByPlacement(placement) : catalog.listProducts();
  if (query) {
    const q = query.toLowerCase();
    products = products.filter((p) => `${p.title} ${p.summary}`.toLowerCase().includes(q));
  }

  const hrefFor = (id?: PlacementId) => {
    const sp = new URLSearchParams();
    if (id) sp.set("placement", id);
    if (query) sp.set("q", query);
    const qs = sp.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <div className="mx-auto max-w-[120rem] px-6 pb-32 pt-12 sm:px-10 lg:px-16 lg:pt-20">
      <p className="label-xs text-ash">Shop · Demo prices · Nothing can be ordered yet</p>
      <h1 className="mt-6 font-display text-[clamp(3.25rem,7.2vw,7.5rem)] font-light leading-[0.98] tracking-[-0.01em]">All pieces</h1>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-x-10 gap-y-4 lg:mt-16">
        <nav aria-label="Filter by placement">
          <ul className="flex flex-wrap gap-x-6">
            <li>
              <FilterLink href={hrefFor()} current={!placement}>All</FilterLink>
            </li>
            {placements.map((p) => (
              <li key={p.id}>
                <FilterLink href={hrefFor(p.id)} current={placement === p.id}>{p.label}</FilterLink>
              </li>
            ))}
          </ul>
        </nav>

        <form action="/shop" method="get" role="search" className="flex items-end gap-3">
          {placement && <input type="hidden" name="placement" value={placement} />}
          <label htmlFor="shop-search" className="sr-only">Search pieces</label>
          <input
            id="shop-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search pieces"
            maxLength={60}
            className="label-xs min-h-11 w-44 border-0 border-b border-line bg-transparent px-0 placeholder:text-ash focus:border-ink focus:outline-none focus-visible:border-garnet"
          />
          <button type="submit" className="label-xs min-h-11 px-2 text-ash hover:text-ink">
            Search
          </button>
        </form>
      </div>

      {products.length > 0 ? (
        <div className="mt-16 lg:mt-24 lg:px-[6vw]">
          <ProductGrid products={products} />
        </div>
      ) : (
        <div className="py-24 text-center" data-testid="shop-empty">
          <p className="font-display text-3xl">No pieces here yet.</p>
          <p className="mt-3 text-sm text-ash">
            {query ? `Nothing matches “${query}”.` : "This placement doesn’t have pieces in the preview."}
          </p>
          <Link href="/shop" className="btn-line mt-8">
            Show all pieces
          </Link>
        </div>
      )}
    </div>
  );
}

function FilterLink({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={current ? "true" : undefined}
      className={`label-xs inline-flex min-h-11 items-center border-b transition-colors duration-300 ${
        current ? "border-ink text-ink" : "border-transparent text-ash hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
