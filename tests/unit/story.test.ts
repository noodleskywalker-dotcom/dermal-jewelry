import { describe, expect, it } from "vitest";
import { catalog, formOf } from "@/lib/catalog";
import { beatAt, canPlayCinematic, clampFocus, floatingPieces, pointOnContained, totalSeconds } from "@/lib/story";
import { DEFAULT_KEY, effectPlacement, keyPixel } from "@/lib/story/chroma-key";
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
    expect(story.beats.map((b) => b.id)).toEqual(["hold", "flow", "spread", "cover", "closeup"]);
    // The still is held briefly, the sand covers the page before the picture changes, and there is no fight.
    expect(story.beats[0].to).toBeLessThanOrEqual(0.8);
    expect(JSON.stringify(story.beats)).not.toMatch(/attack|opponent|counter|fight/i);
    expect(beatAt(story, 5.5).id).toBe("cover");
    expect(beatAt(story, 6).id).toBe("closeup");
    expect(beatAt(story, 99).id).toBe("closeup");
  });

  it("keeps the hover hint at about a second, far shorter than the cinematic", () => {
    expect(story.microReactionMs).toBeGreaterThanOrEqual(800);
    expect(story.microReactionMs).toBeLessThanOrEqual(1200);
  });

  it("names every beat, and carries a customer-facing story label", () => {
    expect(story.storyLabel).toBe("Story 01");
    for (const beat of story.beats) expect(beat.title.length).toBeGreaterThan(2);
  });

  it("uses the approved clean close-up and the approved seated still on white", () => {
    const closeup = story.slots.find((s) => s.id === "closeup")!;
    // The approved clean close-up has no jewelry in it, so the product overlay is back on it.
    expect(closeup.paintedJewelry).toBeUndefined();
    expect(closeup.brief).toMatch(/NO jewelry/);
    expect(story.slots.find((s) => s.id === "character")!.ground).toBe("white");
  });

  it("never enlarges the half-length still past its real pixels on a desktop panel", () => {
    // A 1440 x 900 window gives the picture panel about 836 px of height. The window is 4:5.
    const panelHeight = 836;
    const sourceWidth = 1792;
    for (const id of ["micro-dermal", "nose"] as const) {
      const focus = story.focus[id]!;
      expect(focus.inset).toBeGreaterThan(0.4);
      const windowHeight = panelHeight * focus.inset!;
      const windowWidth = windowHeight * 0.8;
      const aspect = story.slots.find((s) => s.id === focus.slot)!.aspect;
      const drawnWidth = Math.max(windowWidth, windowHeight * aspect) * focus.zoom;
      expect(drawnWidth).toBeLessThanOrEqual(sourceWidth);
    }
  });

  it("marks story-driven collections for the light navigation, and keeps an original concept as words only", async () => {
    const { site } = await import("@/lib/config/site");
    for (const collection of site.collections) expect(collection.stage === "light").toBe(Boolean(storyFor(collection.slug)));
    expect(site.concepts.map((c) => `${c.name}:${c.kind}/${c.status}`)).toEqual(["KIRI:Original/Concept"]);
    expect(catalog.listProducts().some((p) => /kiri/i.test(p.title))).toBe(false);
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
    expect(Object.keys(internalStoryMedia(story, true)).sort()).toEqual(["character", "closeup", "portrait", "sand", "sandfx"]);
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
    // The single forms are framed on the half-length portrait, never on the small seated figure.
    expect(story.focus.nose!.slot).toBe("portrait");
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

describe("sand effect: keying and placement", () => {
  const effect = story.effect!;

  it("is generic footage with measured, recorded numbers and no opponent anywhere in the story", () => {
    expect(effect.slot).toBe("sandfx");
    expect(effect.startAt).toBeGreaterThanOrEqual(0.4);
    expect(effect.coveredAt).toBeLessThan(5.04);
    expect(story.internal.opponent).toBe("");
    // Full cover arrives before the picture is changed under it.
    const cover = story.beats.find((b) => b.id === "cover")!;
    expect(effect.startAt + effect.coveredAt).toBeLessThanOrEqual(cover.from + 0.01);
  });

  it("clears the blue ground however bright or dark, and keeps sand solid even in deep shadow", () => {
    const key = effect.key;
    for (const ground of [[42, 90, 124], [119, 182, 217], [0, 49, 81], [18, 56, 82], [30, 35, 45]]) {
      expect(keyPixel(ground.map((v) => v / 255) as [number, number, number], key).a, `ground ${ground}`).toBe(0);
    }
    for (const sand of [[151, 101, 54], [206, 170, 112], [43, 19, 5], [93, 50, 21], [230, 200, 150]]) {
      expect(keyPixel(sand.map((v) => v / 255) as [number, number, number], key).a, `sand ${sand}`).toBe(1);
    }
  });

  it("leaves no blue in a half-covered edge pixel", () => {
    const half = [0.5 * 0.6 + 0.5 * (42 / 255), 0.5 * 0.4 + 0.5 * (90 / 255), 0.5 * 0.2 + 0.5 * (124 / 255)] as [number, number, number];
    const out = keyPixel(half, effect.key);
    expect(out.a).toBeGreaterThan(0);
    expect(out.a).toBeLessThan(1);
    expect(out.b).toBeLessThanOrEqual(Math.max(out.r, out.g));
    expect(keyPixel([0, 0, 1], DEFAULT_KEY).a).toBe(0);
  });

  it("pins the sand to the gourd at first and covers the whole viewport at the end, without stretching", () => {
    const footage = { width: effect.width, height: effect.height };
    for (const viewport of [{ width: 1440, height: 900 }, { width: 412, height: 915 }, { width: 320, height: 568 }, { width: 844, height: 390 }]) {
      const target = { x: viewport.width * 0.15, y: viewport.height * 0.35 };
      const start = effectPlacement(footage, effect.emission, viewport, target, 0, viewport.width * 0.5);
      expect(start.left + effect.emission.x * start.width).toBeCloseTo(target.x, 5);
      expect(start.top + effect.emission.y * start.height).toBeCloseTo(target.y, 5);
      const end = effectPlacement(footage, effect.emission, viewport, target, 1, viewport.width * 0.5);
      expect(end.left).toBeLessThanOrEqual(0.001);
      expect(end.top).toBeLessThanOrEqual(0.001);
      expect(end.left + end.width).toBeGreaterThanOrEqual(viewport.width - 0.001);
      expect(end.top + end.height).toBeGreaterThanOrEqual(viewport.height - 0.001);
      for (const place of [start, end]) expect(place.width / place.height).toBeCloseTo(footage.width / footage.height, 5);
      // Never larger than it has to be to cover.
      expect(start.width).toBeLessThanOrEqual(end.width + 0.001);
    }
  });

  it("finds a point of a contained, bottom-left picture on the page", () => {
    // A square picture in a tall box sits at the bottom and spans the width.
    expect(pointOnContained({ left: 10, top: 100, width: 400, height: 500 }, 1, { x: 0.31, y: 0.255 })).toEqual({ x: 10 + 124, y: 100 + 100 + 102 });
    // In a wide box it spans the height and hugs the left.
    expect(pointOnContained({ left: 0, top: 64, width: 900, height: 700 }, 1, { x: 0.5, y: 0.5 })).toEqual({ x: 350, y: 64 + 350 });
  });
});
