import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBagButton } from "@/components/cart/AddToBagButton";
import { ProductArtwork } from "@/components/catalog/ProductArtwork";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { TryOnPreview } from "@/components/catalog/TryOnPreview";
import { catalog, formatPrice, placementLabel } from "@/lib/catalog";

export function generateStaticParams() {
  return catalog.listProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = catalog.getProduct(slug);
  return product ? { title: product.title, description: product.summary } : {};
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = catalog.getProduct(slug);
  if (!product) notFound();

  // Related means the same placement first, then the rest of the collection. Never random.
  const others = catalog.listProducts().filter((p) => p.id !== product.id);
  const related = [
    ...others.filter((p) => p.placements.some((pl) => product.placements.includes(pl))),
    ...others.filter((p) => !p.placements.some((pl) => product.placements.includes(pl))),
  ].slice(0, 3);

  return (
    <div className="mx-auto max-w-[90rem] px-5 py-10 sm:px-8">
      <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.18em] text-ash">
        <Link href="/shop" className="hover:text-ivory">Shop</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{product.title}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <ProductArtwork product={product} scale={0.74} className="aspect-[4/5] w-full lg:sticky lg:top-24 lg:self-start" />

        <div>
          <p className="eyebrow">{product.placements.map(placementLabel).join(" · ")} · Demo product</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] sm:text-6xl">{product.title}</h1>
          <p className="mt-5 font-display text-2xl">
            <span className="mr-2 align-middle font-sans text-[0.6875rem] uppercase tracking-[0.2em] text-ash">Demo price</span>
            {formatPrice(product.demoPrice, product.currency)}
          </p>
          <p className="mt-6 text-base leading-relaxed text-ash">{product.story}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <AddToBagButton product={product} />
            <Link
              href={`/face-studio?product=${product.slug}`}
              data-testid="try-it-on"
              className="inline-flex min-h-12 items-center justify-center border border-ivory px-7 text-xs uppercase tracking-[0.22em] transition-colors duration-200 hover:bg-ivory hover:text-ink"
            >
              Try it on
            </Link>
          </div>
          <p className="text-xs leading-relaxed text-ash">
            Demo shopping only. Checkout is disabled and nothing can be ordered.
          </p>

          <section aria-labelledby="included-heading" className="mt-12 border-t border-line pt-6">
            <h2 id="included-heading" className="eyebrow">What&rsquo;s included</h2>
            <p className="mt-3 text-sm leading-relaxed text-ash">{product.packageContents}</p>
          </section>

          <section aria-labelledby="specs-heading" className="mt-8 border-t border-line pt-6">
            <h2 id="specs-heading" className="eyebrow">Specifications</h2>
            <dl className="mt-3 divide-y divide-line text-sm">
              {product.specs.map((spec) => (
                <div key={spec.label} className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                  <dt className="text-ash">{spec.label}</dt>
                  <dd>
                    {spec.value}
                    {spec.status === "unverified" && (
                      <span className="ml-2 whitespace-nowrap text-[0.625rem] uppercase tracking-[0.16em] text-garnet-text">
                        Unverified
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ash">
              Specifications are published only after a supplier confirms them. Ask a professional piercer about
              compatibility with your existing jewelry.
            </p>
          </section>

          <section aria-labelledby="see-heading" className="mt-10 border border-line p-6">
            <h2 id="see-heading" className="font-display text-3xl">See it on you</h2>
            <div className="mt-4 max-w-sm">
              <TryOnPreview product={product} allowUpload />
            </div>
          </section>
        </div>
      </div>

      <section aria-labelledby="related-heading" className="mt-24 border-t border-line pt-12">
        <h2 id="related-heading" className="font-display text-4xl">More from the collection</h2>
        <div className="mt-10">
          <ProductGrid products={related} className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" />
        </div>
      </section>
    </div>
  );
}
