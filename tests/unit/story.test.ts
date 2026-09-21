import { describe, expect, it } from "vitest";
import { catalog, formOf } from "@/lib/catalog";
import { beatAt, canPlayCinematic, clampFocus, floatingPieces, totalSeconds } from "@/lib/story";
import { internalStoryMedia, storyFor, storyForBuild } from "@/lib/story/registry";

const story = storyFor("desert-eye")!;
const products = catalog.listProducts().filter((p) => p.collection === "desert-eye");

describe("collection story", () => {
  it("exists for DESERT EYE only, so other collections keep the ordinary grid", () => {
    expect(story.productSlug).toBe("desert-eye-love");
    expect(storyFor("originals")).toBeUndefined();
  });

  it("runs six to seven seconds in contiguous beats that end on the close-up", () => {
    expect(totalSeconds(story)).toBeGreaterThanOrEqual(6);
    expect(totalSeconds(story)).toBeLessThanOrEqual(7);
    story.beats.forEach((beat, i) => {
      expect(beat.from).toBe(i === 0 ? 0 : story.beats[i - 1].to);
      expect(beat.to).toBeGreaterThan(beat.from);
    });
    expect(story.beats.map((b) => b.id)).toEqual(["stance", "exchange", "erupt", "fill", "closeup"]);
    // The action exchange stays short, and full sand comes before the close-up as the hidden cut.
    const exchange = story.beats.find((b) => b.id === "exchange")!;
    expect(exchange.to - exchange.from).toBeLessThanOrEqual(3);
    expect(beatAt(story, 5).id).toBe("fill");
    expect(beatAt(story, 6).id).toBe("closeup");
    expect(beatAt(story, 99).id).toBe("closeup");
  });

  it("keeps the hover hint far shorter than the cinematic", () => {
    expect(story.microReactionMs).toBeGreaterThanOrEqual(500);
    expect(story.microReactionMs).toBeLessThanOrEqual(1500);
  });

  it("plays the unfinished story for internal review only, and never with reduced motion", () => {
    expect(story.readiness.approvedForPublication).toBe(false);
    expect(canPlayCinematic(story, { internal: true, reducedMotion: false })).toBe(true);
    expect(canPlayCinematic(story, { internal: true, reducedMotion: true })).toBe(false);
    expect(canPlayCinematic(story, { internal: false, reducedMotion: false })).toBe(false);

    const cleared = { ...story, readiness: { ...story.readiness, sourceVideo: "available" as const, rightsCleared: true, approvedForPublication: true } };
    expect(canPlayCinematic(cleared, { internal: false, reducedMotion: false })).toBe(true);
    // Footage without rights clearance is still not shown to customers.
    expect(canPlayCinematic({ ...cleared, readiness: { ...cleared.readiness, rightsCleared: false } }, { internal: false, reducedMotion: false })).toBe(false);
  });

  it("gives a build no internal media, no working names and no production briefs", () => {
    expect(internalStoryMedia(story, false)).toEqual({});
    expect(Object.keys(internalStoryMedia(story, true))).toEqual(["character", "sand", "closeup"]);
    const built = JSON.stringify(storyForBuild(story, false));
    expect(built).not.toMatch(/gaara|rock lee/i);
    expect(JSON.stringify(storyForBuild(story, true))).toMatch(/Gaara/);
  });

  it("frames every available form of the story's design, each on its own point", () => {
    const hero = products.find((p) => p.slug === story.productSlug)!;
    const available = hero.forms.filter((f) => f.status === "available").map((f) => f.id);
    expect(available).toEqual(["anti-eyebrow", "micro-dermal", "nose"]);
    for (const id of available) {
      const focus = story.focus[id]!;
      expect(story.slots.some((s) => s.id === focus.slot)).toBe(true);
      expect(focus.anchor.x).toBeGreaterThan(0);
      expect(focus.anchor.x).toBeLessThan(1);
    }
    // The nose is not the eye close-up moved: it has another picture, framing and anchor.
    expect(story.focus.nose!.slot).not.toBe(story.focus["anti-eyebrow"]!.slot);
    expect(story.focus.nose!.anchor).not.toEqual(story.focus["micro-dermal"]!.anchor);
  });

  it("clamps a framing so a zoom near an edge never uncovers the page", () => {
    expect(clampFocus({ x: 0, y: 1, zoom: 2 })).toEqual({ x: 0.25, y: 0.75, zoom: 2 });
    expect(clampFocus({ x: 0.9, y: 0.1, zoom: 0.5 })).toEqual({ x: 0.5, y: 0.5, zoom: 1 });
    expect(clampFocus({ x: 0.4, y: 0.3, zoom: 3 })).toEqual({ x: 0.4, y: 0.3, zoom: 3 });
  });

  it("floats only real, available forms, each as its own shoppable object", () => {
    const pieces = floatingPieces(story, products);
    expect(pieces.map((p) => `${p.product.slug}:${p.form.id}`)).toEqual([
      "desert-eye-love:anti-eyebrow",
      "desert-eye-love:micro-dermal",
      "desert-eye-love:nose",
      "sand-vortex:anti-eyebrow",
    ]);
    // A spot naming a form that is not available is dropped rather than shown.
    const withPending = { ...story, scatter: [...story.scatter, { productSlug: "sand-vortex", formId: "nose" as const, x: 1, y: 1, size: 5, tilt: 0 }] };
    expect(floatingPieces(withPending, products)).toHaveLength(4);
    expect(floatingPieces(story, [])).toEqual([]);
  });

  it("keeps single forms single: never the pair made smaller", () => {
    const hero = products.find((p) => p.slug === story.productSlug)!;
    expect(formOf(hero, "micro-dermal").components.map((c) => c.art)).toEqual(["love-symbol"]);
    expect(formOf(hero, "nose").components.map((c) => c.art)).toEqual(["garnet-gem"]);
    expect(formOf(hero, "nose").placement).toBe("nostril");
    for (const id of ["anti-eyebrow", "micro-dermal", "nose"]) expect(formOf(hero, id).note).toMatch(/not manufacturing-ready/i);
  });
});
