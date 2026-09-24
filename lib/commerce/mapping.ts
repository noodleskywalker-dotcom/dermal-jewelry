import type { Audience, FormId, Line, PlacementId } from "@/lib/catalog/types";

/**
 * How a Shopify record is joined to a DERMAL design family, and how Shopify's own vocabulary maps
 * into the browsing taxonomy the storefront already has.
 *
 * The join is the **handle**, never a position in an array: a product moved, renamed or re-sorted in
 * Shopify must not change which family it belongs to. A family's editorial slug is its handle by
 * default, and an override exists only for a family whose Shopify handle has to differ.
 */

/** Families that are expected to become purchasable. KIRI is deliberately absent: it is a concept. */
export const SELLABLE_FAMILIES = [
  "desert-eye-love",
  "horus-trace",
  "blade-trace",
  "crossline",
  "ankh-trace",
] as const;

/**
 * Editorial slug to Shopify handle. Empty on purpose: every family's handle is its slug today.
 * An entry is added here only when Shopify cannot carry the same handle, and never to paper over a
 * product that simply has not been created yet.
 */
const HANDLE_OVERRIDES: Record<string, string> = {};

export function handleFor(slug: string): string {
  return HANDLE_OVERRIDES[slug] ?? slug;
}

/** The editorial slug a Shopify handle belongs to, or null when nothing in the catalogue claims it. */
export function slugForHandle(handle: string, knownSlugs: readonly string[]): string | null {
  const overridden = Object.entries(HANDLE_OVERRIDES).find(([, h]) => h === handle)?.[0];
  if (overridden) return overridden;
  return knownSlugs.includes(handle) ? handle : null;
}

/**
 * Shopify tags to the browsing taxonomy. Tags are matched case-insensitively and may be written
 * either bare (`inspired`) or namespaced (`line:inspired`), because a merchant will type both.
 *
 * This exists so Shopify *can* drive the taxonomy later without the storefront's categories
 * changing. Nothing reads it yet in anger: the editorial record is still the source of the
 * taxonomy, and a tag only ever adds to it. A tag can never remove a family from a filter.
 */
const LINE_TAGS: Record<string, Line> = {
  inspired: "inspired",
  original: "original",
  signature: "signature",
  symbolic: "symbolic",
  ancient: "ancient",
  weapon: "weapon",
  "weapon-form": "weapon",
  featured: "featured",
  limited: "limited",
  "limited-edition": "limited",
};

const PLACEMENT_TAGS: Record<string, PlacementId> = {
  "anti-eyebrow": "anti-eyebrow",
  antieyebrow: "anti-eyebrow",
  dermal: "dermal",
  "micro-dermal": "dermal",
  nose: "nostril",
  nostril: "nostril",
  eyebrow: "eyebrow",
  septum: "septum",
  lip: "lip",
};

const AUDIENCE_TAGS: Record<string, Audience> = {
  men: "men",
  mens: "men",
  women: "women",
  womens: "women",
  unisex: "unisex",
};

const FORM_TAGS: Record<string, FormId> = {
  "anti-eyebrow": "anti-eyebrow",
  "micro-dermal": "micro-dermal",
  "micro dermal": "micro-dermal",
  dermal: "micro-dermal",
  nose: "nose",
  nostril: "nose",
};

function normalizeTag(tag: string): string {
  // "Line: Inspired" and "inspired" must mean the same thing.
  const bare = tag.includes(":") ? tag.slice(tag.indexOf(":") + 1) : tag;
  return bare.trim().toLowerCase().replace(/\s+/g, "-");
}

export function linesFromTags(tags: string[]): Line[] {
  const found = new Set<Line>();
  for (const tag of tags) {
    const line = LINE_TAGS[normalizeTag(tag)];
    if (line) found.add(line);
  }
  return [...found];
}

export function placementsFromTags(tags: string[]): PlacementId[] {
  const found = new Set<PlacementId>();
  for (const tag of tags) {
    const placement = PLACEMENT_TAGS[normalizeTag(tag)];
    if (placement) found.add(placement);
  }
  return [...found];
}

export function audienceFromTags(tags: string[]): Audience | null {
  for (const tag of tags) {
    const audience = AUDIENCE_TAGS[normalizeTag(tag)];
    if (audience) return audience;
  }
  return null;
}

/**
 * The editorial form a Shopify variant sells, read from its options, or null when nothing says.
 *
 * Null is the normal answer and not a failure. A visual form is not a purchasable variant: until a
 * real variant names a form, the storefront must not claim one can be bought.
 */
export function formFromVariantOptions(options: { name: string; value: string }[]): FormId | null {
  for (const option of options) {
    if (!/^(form|placement|style|type)$/i.test(option.name.trim())) continue;
    const form = FORM_TAGS[normalizeTag(option.value)];
    if (form) return form;
  }
  return null;
}

/**
 * The proposed metafield schema, documented here and read defensively by the normalizer. No
 * definition has been created in Shopify, and none will be without approval; every key is optional
 * and a missing one changes nothing.
 */
export const METAFIELD_SCHEMA = {
  namespace: "dermal",
  keys: {
    family: "single_line_text_field — the editorial slug this product belongs to, when it differs from the handle",
    placement: "single_line_text_field — anti-eyebrow | dermal | nose | eyebrow | septum | lip",
    gender: "single_line_text_field — men | women | unisex, for browsing only",
    collection_type: "single_line_text_field — inspired | original | signature | symbolic | ancient | weapon | limited",
    featured: "boolean — carries the small Featured marker",
    form: "single_line_text_field — anti-eyebrow | micro-dermal | nose, when a product sells exactly one form",
    material_status: "single_line_text_field — pending | proposed | confirmed. Anything but confirmed keeps the pending wording",
    tryon_asset: "single_line_text_field — reserved; try-on artwork stays in the repository for now",
    catalogue_asset: "single_line_text_field — reserved; catalogue artwork stays in the repository for now",
  },
} as const;
