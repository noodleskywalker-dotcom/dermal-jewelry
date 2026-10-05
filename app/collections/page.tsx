import type { Metadata } from "next";
import Link from "next/link";
import { SelectionRail } from "@/components/catalog/SelectionRail";
import { WaysIn } from "@/components/catalog/WaysIn";
import { CommissionCta } from "@/components/commission/CommissionCta";
import { currentFamilySlugs } from "@/components/catalog/editorial";
import { getCatalogue } from "@/lib/commerce/catalog";
import { site } from "@/lib/config/site";
import styles from "@/components/catalog/catalogue.module.css";

export const metadata: Metadata = {
  title: "Collections",
  description: "The design families of DERMAL. Symbolic pieces, original forms and ideas made personal.",
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const identities: Record<string, string> = {
  "desert-eye-love": "An openwork symbol. A deep-red accent. The first DERMAL campaign.",
  "horus-trace": "Ancient symbolism, traced in a new line.",
  "blade-trace": "An object reduced to an edge. A decisive diagonal.",
  crossline: "A quiet line, interrupted by a single crossing mark.",
  "ankh-trace": "An enduring symbol, drawn for a new placement.",
  "japanese-angel": "Characters become form. A study in sharp, open linework.",
  "ankh-eye": "Two eyes meet an ankh. A layered study in symbolism.",
};

export default async function SelectionPage({ searchParams }: PageProps<"/collections">) {
  const [query, { products }] = await Promise.all([searchParams, getCatalogue()]);
  const families = currentFamilySlugs.flatMap((slug) => {
    const product = products.find((piece) => piece.slug === slug);
    return product ? [product] : [];
  });

  return (
    <div className={`gallery ${styles.gallery}`}>
      <header className={styles.galleryHead}>
        <div>
          <p className="label-xs text-ash">DERMAL / Design families</p>
          <h1 className={styles.title}>The selection</h1>
        </div>
        <p className={styles.galleryIntro}>Different points of view. One place for expression. Discover the stories and forms behind DERMAL.</p>
      </header>

      <SelectionRail products={products} concepts={site.concepts} initialSlug={first(query.family)} />

      <section aria-labelledby="ways-heading">
        <h2 id="ways-heading" className="sr-only">Ways in</h2>
        <WaysIn />
      </section>

      <section className={styles.index} aria-labelledby="family-index-title">
        <div className={styles.indexHead}>
          <h2 id="family-index-title" className="label-xs">The family index</h2>
          <p className="label-xs text-ash">{String(families.length).padStart(2, "0")} design directions</p>
        </div>
        <ol className={styles.indexList}>
          {families.map((product, i) => (
            <li key={product.id}>
              <Link href={`/product/${product.slug}`} className={styles.indexLink}>
                <span className={styles.indexNumber}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.indexName}>{product.title}</span>
                <span className={styles.indexDescription}>{identities[product.slug]}</span>
                <span className={styles.indexArrow} aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ol>
        <nav aria-label="Collections" className={styles.collectionNav}>
          {site.collections.map((collection) => (
            <Link key={collection.slug} href={`/collections/${collection.slug}`} className="text-link">
              View {collection.title} <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
      </section>

      <div className={styles.galleryFooter}>
        <div className="commission-cta-section"><CommissionCta /></div>
      </div>
    </div>
  );
}
