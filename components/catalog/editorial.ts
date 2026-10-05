import type { Product } from "@/lib/catalog/types";

/** Presentation order only. Earlier studies stay in the catalogue and remain searchable. */
export const currentFamilySlugs = [
  "desert-eye-love",
  "horus-trace",
  "blade-trace",
  "crossline",
  "ankh-trace",
  "japanese-angel",
  "ankh-eye",
] as const;

const earlierStudies = new Set(["crimson-orbit", "sand-vortex", "void-stud"]);

export function isEarlierStudy(product: Product): boolean {
  return earlierStudies.has(product.slug);
}

export function editorialOrder<T extends Product>(products: T[]): T[] {
  const rank = (product: T) => {
    const index = currentFamilySlugs.findIndex((slug) => slug === product.slug);
    return index < 0 ? currentFamilySlugs.length : index;
  };
  return [...products].sort((a, b) => rank(a) - rank(b));
}
