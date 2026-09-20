import Link from "next/link";
import { ProductArtwork } from "@/components/catalog/ProductArtwork";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { catalog, formatPrice, placements } from "@/lib/catalog";
import { site } from "@/lib/config/site";

export default function HomePage() {
  const products = catalog.listProducts();
  const hero = products[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-[90rem] items-end gap-10 px-5 pb-14 pt-16 sm:px-8 lg:grid-cols-[1.3fr_1fr] lg:pb-20 lg:pt-24">
          <div className="rise">
            <p className="eyebrow">
              Collection {site.collection.number} — {site.collection.title}
            </p>
            <h1 className="mt-6 font-display text-[clamp(2.9rem,6.2vw,5.75rem)] leading-[0.92] tracking-tight">
              Your face.
              <br />
              Your placement.
              <br />
              <em className="text-garnet-display">Your piece.</em>
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-ash">
              Distinctive facial jewelry, starting with anti-eyebrow and dermal pieces. Add a photo and preview any
              piece on yourself. The photo never leaves your device.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/face-studio"
                className="inline-flex min-h-13 items-center justify-center bg-ivory px-9 py-4 text-xs uppercase tracking-[0.24em] text-ink transition-colors duration-200 hover:bg-white"
              >
                Enter Face Studio
              </Link>
              <Link
                href={`/collections/${site.collection.slug}`}
                className="inline-flex min-h-13 items-center justify-center border border-ivory px-9 py-4 text-xs uppercase tracking-[0.24em] transition-colors duration-200 hover:bg-ivory hover:text-ink"
              >
                Explore the collection
              </Link>
            </div>
          </div>

          <Link href={`/product/${hero.slug}`} className="group block" aria-label={`View ${hero.title}`}>
            <ProductArtwork
              product={hero}
              scale={0.68}
              className="aspect-[4/5] w-full transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:scale-[1.01]"
            />
            <span className="mt-3 flex items-baseline justify-between text-xs uppercase tracking-[0.2em] text-ash">
              <span>{hero.title}</span>
              <span>Demo {formatPrice(hero.demoPrice, hero.currency)}</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Placement selector */}
      <section aria-labelledby="placements-heading" className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="placements-heading" className="font-display text-4xl sm:text-5xl">
            Shop by placement
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-ash">
            The first pieces are for anti-eyebrow and dermal placements. Other placements follow.
          </p>
        </div>
        <ul className="mt-10 grid grid-cols-2 border-l border-t border-line md:grid-cols-3 lg:grid-cols-6">
          {placements.map((placement) => {
            const count = catalog.listByPlacement(placement.id).length;
            return (
              <li key={placement.id} className="border-b border-r border-line">
                <Link
                  href={`/shop?placement=${placement.id}`}
                  className="group flex h-full min-h-36 flex-col justify-between p-5 transition-colors duration-200 hover:bg-coal"
                >
                  <span className="font-display text-2xl leading-tight group-hover:text-garnet-text">
                    {placement.label}
                  </span>
                  <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-ash">
                    {count > 0 ? `${count} demo ${count === 1 ? "piece" : "pieces"}` : "Coming later"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Collection 001 */}
      <section aria-labelledby="collection-heading" className="border-y border-line bg-coal/40">
        <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-end">
            <div>
              <p className="eyebrow">Collection {site.collection.number}</p>
              <h2 id="collection-heading" className="mt-3 font-display text-5xl leading-none sm:text-7xl">
                {site.collection.title}
              </h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-ash lg:justify-self-end">
              Shapes taken from sand and wind: a spiral, an orbit, a dark still point, and a symbol paired with a
              deep-red stone. These are concept pieces. Materials and dimensions will be published once verified.
            </p>
          </div>
          <div className="mt-14">
            <ProductGrid products={products} />
          </div>
          <p className="mt-10 text-xs leading-relaxed text-ash">
            On a computer, hover or tab to a piece to preview it on your photo. On a phone, use Try on.
          </p>
        </div>
      </section>

      {/* Try-on explanation */}
      <section aria-labelledby="tryon-heading" className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8">
        <h2 id="tryon-heading" className="max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
          See it on you before anything else.
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            ["Add a photo", "Choose a front-facing photo. It opens on your device and is never uploaded."],
            ["Choose a piece", "Every piece in the collection previews on the same photo. No second upload."],
            ["Adjust your look", "Move, scale and rotate. Set each side. Build a look and add it to your bag."],
          ].map(([title, body], i) => (
            <li key={title} className="border-t border-line pt-6">
              <span className="font-display text-5xl text-garnet-display">0{i + 1}</span>
              <h3 className="mt-4 font-display text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ash">{body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <Link
            href="/face-studio"
            className="inline-flex min-h-12 items-center bg-garnet px-8 text-xs uppercase tracking-[0.24em] text-ivory transition-colors duration-200 hover:bg-[#a52a41]"
          >
            Open Face Studio
          </Link>
          <p className="max-w-md text-xs leading-relaxed text-ash">
            The preview is approximate. It does not show real size, and it cannot tell you where a piercing can safely
            go. You can shop without a photo or an account.
          </p>
        </div>
      </section>

      {/* Transparency */}
      <section aria-labelledby="honest-heading" className="border-t border-line">
        <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2">
          <h2 id="honest-heading" className="font-display text-4xl leading-tight sm:text-5xl">
            What we know, and what we don&rsquo;t yet.
          </h2>
          <dl className="space-y-6 text-sm leading-relaxed">
            <div>
              <dt className="eyebrow">Materials and dimensions</dt>
              <dd className="mt-2 text-ash">Not verified yet. Nothing is listed until a supplier confirms it.</dd>
            </div>
            <div>
              <dt className="eyebrow">Compatibility</dt>
              <dd className="mt-2 text-ash">
                Surface bars and dermal anchors are different systems. Compatibility will be stated per piece once
                confirmed.
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Prices</dt>
              <dd className="mt-2 text-ash">Demo prices are placeholders. Checkout is disabled in this preview.</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
