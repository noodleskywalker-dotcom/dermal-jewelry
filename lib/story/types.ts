import type { FormId } from "@/lib/catalog/types";
import type { KeySettings } from "./chroma-key";

// A collection story is a character-led way into a collection: a character on the page, jewelry
// objects floating beside it, one short cinematic, and a product experience it resolves into.
// Everything a story needs is described here as data, so a character, a clip or a close-up can be
// replaced later without rebuilding the interaction.

/** A picture or clip a story can use. Only its shape lives in the app; the pixels are supplied separately. */
export type StoryMediaSlot = {
  id: string;
  kind: "character" | "closeup" | "sand" | "video" | "effect";
  /** Width divided by height of the source. */
  aspect: number;
  /** What belongs in this slot, written for whoever produces it. */
  brief: string;
  /** "white" marks a picture drawn on a plain white ground, which is dropped into the page by multiplying. */
  ground?: "white" | "scene";
  /**
   * True when the supplied picture already has jewelry painted into it. The product overlay is then
   * withheld and the picture is shown as the prototype reference it is, because drawing the overlay
   * on top gives a double image. A clean picture clears this flag and the overlay returns.
   */
  paintedJewelry?: boolean;
};

/** Where a form is shown on a picture: the framing and the point the jewelry overlay is pinned to. */
export type StoryFocus = {
  slot: string;
  /** Centre of attention, 0 to 1 across the picture. */
  x: number;
  y: number;
  zoom: number;
  /** Centre of the jewelry group on the picture, 0 to 1. */
  anchor: { x: number; y: number };
  /** Width of the jewelry group box as a fraction of the picture width. */
  scale: number;
  /**
   * Height of the picture window as a fraction of the panel, when the source is too small to fill
   * the panel at this zoom without going soft. Omitted means the picture fills the panel.
   */
  inset?: number;
  caption: string;
};

export type StoryBeatId = "hold" | "flow" | "spread" | "cover" | "closeup";

export type StoryBeat = {
  id: StoryBeatId;
  /** Seconds from the start of the cinematic. */
  from: number;
  to: number;
  /** Short storyboard title shown on the concept motion prototype. */
  title: string;
  /** Plain description of the beat, read out by assistive technology. */
  caption: string;
};

/**
 * Effect footage composited over the page: generic sand with no character in it, shot on blue and keyed
 * in the browser. The character is a still picture. Nothing here animates a body or a face.
 */
export type StoryEffect = {
  /** Media slot that holds the footage. */
  slot: string;
  /** Size of the footage in pixels. */
  width: number;
  height: number;
  /** Seconds after the press at which the footage starts. The still is held until then. */
  startAt: number;
  /** Where the sand enters the footage, 0 to 1. Measured from the clip, not taken from its prompt. */
  emission: { x: number; y: number };
  /** Where that point must sit on the character picture, 0 to 1: the opening of the gourd. */
  origin: { x: number; y: number };
  /** Footage seconds over which it moves from "pinned to the origin" to "covering the viewport". */
  settleFrom: number;
  settleTo: number;
  /** Footage second from which every pixel is opaque sand. Measured. */
  coveredAt: number;
  /** Width, 0 to 1, over which the frame edge the sand enters through is softened. */
  edgeFeather: number;
  /** Height of the footage's floor, 0 to 1, and the footage second until which everything below it is hidden. */
  floor: { y: number; until: number };
  key: KeySettings;
};

/** Where one jewelry object floats on the desktop canvas, in percent of the canvas. */
export type ScatterSpot = {
  productSlug: string;
  formId: FormId;
  x: number;
  y: number;
  /** Width of the object in rem at full desktop size. */
  size: number;
  /** Resting tilt in degrees. */
  tilt: number;
};

export type StoryReadiness = {
  interactionImplemented: boolean;
  storyboardPrepared: boolean;
  characterMedia: "missing" | "internal-concept" | "cleared";
  sourceVideo: "missing" | "available";
  rightsCleared: boolean;
  approvedForPublication: boolean;
};

export type CollectionStory = {
  collection: string;
  /** The design the cinematic resolves into. */
  productSlug: string;
  /** Neutral words used in customer-facing builds. They never name a franchise character. */
  publicCharacterLabel: string;
  /** Working names for internal review only. Never shown by a production build. */
  internal: { character: string; opponent: string; notice: string };
  /** Length of the hover hint in milliseconds. It is a hint, never the cinematic. */
  microReactionMs: number;
  /** Customer-facing name of the story, such as "Story 01". */
  storyLabel: string;
  slots: StoryMediaSlot[];
  /** Present when the story uses composited effect footage. */
  effect?: StoryEffect;
  beats: StoryBeat[];
  /** Framing per piercing form of the story's product. */
  focus: Partial<Record<FormId, StoryFocus>>;
  scatter: ScatterSpot[];
  readiness: StoryReadiness;
};

/** Resolved addresses for a story's media slots. Missing entries render labelled placeholders. */
export type StoryMedia = Partial<Record<string, string>>;
