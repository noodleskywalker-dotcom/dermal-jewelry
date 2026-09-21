import type { CollectionStory } from "./types";

// DESERT EYE. The character and the opponent are INTERNAL concept material pending a rights review.
// A production build never receives their pictures or their names: it draws labelled placeholders.
// To change the character, the clip or a close-up, change this file and the supplied media only.
export const desertEyeStory: CollectionStory = {
  collection: "desert-eye",
  productSlug: "desert-eye-love",
  publicCharacterLabel: "Story character",
  internal: {
    character: "Gaara",
    opponent: "Rock Lee-inspired opponent",
    notice: "Internal concept prototype. Not an official collaboration and not cleared for publication.",
  },
  microReactionMs: 1000,
  storyLabel: "Story 01",
  face: { x: 0.28, y: 0.15, w: 0.28, h: 0.2 },
  slots: [
    {
      id: "character",
      kind: "character",
      aspect: 1792 / 2400,
      brief: "FULL-STANDING CHARACTER ASSET REQUIRED: transparent background, facing the jewelry. Today only a half-length still with a desert background exists, shown as half-length.",
    },
    {
      id: "closeup",
      kind: "closeup",
      aspect: 1373 / 1145,
      brief: "CLEAN HIGH-RES CLOSE-UP WITHOUT JEWELRY REQUIRED: eye and temple with room for the anti-eyebrow pair, so the product overlay is the only jewelry.",
      // The approved internal reference already shows the pair. It is kept as that reference, untouched.
      paintedJewelry: true,
    },
    { id: "sand", kind: "sand", aspect: 1792 / 2400, brief: "Flat, even sand field that can fill the whole viewport as the hidden cut." },
    { id: "video", kind: "video", aspect: 16 / 9, brief: "The 0.0 to 5.5 second action, ending on full sand. No jewelry in the footage." },
  ],
  beats: [
    { id: "stance", from: 0, to: 0.8, title: "Stance", caption: "Leaves the idle stance" },
    { id: "exchange", from: 0.8, to: 3.5, title: "Exchange", caption: "Attack, sand defence, counter, opponent pushed away" },
    { id: "erupt", from: 3.5, to: 4.7, title: "Eruption", caption: "Sand erupts toward the camera" },
    { id: "fill", from: 4.7, to: 5.5, title: "Sand", caption: "Sand fills the frame: the hidden cut" },
    { id: "closeup", from: 5.5, to: 6.5, title: "The eye", caption: "Close-up of the eye and temple, jewelry worn" },
  ],
  focus: {
    "anti-eyebrow": {
      slot: "closeup",
      x: 0.56,
      y: 0.54,
      zoom: 1.12,
      anchor: { x: 0.66, y: 0.595 },
      scale: 0.2,
      caption: "Eye and temple",
    },
    "micro-dermal": {
      slot: "character",
      x: 0.45,
      y: 0.26,
      zoom: 2.3,
      anchor: { x: 0.511, y: 0.299 },
      // Drawn a little larger than life so the piece can be read at this crop. It is a concept view, not a fitting.
      scale: 0.036,
      // The half-length still is 1792 px wide. A smaller window keeps this crop near its real pixels.
      inset: 0.64,
      caption: "Cheekbone, concept placement",
    },
    nose: {
      slot: "character",
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
