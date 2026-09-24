import type { StoryEffect } from "./types";

// The one generic sand clip, and everything measured from it. It contains no character. Where the sand
// must appear on a page (`origin`) belongs to the picture it is composited over, so it is added by the user.
// Measured from the clip itself (references/generated/stage2/07-analysis.json), not from its prompt.
/**
 * The local transition, composed on this machine from two clips generated here on 23 September 2026:
 * a ribbon that pours from a point, and a full-frame wipe faded in over it while the grains are
 * densest, so the join is hidden inside the sand. Measured from the composed clip itself: the stream
 * enters the frame at (0.17, 0.02) and no dark pixel survives past 1.9 s, so it is opaque from 2.1 s.
 */
export const LOCAL_SAND_EFFECT: Omit<StoryEffect, "origin"> = {
  slot: "sandfx-local",
  width: 1280,
  height: 720,
  startAt: 0.6,
  emission: { x: 0.17, y: 0.02 },
  settleFrom: 1,
  settleTo: 2,
  coveredAt: 2.1,
  edgeFeather: 0.02,
  // The pile the sand lands on belongs to the footage, not the page, so it stays hidden until the
  // sand has grown past the mascot.
  floor: { y: 0.8, until: 1 },
  // Generated on black: brightness separates sand from ground, and the sand keeps its own colour.
  key: { mode: "luma", key: [0, 0, 0], solidAt: 0.06, clearAt: 0.2 },
};

export const SAND_EFFECT: Omit<StoryEffect, "origin"> = {
    slot: "sandfx",
    width: 1280,
    height: 720,
    startAt: 0.6,
    // The model ignored "a quarter in from the left": the stream enters at the left edge, at floor height.
    emission: { x: 0.012, y: 0.74 },
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
};
