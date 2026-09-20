import type { Metadata } from "next";
import Link from "next/link";
import { ProductArtwork } from "@/components/catalog/ProductArtwork";
import { catalog } from "@/lib/catalog";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "Collections" };

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-[90rem] px-5 py-14 sm:px-8">
      <p className="label-xs text-ash">Collections</p>
      <h1 className="mt-3 font-display text-5xl font-light leading-none sm:text-7xl">Two collections, so far.</h1>

      {site.collections.map((collection) => {
        const lead = catalog.listProducts().find((p) => p.collection === collection.slug);
        if (!lead) return null;
        return (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className="group mt-12 grid gap-8 border-t border-line pt-10 md:grid-cols-2 md:items-end"
          >
            <ProductArtwork product={lead} scale={0.6} className="aspect-[5/4] w-full" />
            <div>
              <p className="label-xs text-ash">Collection {collection.number}</p>
              <h2 className="mt-3 font-display text-5xl font-light leading-none group-hover:text-garnet-text sm:text-6xl">{collection.title}</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ash">{collection.blurb}</p>
              <span className="text-link mt-4">
                View {collection.title} <span aria-hidden="true">↗</span>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
