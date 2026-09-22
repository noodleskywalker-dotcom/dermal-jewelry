// Central, editable brand copy. Working names are not legally cleared (see DERMAL_MASTER_BRIEF.md §04).
export const site = {
  brand: "DERMAL",
  tagline: "Distinctive facial jewelry. Preview your placement. Build your look.",
  collection: {
    slug: "desert-eye",
    number: "001",
    title: "DESERT EYE",
  },
  /** Original and anime-inspired designs sit side by side. Neither is an official collaboration. */
  collections: [
    // `stage: "light"` marks a story-driven collection page on paper, which also gets the light navigation bar.
    { slug: "desert-eye", number: "001", title: "DESERT EYE", blurb: "Shapes taken from sand and wind.", stage: "light" },
    { slug: "originals", number: "002", title: "ORIGINALS", blurb: "Quiet, product-led forms.", stage: "dark" },
  ],
  /**
   * Original designs that exist only as a direction. A working name and a sentence, nothing else:
   * no artwork, no price, nothing to buy. See docs/production/PRODUCTION_PLAN.md, section 6.
   */
  concepts: [{ name: "KIRI", kind: "Original", status: "Concept", note: "Reduced blade geometry. A concept form, not a product: in design, nothing to order." }],
  currency: "QAR",
  nav: [
    { href: "/shop", label: "Shop" },
    { href: "/face-studio", label: "Face Studio" },
    { href: "/collections", label: "Collections" },
    { href: "/about", label: "About" },
  ],
} as const;

export type CommerceMode = "preview" | "waitlist" | "live";

// Only preview is implemented in Milestone 1. The server refuses checkout unless this is "live",
// and live checkout itself does not exist yet.
export function getCommerceMode(): CommerceMode {
  const raw = process.env.DERMAL_COMMERCE_MODE;
  return raw === "live" || raw === "waitlist" ? raw : "preview";
}
