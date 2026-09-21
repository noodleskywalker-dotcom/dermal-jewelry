import type { CollectionStory } from "./types";

// DESERT EYE. The character is INTERNAL concept material pending a rights review.
// A production build never receives its pictures or its name: it draws labelled placeholders.
// To change the character, the effect footage or a close-up, change this file and the supplied media only.
//
// Direction since 21 September 2026: he sits calmly beside the products. A press sends sand from his
// gourd across the page, and the cut to the close-up happens under it. No opponent, no fight.
export const desertEyeStory: CollectionStory = {
  collection: "desert-eye",
  productSlug: "desert-eye-love",
  publicCharacterLabel: "Story character",
  internal: {
    character: "Gaara",
    opponent: "",
    notice: "Internal concept prototype. Not an official collaboration and not cleared for publication.",
  },
  microReactionMs: 1000,
  storyLabel: "Story 01",
  slots: [
    {
      id: "character",
      kind: "character",
      aspect: 1,
      ground: "white",
      brief: "Owner-approved internal still (21 September 2026): seated, whole figure, original gourd behind him, plain white ground. A transparent cutout would still be better.",
    },
    {
      id: "closeup",
      kind: "closeup",
      aspect: 2304 / 1856,
      brief: "Owner-approved internal still (21 September 2026): clean eye and temple with NO jewelry, so the product overlay is the only jewelry.",
    },
    {
      id: "portrait",
      kind: "character",
      aspect: 1792 / 2400,
      brief: "Half-length internal still, used only to frame the nose and cheekbone until form-specific close-ups exist.",
    },
    { id: "sand", kind: "sand", aspect: 1792 / 2400, brief: "Flat, even sand field." },
    {
      id: "sandfx",
      kind: "effect",
      aspect: 1280 / 720,
      brief: "Generic sand effect on blue, no character in it, keyed in the browser. A cleaner take would enter from a point inside the frame on a truly flat ground.",
    },
  ],
  // Measured from the clip itself (references/generated/stage2/07-analysis.json), not from its prompt.
  effect: {
    slot: "sandfx",
    width: 1280,
    height: 720,
    startAt: 0.6,
    // The model ignored "a quarter in from the left": the stream enters at the left edge, at floor height.
    emission: { x: 0.012, y: 0.74 },
    // Top of the cork stopper on the seated picture.
    origin: { x: 0.31, y: 0.255 },
    // Pinned to the gourd while it is a ribbon. When it bursts, at about 2.6 s, it drops to the ground
    // the figure sits on, where the footage's own floor then lines up with the page.
    settleFrom: 2.5,
    settleTo: 3.7,
    coveredAt: 4.7,
    edgeFeather: 0.02,
    floor: { y: 0.762, until: 2.5 },
    // The generated ground is a blue studio with a gradient, a floor and shadows, not a flat key. The key
    // colour is the median corner of the first frame; the matte itself does not depend on it.
    key: { key: [42 / 255, 90 / 255, 124 / 255], solidAt: -0.3, clearAt: 0.1 },
  },
  // The still is held, sand leaves the gourd, spreads, covers the page, and the cut happens under it.
  beats: [
    { id: "hold", from: 0, to: 0.6, title: "Still", caption: "The seated figure, still" },
    { id: "flow", from: 0.6, to: 2.8, title: "Sand", caption: "Sand rises from the gourd" },
    { id: "spread", from: 2.8, to: 5.3, title: "Sand", caption: "The sand spreads toward the viewer" },
    { id: "cover", from: 5.3, to: 5.7, title: "Sand", caption: "Sand covers the page: the hidden cut" },
    { id: "closeup", from: 5.7, to: 6.9, title: "The eye", caption: "Close-up of the eye and temple, jewelry worn" },
  ],
  focus: {
    "anti-eyebrow": {
      slot: "closeup",
      // Looks at the pair. A wide panel still shows the whole eye; a tall phone shows the eye's corner and the pair.
      x: 0.63,
      y: 0.58,
      zoom: 1,
      // Below and outside the outer corner of the eye, on clean skin.
      anchor: { x: 0.635, y: 0.665 },
      scale: 0.23,
      caption: "Eye and temple",
    },
    "micro-dermal": {
      slot: "portrait",
      x: 0.45,
      y: 0.26,
      zoom: 2.3,
      anchor: { x: 0.511, y: 0.299 },
      // Drawn a little larger than life so the piece can be read at this crop. It is a concept view, not a fitting.
      scale: 0.036,
      // The half-length portrait is 1792 px wide. A smaller window keeps this crop near its real pixels.
      inset: 0.64,
      caption: "Cheekbone, concept placement",
    },
    nose: {
      slot: "portrait",
      x: 0.39,
      y: 0.29,
      zoom: 2.6,
      anchor: { x: 0.397, y: 0.3 },
      scale: 0.02,
      inset: 0.64,
      caption: "Nose",
    },
  },
  scatter: [
    { productSlug: "desert-eye-love", formId: "anti-eyebrow", x: 60, y: 56, size: 15, tilt: -4 },
    { productSlug: "desert-eye-love", formId: "micro-dermal", x: 88, y: 17, size: 8, tilt: 6 },
    { productSlug: "desert-eye-love", formId: "nose", x: 90, y: 70, size: 6, tilt: -3 },
    { productSlug: "sand-vortex", formId: "anti-eyebrow", x: 34, y: 74, size: 11, tilt: 5 },
  ],
  readiness: {
    interactionImplemented: true,
    storyboardPrepared: true,
    characterMedia: "internal-concept",
    sourceVideo: "missing",
    rightsCleared: false,
    approvedForPublication: false,
  },
};
