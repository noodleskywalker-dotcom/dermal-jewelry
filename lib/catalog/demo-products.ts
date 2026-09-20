import type { Placement, Product } from "./types";

export const placements: Placement[] = [
  { id: "anti-eyebrow", label: "Anti-eyebrow", note: "Below and outside the outer corner of the eye." },
  { id: "dermal", label: "Dermal", note: "Single-point surface placements." },
  { id: "eyebrow", label: "Eyebrow", note: "No pieces in this preview yet." },
  { id: "nostril", label: "Nostril", note: "No pieces in this preview yet." },
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

// Demo prices come from earlier concepts and are placeholders only (brief §06).
export const demoProducts: Product[] = [
  {
    id: "demo-desert-eye-love",
    slug: "desert-eye-love",
    title: "DESERT EYE — LOVE",
    collection: "desert-eye",
    placements: ["anti-eyebrow"],
    isDemo: true,
    demoPrice: 390,
    currency: "QAR",
    summary: "An asymmetrical pair: an openwork symbol above, a deep-red faceted gemstone below.",
    story:
      "Two small pieces set on a diagonal. The upper, outer piece is an openwork symbol with a deep-red accent. The lower, inner piece is a small deep-red faceted gemstone in a claw setting. Together they read as one composition.",
    packageContents: "Package contents are not confirmed yet. This concept shows two decorative tops.",
    components: [
      { id: "symbol", label: "Symbol (upper, outer)", art: "love-symbol", x: 0.3, y: -0.2, size: 0.48 },
      { id: "gem", label: "Gemstone (lower, inner)", art: "garnet-gem", x: -0.28, y: 0.2, size: 0.2 },
    ],
    defaultScale: 0.12,
    defaultRotation: 0,
    specs: [
      { label: "Stone", value: "Deep-red faceted gemstone. Identity not yet verified.", status: "unverified" },
      ...unverifiedSpecs(),
    ],
  },
  {
    id: "demo-sand-vortex",
    slug: "sand-vortex",
    title: "SAND VORTEX",
    collection: "desert-eye",
    placements: ["anti-eyebrow"],
    isDemo: true,
    demoPrice: 350,
    currency: "QAR",
    summary: "A wind-cut spiral paired with a plain polished point.",
    story: "A spiral drawn the way wind marks sand, set above a small polished point.",
    packageContents: "Package contents are not confirmed yet. This concept shows two decorative tops.",
    components: [
      { id: "spiral", label: "Spiral (upper, outer)", art: "vortex", x: 0.28, y: -0.2, size: 0.42 },
      { id: "point", label: "Point (lower, inner)", art: "vortex-stud", x: -0.28, y: 0.2, size: 0.18 },
    ],
    defaultScale: 0.12,
    defaultRotation: 0,
    specs: unverifiedSpecs(),
  },
  {
    id: "demo-crimson-orbit",
    slug: "crimson-orbit",
    title: "CRIMSON ORBIT",
    collection: "desert-eye",
    placements: ["dermal"],
    isDemo: true,
    demoPrice: 220,
    currency: "QAR",
    summary: "A deep-red centre held inside a fine open ring.",
    story: "One point, one ring. The ring stands off the centre so light passes between them.",
    packageContents: "Package contents are not confirmed yet. This concept shows one decorative top.",
    components: [{ id: "orbit", label: "Orbit top", art: "orbit", x: 0, y: 0, size: 0.6 }],
    defaultScale: 0.07,
    defaultRotation: 0,
    specs: [
      { label: "Stone", value: "Deep-red faceted gemstone. Identity not yet verified.", status: "unverified" },
      ...unverifiedSpecs(),
    ],
  },
  {
    id: "demo-void-stud",
    slug: "void-stud",
    title: "VOID STUD",
    collection: "desert-eye",
    placements: ["dermal"],
    isDemo: true,
    demoPrice: 190,
    currency: "QAR",
    summary: "A matte black disc inside a polished rim.",
    story: "The quietest piece in the collection. A dark centre, a bright edge.",
    packageContents: "Package contents are not confirmed yet. This concept shows one decorative top.",
    components: [{ id: "void", label: "Void top", art: "void", x: 0, y: 0, size: 0.5 }],
    defaultScale: 0.07,
    defaultRotation: 0,
    specs: unverifiedSpecs(),
  },
];
