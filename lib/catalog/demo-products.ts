import type { Placement, Product, ProductComponent, ProductForm, RevealConfig } from "./types";

export const placements: Placement[] = [
  { id: "anti-eyebrow", label: "Anti-eyebrow", note: "Below and outside the outer corner of the eye." },
  { id: "dermal", label: "Dermal", note: "Single-point surface placements." },
  { id: "nostril", label: "Nose", note: "Single-point nostril placement." },
  { id: "eyebrow", label: "Eyebrow", note: "No pieces in this preview yet." },
  { id: "septum", label: "Septum", note: "No pieces in this preview yet." },
  { id: "lip", label: "Lip", note: "No pieces in this preview yet." },
];

const UNVERIFIED = "Not yet verified";

function unverifiedSpecs(): Product["specs"] {
  return [
    { label: "Base metal", value: UNVERIFIED, status: "unverified" },
    { label: "Finish", value: UNVERIFIED, status: "unverified" },
    { label: "Dimensions", value: UNVERIFIED, status: "unverified" },
    { label: "Thread system", value: UNVERIFIED, status: "unverified" },
    { label: "Compatible hardware", value: UNVERIFIED, status: "unverified" },
  ];
}

const NO_REVEAL: RevealConfig = {
  mode: "none",
  identity: "none",
  title: "",
  maxSeconds: 0,
  readiness: { playerImplemented: true, storyboardPrepared: false, sourceVideo: "missing", approvedForPublication: false },
};

/** A concept-pending form has no configuration yet: no pieces, no price, nothing to preview or buy. */
function pendingForm(id: ProductForm["id"], label: string, placement: ProductForm["placement"]): ProductForm {
  return {
    id,
    label,
    status: "concept-pending",
    placement,
    components: [],
    defaultScale: 0,
    demoPrice: 0,
    packageContents: "",
    note: "Concept pending. This form has not been designed or approved yet.",
  };
}

type FamilyInput = Omit<Product, "isDemo" | "currency" | "placements" | "demoPrice" | "packageContents" | "components" | "defaultScale" | "defaultRotation" | "audience" | "lines"> &
  Partial<Pick<Product, "audience" | "lines">>;

function family(input: FamilyInput): Product {
  const base = input.forms.find((f) => f.id === input.defaultFormId)!;
  return {
    ...input,
    // Nothing has been assigned to men or women, and nothing is a limited edition: those are the owner's calls.
    audience: input.audience ?? "unisex",
    lines: input.lines ?? ["full", input.origin === "anime-inspired" ? "inspired" : "original"],
    isDemo: true,
    currency: "QAR",
    placements: input.forms.filter((f) => f.status === "available").map((f) => f.placement),
    demoPrice: base.demoPrice,
    packageContents: base.packageContents,
    components: base.components,
    defaultScale: base.defaultScale,
    defaultRotation: 0,
  };
}

const single = (id: string, label: string, art: ProductComponent["art"], size: number): ProductComponent[] => [
  { id, label, art, x: 0, y: 0, size },
];

