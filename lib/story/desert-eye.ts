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
  microReactionMs: 1200,
  slots: [
    {
      id: "character",
      kind: "character",
      aspect: 1792 / 2400,
      brief: "Full standing character on a transparent background, facing the jewelry. Today only a half-length still with a background exists.",
    },
    {
      id: "closeup",
      kind: "closeup",
      aspect: 1373 / 1145,
      brief: "Extreme close-up of the eye and temple with room for the anti-eyebrow pair, drawn without jewelry so the product overlay is the only jewelry.",
    },
    { id: "sand", kind: "sand", aspect: 1792 / 2400, brief: "Flat, even sand field that can fill the whole viewport as the hidden cut." },
    { id: "video", kind: "video", aspect: 16 / 9, brief: "The 0.0 to 5.5 second action, ending on full sand. No jewelry in the footage." },
  ],
  beats: [
    { id: "stance", from: 0, to: 0.8, caption: "Leaves the idle stance" },
    { id: "exchange", from: 0.8, to: 3.5, caption: "Attack, sand defence, counter, opponent pushed away" },
    { id: "erupt", from: 3.5, to: 4.7, caption: "Sand erupts toward the camera" },
    { id: "fill", from: 4.7, to: 5.5, caption: "Sand fills the frame: the hidden cut" },
    { id: "closeup", from: 5.5, to: 6.5, caption: "Close-up of the eye and temple, jewelry worn" },
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
      zoom: 2.6,
      anchor: { x: 0.511, y: 0.299 },
      scale: 0.026,
      caption: "Cheekbone, concept placement",
    },
    nose: {
      slot: "character",
      x: 0.39,
      y: 0.29,
      zoom: 3,
      anchor: { x: 0.397, y: 0.3 },
      scale: 0.012,
      caption: "Nose",
    },
  },
  scatter: [
    { productSlug: "desert-eye-love", formId: "anti-eyebrow", x: 46, y: 50, size: 15, tilt: -4 },
    { productSlug: "desert-eye-love", formId: "micro-dermal", x: 78, y: 24, size: 8, tilt: 6 },
    { productSlug: "desert-eye-love", formId: "nose", x: 82, y: 70, size: 6, tilt: -3 },
    { productSlug: "sand-vortex", formId: "anti-eyebrow", x: 30, y: 82, size: 13, tilt: 5 },
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
