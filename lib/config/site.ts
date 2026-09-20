// Central, editable brand copy. Working names are not legally cleared (see DERMAL_MASTER_BRIEF.md §04).
export const site = {
  brand: "DERMAL",
  tagline: "Distinctive facial jewelry. Preview your placement. Build your look.",
  collection: {
    slug: "desert-eye",
    number: "001",
    title: "DESERT EYE",
  },
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
