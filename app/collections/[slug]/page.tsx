import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CollectionStage } from "@/components/story/CollectionStage";
import { OriginalsStrip } from "@/components/story/OriginalsStrip";
import { getCatalogue } from "@/lib/commerce/catalog";
import { editorialOrder } from "@/components/catalog/editorial";
import { CommissionCta } from "@/components/commission/CommissionCta";
import styles from "@/components/catalog/catalogue.module.css";
import { site } from "@/lib/config/site";
import { internalStoryMedia, isInternalReview, storyFor, storyForBuild } from "@/lib/story/registry";

const find = (slug: string) => site.collections.find((c) => c.slug === slug);
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function generateStaticParams() {
  return site.collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const collection = find(slug);
  return collection ? { title: `Collection ${collection.number} — ${collection.title}` } : {};
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const collection = find(slug);
  if (!collection) notFound();
  const { products: allProducts } = await getCatalogue();
  const products = editorialOrder(allProducts.filter((p) => p.collection === slug));

  // A story-driven collection replaces the product-card grid with its character-led stage.
  // Internal concept media and working names reach the page only on a development server.
  const story = storyFor(slug);
  if (story) {
    const query = await searchParams;
    const internal = isInternalReview();
    // The brand is not anime only: original designs follow every story-driven stage.
    const originals = allProducts.filter((p) => p.origin === "original" && p.collection !== slug);
    return (
      <>
        <CollectionStage
          story={storyForBuild(story, internal)}
          collection={collection}
          products={products}
          media={internalStoryMedia(story, internal)}
          internal={internal}
          initialProduct={first(query.product)}
          initialForm={first(query.form)}
          continuesId="originals"
        />
        <OriginalsStrip id="originals" products={originals} />
      </>
    );
  }

  return (
    <div className={styles.page}>
      <Link href="/collections" className={`label-xs text-ash ${styles.back}`}>← All collections</Link>
      <header className={`${styles.head} ${styles.collectionHead}`}>
        <div>
          <p className="label-xs text-ash">Collection {collection.number} / DERMAL</p>
          <h1 className={styles.title}>{collection.title}</h1>
        </div>
        <p className={styles.intro}>{collection.blurb} Independent points of view, brought together by the face.</p>
      </header>
      <div className={styles.resultLine}>
        <p className="label-xs text-ash">{products.length} design families</p>
        <Link href="/shop" className="label-xs text-ash">View full catalogue</Link>
      </div>
      <ProductGrid products={products} layout="editorial" />
      <p className={styles.note}>Design renders and concept artwork. Final materials, dimensions, compatibility and prices remain pending unless confirmed for a piece.</p>
      <div className="commission-cta-section"><CommissionCta /></div>
    </div>
  );
}
