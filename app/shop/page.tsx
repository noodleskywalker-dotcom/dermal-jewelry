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
    <div className="mx-auto max-w-[90rem] px-5 py-14 sm:px-8">
      <p className="eyebrow">Shop</p>
      <h1 className="mt-3 font-display text-5xl leading-none sm:text-7xl">All pieces</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-ash">
        Four demo pieces. Prices are placeholders and nothing can be ordered yet.
      </p>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-y border-line py-5">
        <nav aria-label="Filter by placement">
          <ul className="flex flex-wrap gap-2">
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

        <form action="/shop" method="get" role="search" className="flex gap-2">
          {placement && <input type="hidden" name="placement" value={placement} />}
          <label htmlFor="shop-search" className="sr-only">Search pieces</label>
          <input
            id="shop-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search pieces"
            maxLength={60}
            className="min-h-11 w-48 border border-line bg-ink px-3 text-sm placeholder:text-ash"
          />
          <button type="submit" className="min-h-11 border border-line px-4 text-xs uppercase tracking-[0.2em] hover:border-ivory">
            Search
          </button>
        </form>
      </div>

      {products.length > 0 ? (
        <div className="mt-12">
          <ProductGrid products={products} />
        </div>
      ) : (
        <div className="py-24 text-center" data-testid="shop-empty">
          <p className="font-display text-3xl">No pieces here yet.</p>
          <p className="mt-3 text-sm text-ash">
            {query ? `Nothing matches “${query}”.` : "This placement doesn’t have pieces in the preview."}
          </p>
          <Link href="/shop" className="mt-8 inline-flex min-h-11 items-center border border-ivory px-6 text-xs uppercase tracking-[0.22em] hover:bg-ivory hover:text-ink">
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
      className={`inline-flex min-h-11 items-center border px-4 text-xs uppercase tracking-[0.18em] transition-colors duration-200 ${
        current ? "border-ivory text-ivory" : "border-line text-ash hover:border-ash"
      }`}
    >
      {children}
    </Link>
  );
}
