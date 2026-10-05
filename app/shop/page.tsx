import type { Metadata } from "next";
import Link from "next/link";
import { CommissionCta } from "@/components/commission/CommissionCta";
import { ProductGrid, type CatalogueLayout } from "@/components/catalog/ProductGrid";
import { type BrowseFilter, matchesBrowse, placements } from "@/lib/catalog";
import { getCatalogue } from "@/lib/commerce/catalog";
import { site } from "@/lib/config/site";
import { editorialOrder } from "@/components/catalog/editorial";
import styles from "@/components/catalog/catalogue.module.css";
import type { PlacementId } from "@/lib/catalog/types";

export const metadata: Metadata = { title: "The collection", description: "Explore DERMAL facial jewelry: symbolic forms, original lines and personal commissions." };

// The catalogue is the brand, not one collection: warm paper, black type, one garnet marker, and a
// stage of roughly equal weight for every piece. DESERT EYE is browsed here like any other family;
// its own world belongs to the homepage opening and to its product page.

// Audience and line, in the owner's order. "Full collection" is the line every piece belongs to.
const BROWSE: { id: BrowseFilter; label: string }[] = [
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "full", label: "Full collection" },
  { id: "inspired", label: "Inspired" },
  { id: "original", label: "Original" },
  { id: "limited", label: "Limited edition" },
];

const VIEWS: { id: CatalogueLayout; label: string }[] = [
  { id: "editorial", label: "Editorial" },
  { id: "even", label: "Grid" },
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const placementParam = first(params.placement);
  const placement = placements.find((p) => p.id === placementParam)?.id as PlacementId | undefined;
  const browseParam = first(params.browse);
  const browse = BROWSE.find((b) => b.id === browseParam)?.id;
  const query = (first(params.q) ?? "").trim().slice(0, 60);
  const view = VIEWS.find((v) => v.id === first(params.view))?.id ?? "editorial";

  // A concept has no placement, no price and no line to filter on, so it is listed only where the
  // catalogue is not being narrowed to something it could not belong to.
  const showConcepts = !placement && !query && (!browse || browse === "full" || browse === "original");

  // One server read of the catalogue, joined to Shopify. It falls back to the editorial catalogue
  // when the store is empty or unreachable, so this page renders either way.
  const { products: catalogue } = await getCatalogue();
  const all = editorialOrder(catalogue);
  let products = placement ? all.filter((p) => p.placements.includes(placement)) : all;
  if (browse) products = products.filter((p) => matchesBrowse(p, browse));
  if (query) {
    const q = query.toLowerCase();
    products = products.filter((p) => `${p.title} ${p.summary}`.toLowerCase().includes(q));
  }

  const hrefFor = (next: { placement?: PlacementId; browse?: BrowseFilter; view?: CatalogueLayout }) => {
    const sp = new URLSearchParams();
    if (next.browse) sp.set("browse", next.browse);
    if (next.placement) sp.set("placement", next.placement);
    if (query) sp.set("q", query);
    const chosen = next.view ?? view;
    if (chosen !== "editorial") sp.set("view", chosen);
    const qs = sp.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <div className={`catalogue-page ${styles.page}`}>
      <header className={styles.head}>
        <div>
          <p className="label-xs text-ash">DERMAL / The catalogue</p>
          <h1 className={styles.title}>The collection</h1>
        </div>
        <div className={styles.intro}>
          <p>A symbol. A line. Something entirely yours. Explore our designs and find the form that feels like you.</p>
          <Link href="/collections" className="text-link">Explore the design families <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      <div className={styles.filters} data-testid="catalogue-filters">
        <nav aria-label="Browse the collection">
          <ul className={styles.filterNav}>
            <li>
              <FilterLink href={hrefFor({})} current={!placement && !browse}>
                All
              </FilterLink>
            </li>
            {BROWSE.map((b) => (
              <li key={b.id}>
                <FilterLink href={hrefFor({ browse: b.id })} current={browse === b.id}>
                  {b.label}
                </FilterLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.tools}>
          <nav aria-label="Filter by placement">
            <ul className={styles.filterNav}>
              {placements.map((p) => (
                <li key={p.id}>
                  <FilterLink href={hrefFor({ placement: p.id, browse })} current={placement === p.id} muted>
                    {p.label}
                  </FilterLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.secondaryTools}>
            <nav aria-label="Catalogue view" data-testid="catalogue-view">
              <ul className="flex gap-x-5">
                {VIEWS.map((v) => (
                  <li key={v.id}>
                    <FilterLink href={hrefFor({ placement, browse, view: v.id })} current={view === v.id} muted>
                      {v.label}
                    </FilterLink>
                  </li>
                ))}
              </ul>
            </nav>

            <form action="/shop" method="get" role="search" className="flex items-end gap-3">
              {placement && <input type="hidden" name="placement" value={placement} />}
              {browse && <input type="hidden" name="browse" value={browse} />}
              {view !== "editorial" && <input type="hidden" name="view" value={view} />}
              <label htmlFor="shop-search" className="sr-only">
                Search pieces
              </label>
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
        </div>

      </div>
      <div className={styles.resultLine}>
        <p className="label-xs text-ash" data-testid="catalogue-count" aria-live="polite">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
        {(placement || browse || query) ? (
          <Link href={view === "even" ? "/shop?view=even" : "/shop"} className="label-xs text-ash">Clear filters</Link>
        ) : <p className="label-xs text-ash">Design preview</p>}
      </div>

      {products.length > 0 ? (
        <div className={styles.body}>
          <ProductGrid products={products} layout={view} />
        </div>
      ) : (
        <div className={styles.empty} data-testid="shop-empty">
          <h2>No pieces here yet.</h2>
          <p className="mt-3 text-sm text-ash">
            {query
              ? `Nothing matches “${query}”.`
              : browse === "limited"
                ? "No limited edition has been announced."
                : "This placement doesn’t have pieces in the preview."}
          </p>
          <Link href="/shop" className="btn-line mt-8">
            Show all pieces
          </Link>
        </div>
      )}

      <p className={styles.note}>
        Shown as design renders and concept artwork. Final materials, dimensions and compatibility are still to be confirmed. Prices appear only when confirmed in the catalogue.
      </p>

      {/* An original that exists only as a direction is named here in words, never drawn as a piece
          and never priced. It is not part of the count above, because there is nothing to order. */}
      {showConcepts && (
        <section aria-labelledby="concepts-heading" data-testid="catalogue-concepts" className={styles.concepts}>
          <h2 id="concepts-heading" className="label-xs">
            In design
          </h2>
          <ul>
            {site.concepts.map((concept) => (
              <li key={concept.name} data-concept={concept.name}>
                <p className={styles.conceptName}>{concept.name}</p>
                <p className="label-xs mt-3 text-ash">
                  {concept.kind} · {concept.status}
                </p>
                <p className={styles.conceptNote}>{concept.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="commission-cta-section">
        <CommissionCta />
      </div>
    </div>
  );
}

function FilterLink({
  href,
  current,
  muted,
  children,
}: {
  href: string;
  current: boolean;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "true" : undefined}
      className={`label-xs ${styles.filterLink}${muted ? " text-ash" : ""}`}
    >
      {children}
    </Link>
  );
}
