import { describe, expect, it } from "vitest";
import { availableForms, catalog, formOf } from "@/lib/catalog";
import { resolveComponents } from "@/lib/studio/geometry";
import { addItem, createItem, EMPTY_LOOK, previewItems, setForm, setSide, updateGroup } from "@/lib/studio/look";

const hero = catalog.getProduct("desert-eye-love")!;
const orbit = catalog.getProduct("crimson-orbit")!;

describe("design family forms", () => {
  it("offers only forms whose demo configuration exists", () => {
    expect(availableForms(hero).map((f) => f.id)).toEqual(["anti-eyebrow", "micro-dermal", "nose"]);
    expect(availableForms(orbit).map((f) => f.id)).toEqual(["micro-dermal", "nose"]);
    expect(orbit.forms.find((f) => f.id === "anti-eyebrow")?.status).toBe("concept-pending");
  });

  it("falls back to the default form for unknown or concept-pending forms", () => {
    expect(formOf(orbit, "anti-eyebrow").id).toBe("micro-dermal");
    expect(formOf(hero, "made-up").id).toBe("anti-eyebrow");
    expect(formOf(hero, null).id).toBe("anti-eyebrow");
  });

  it("changes the pieces, not just their size, between forms", () => {
    const pair = resolveComponents(hero, { side: "left", tweaks: {}, formId: "anti-eyebrow" });
    const single = resolveComponents(hero, { side: "left", tweaks: {}, formId: "micro-dermal" });
    expect(pair.map((c) => c.art)).toEqual(["love-symbol", "garnet-gem"]);
    expect(single.map((c) => c.art)).toEqual(["love-symbol"]);
    expect(formOf(hero, "micro-dermal").demoPrice).not.toBe(formOf(hero, "anti-eyebrow").demoPrice);
    expect(formOf(hero, "micro-dermal").packageContents).toContain("one decorative top");
  });

  it("gives each form its own placement profile", () => {
    const dermal = createItem("a", orbit, "left", "micro-dermal");
    const nose = createItem("b", orbit, "left", "nose");
    expect(dermal.placement).toBe("dermal");
    expect(nose.placement).toBe("nostril");
    // The nostril sits close to the centre line; the cheek does not.
    expect(Math.abs(nose.group.x - 0.5)).toBeLessThan(0.1);
    expect(Math.abs(dermal.group.x - 0.5)).toBeGreaterThan(0.15);
  });

  it("never reuses cheek coordinates for a nose form, and restores each form's own adjustment", () => {
    let look = addItem(EMPTY_LOOK, createItem("a", orbit, "left", "micro-dermal"));
    look = updateGroup(look, "a", { x: 0.74, y: 0.55 });
    look = setForm(look, "a", orbit, "nose");
    expect(look.items[0].formId).toBe("nose");
    expect(look.items[0].group.x).not.toBe(0.74);
    expect(Math.abs(look.items[0].group.x - 0.5)).toBeLessThan(0.1);

    look = updateGroup(look, "a", { x: 0.56, y: 0.61 });
    look = setForm(look, "a", orbit, "micro-dermal");
    expect(look.items[0].group).toMatchObject({ x: 0.74, y: 0.55 });
    look = setForm(look, "a", orbit, "nose");
    expect(look.items[0].group).toMatchObject({ x: 0.56, y: 0.61 });
  });

  it("remembers adjustments per side as well", () => {
    let look = addItem(EMPTY_LOOK, createItem("a", hero, "left", "anti-eyebrow"));
    look = updateGroup(look, "a", { x: 0.7, y: 0.5 });
    look = setSide(look, "a", "right");
    expect(look.items[0].group.x).toBeCloseTo(0.3);
    look = updateGroup(look, "a", { x: 0.25 });
    look = setSide(look, "a", "left");
    expect(look.items[0].group.x).toBe(0.7);
    look = setSide(look, "a", "right");
    expect(look.items[0].group.x).toBe(0.25);
  });

  it("previews the chosen form, with a fresh placement when the profile differs", () => {
    let look = addItem(EMPTY_LOOK, createItem("a", hero, "left", "anti-eyebrow"));
    look = updateGroup(look, "a", { x: 0.63 });
    const same = previewItems(look, hero, "anti-eyebrow");
    expect(same).toHaveLength(1);
    expect(same[0].group.x).toBe(0.63);

    const other = previewItems(look, hero, "micro-dermal");
    const previewed = other.find((i) => i.formId === "micro-dermal")!;
    expect(previewed.placement).toBe("dermal");
    expect(previewed.group.x).not.toBe(0.63);
  });

  it("limits a mini-scene to eight seconds and tracks media readiness honestly", () => {
    expect(hero.reveal.mode).toBe("mini-scene");
    expect(hero.reveal.maxSeconds).toBeLessThanOrEqual(8);
    expect(hero.reveal.readiness).toEqual({ playerImplemented: true, storyboardPrepared: true, sourceVideo: "missing", approvedForPublication: false });
    expect(hero.reveal.src).toBeUndefined();
    expect(orbit.reveal.identity).toBe("metal-sweep");
  });
});
