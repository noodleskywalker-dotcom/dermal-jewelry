import type { Metadata } from "next";
import Link from "next/link";
import { ProductArtwork } from "@/components/catalog/ProductArtwork";
import { catalog } from "@/lib/catalog";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "Collections" };

export default function CollectionsPage() {
  const hero = catalog.listProducts()[0];
  return (
    <div className="mx-auto max-w-[90rem] px-5 py-14 sm:px-8">
      <p className="eyebrow">Collections</p>
      <h1 className="mt-3 font-display text-5xl leading-none sm:text-7xl">One collection, so far.</h1>

      <Link href={`/collections/${site.collection.slug}`} className="group mt-12 grid gap-8 border-t border-line pt-10 md:grid-cols-2 md:items-end">
        <ProductArtwork product={hero} scale={0.7} className="aspect-[5/4] w-full" />
        <div>
          <p className="eyebrow">Collection {site.collection.number}</p>
          <h2 className="mt-3 font-display text-5xl leading-none group-hover:text-garnet-text sm:text-6xl">
            {site.collection.title}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ash">
            Four concept pieces for anti-eyebrow and dermal placements.
          </p>
          <span className="mt-6 inline-block text-xs uppercase tracking-[0.22em] underline underline-offset-8">
            View the collection
          </span>
        </div>
      </Link>
    </div>
  );
}