// Demo prices are placeholders carried over from earlier concepts. They are not selling prices.
export const demoProducts: Product[] = [
  family({
    id: "demo-desert-eye-love",
    slug: "desert-eye-love",
    title: "DESERT EYE — LOVE",
    collection: "desert-eye",
    origin: "anime-inspired",
    summary: "An openwork symbol with a deep-red accent, shown in more than one piercing form.",
    story:
      "One design, several forms. As an anti-eyebrow pair it is two small pieces on a diagonal: an openwork symbol above and outside, a deep-red faceted gemstone below and inside.",
    defaultFormId: "anti-eyebrow",
    forms: [
      {
        id: "anti-eyebrow",
        label: "Anti-eyebrow",
        status: "available",
        placement: "anti-eyebrow",
        components: [
          // Approved default composition. x and y are offsets from the pair's centre in pair units,
          // authored for the wearer's left: +x is outward, +y is down. size is the piece's width.
          { id: "symbol", label: "Symbol (upper, outer)", art: "love-symbol", x: 0.3, y: -0.2, size: 0.48, rotation: 0 },
          // size 0.18, not 0.2: the prototype image is cropped tight to the stone, where the drawn fallback
          // filled only three quarters of its box. 0.18 keeps the stone at the approved 0.37 of the symbol's width.
          { id: "gemstone", label: "Gemstone (lower, inner)", art: "garnet-gem", x: -0.28, y: 0.2, size: 0.18, rotation: 0, symmetric: true },
        ],
        composition: {
          approved: true,
          artClass: "prototype-product-art",
          note: "Symbol upper and outer, gemstone lower and inner, on the approved diagonal. Prototype product art rendered from the repository's vector geometry. It is not manufacturing geometry.",
        },
        defaultScale: 0.12,
        demoPrice: 390,
        packageContents: "Package contents are not confirmed yet. This concept shows two decorative tops.",
        note: "Approved prototype composition: symbol upper and outer, gemstone lower and inner. Not manufacturing-ready.",
      },
      {
        id: "micro-dermal",
        label: "Micro dermal",
        status: "available",
        placement: "dermal",
        components: single("symbol", "Symbol top", "love-symbol", 0.8),
        composition: {
          approved: true,
          artClass: "prototype-product-art",
          note: "Concept-approved as the hollow symbol on its own. It is a single piece, never the pair made smaller. Prototype product art, not manufacturing geometry.",
        },
        defaultScale: 0.055,
        demoPrice: 220,
        packageContents: "Package contents are not confirmed yet. This concept shows one decorative top.",
        note: "Concept-approved single hollow symbol. Not manufacturing-ready: dimensions and hardware are not verified.",
      },
      {
        id: "nose",
        label: "Nose",
        status: "available",
        placement: "nostril",
        // size 0.72, not 0.9, for the same reason as the pair's stone: the tight crop would otherwise draw it a quarter larger.
        components: [{ id: "gemstone", label: "Gemstone top", art: "garnet-gem", x: 0, y: 0, size: 0.72, symmetric: true }],
        composition: {
          approved: true,
          artClass: "prototype-product-art",
          note: "Concept-approved as the deep-red faceted gemstone on its own. It is a single piece, never the pair made smaller. Prototype product art; the stone is not identified.",
        },
        defaultScale: 0.03,
        // Placeholder carried over from the other nose concept. It is not a selling price.
        demoPrice: 190,
        packageContents: "Package contents are not confirmed yet. This concept shows one small decorative top.",
        note: "Concept-approved single deep-red faceted gemstone. Not manufacturing-ready: stone identity, dimensions and hardware are not verified.",
      },
    ],
    reveal: {
      mode: "mini-scene",
      identity: "sand-impact",
      title: "Sand reveal",
      maxSeconds: 8,
      readiness: { playerImplemented: true, storyboardPrepared: true, sourceVideo: "missing", approvedForPublication: false },
    },
    // The same proposal as the material notes on the piece, in words; nothing here is confirmed.
    specs: [
      { label: "Stone", value: "Deep-red faceted gemstone — material not yet confirmed", status: "unverified" },
      { label: "Base metal", value: "Titanium — proposed", status: "unverified" },
      { label: "Finish", value: "Polished — proposed", status: "unverified" },
      ...unverifiedSpecs().filter((s) => !["Base metal", "Finish"].includes(s.label)),
    ],
    // The owner's wording, 21 September 2026. No maker has confirmed any of it, and the stone is not named.
    materials: [
      { id: "metal", label: "Titanium", status: "Proposed" },
      { id: "stone", label: "Deep-red faceted gemstone", status: "Material not yet confirmed" },
      { id: "finish", label: "Polished finish", status: "Proposed" },
    ],
    // The owner's approved product animation (22 September 2026): a sand creature dissolves into sand,
    // the three parts of the anti-eyebrow pair appear separately and assemble, and the completed piece
    // holds. Web versions of the supplied master; the master itself is in `references/`, not here.
    // The words are laid over it when each part seats, never baked in, and nothing is called verified.
    film: {
      forms: ["anti-eyebrow"],
      sources: [
        { src: "/media/product-animation/desert-eye-love/film.webm", type: "video/webm" },
        { src: "/media/product-animation/desert-eye-love/film.mp4", type: "video/mp4" },
      ],
      // The jewelry, not the creature: the film's first frame appears only once it plays.
      poster: "/media/product-animation/desert-eye-love/final.jpg",
      final: "/media/product-animation/desert-eye-love/final.jpg",
      durationSeconds: 8.05,
      captions: [
        { at: 6.0, label: "Deep-red faceted gemstone", status: "Material not yet confirmed" },
        { at: 6.4, label: "Titanium", status: "Proposed" },
        { at: 7.1, label: "Polished finish", status: "Proposed" },
      ],
      classification: "prototype-product-animation",
      approvedForPublication: true,
    },
    // Architecture only. No clip exists, and none may be generated without the owner's approval.
    assembly: { themed: { id: "sand-spirit", description: "A small sand spirit is drawn toward the piece, dissolves into grains, and the grains flow into the jewelry.", status: "not-produced" } },
  }),
  family({
    id: "demo-crimson-orbit",
    slug: "crimson-orbit",
    title: "CRIMSON ORBIT",
    collection: "originals",
    origin: "original",
    summary: "A deep-red centre held inside a fine open ring.",
    story: "One point, one ring. The ring stands off the centre so light passes between them.",
    defaultFormId: "micro-dermal",
    forms: [
      pendingForm("anti-eyebrow", "Anti-eyebrow", "anti-eyebrow"),
      {
        id: "micro-dermal",
        label: "Micro dermal",
        status: "available",
        placement: "dermal",
        components: single("orbit", "Orbit top", "orbit", 0.9),
        defaultScale: 0.05,
        demoPrice: 220,
        packageContents: "Package contents are not confirmed yet. This concept shows one decorative top.",
        note: "Original concept. Dimensions and hardware are not verified.",
      },
      {
        id: "nose",
        label: "Nose",
        status: "available",
        placement: "nostril",
        components: single("orbit", "Orbit top, small", "orbit", 0.9),
        defaultScale: 0.032,
        demoPrice: 190,
        packageContents: "Package contents are not confirmed yet. This concept shows one small decorative top.",
        note: "Original concept, shown smaller for the nostril. Dimensions and hardware are not verified.",
      },
    ],
    reveal: {
      mode: "loop",
      identity: "metal-sweep",
      title: "Metal sweep",
      maxSeconds: 3,
      readiness: { playerImplemented: true, storyboardPrepared: true, sourceVideo: "available", approvedForPublication: false },
    },
    specs: [
      { label: "Stone", value: "Deep-red faceted gemstone. Identity not yet verified.", status: "unverified" },
      ...unverifiedSpecs(),
    ],
  }),
  family({
    id: "demo-sand-vortex",
    slug: "sand-vortex",
    title: "SAND VORTEX",
    collection: "desert-eye",
    origin: "original",
    summary: "A wind-cut spiral paired with a plain polished point.",
    story: "A spiral drawn the way wind marks sand, set above a small polished point.",
    defaultFormId: "anti-eyebrow",
    forms: [
      {
        id: "anti-eyebrow",
        label: "Anti-eyebrow",
        status: "available",
        placement: "anti-eyebrow",
        components: [
          { id: "spiral", label: "Spiral (upper, outer)", art: "vortex", x: 0.28, y: -0.2, size: 0.42 },
          { id: "point", label: "Point (lower, inner)", art: "vortex-stud", x: -0.28, y: 0.2, size: 0.18 },
        ],
        defaultScale: 0.12,
        demoPrice: 350,
        packageContents: "Package contents are not confirmed yet. This concept shows two decorative tops.",
        note: "Original concept. Dimensions and hardware are not verified.",
      },
    ],
    reveal: NO_REVEAL,
    specs: unverifiedSpecs(),
  }),
  family({
    id: "demo-void-stud",
    slug: "void-stud",
    title: "VOID STUD",
    collection: "originals",
    origin: "original",
    summary: "A matte black disc inside a polished rim.",
    story: "The quietest piece. A dark centre, a bright edge.",
    defaultFormId: "micro-dermal",
    forms: [
      {
        id: "micro-dermal",
        label: "Micro dermal",
        status: "available",
        placement: "dermal",
        components: single("void", "Void top", "void", 0.9),
        defaultScale: 0.045,
        demoPrice: 190,
        packageContents: "Package contents are not confirmed yet. This concept shows one decorative top.",
        note: "Original concept. Dimensions and hardware are not verified.",
      },
    ],
    reveal: NO_REVEAL,
    specs: unverifiedSpecs(),
  }),
];
