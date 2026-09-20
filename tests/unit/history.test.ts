import { describe, expect, it } from "vitest";
import { applyChange, canRedo, canUndo, createHistory, redo, undo } from "@/lib/studio/history";

describe("history", () => {
  it("undoes and redoes", () => {
    let h = createHistory(0);
    h = applyChange(h, 1, { at: 0 });
    h = applyChange(h, 2, { at: 10 });
    expect(canUndo(h)).toBe(true);
    h = undo(h);
    expect(h.present).toBe(1);
    h = redo(h);
    expect(h.present).toBe(2);
    expect(canRedo(h)).toBe(false);
  });

  it("collapses one drag gesture into a single undo step", () => {
    let h = createHistory(0);
    for (let i = 1; i <= 20; i++) h = applyChange(h, i, { key: "gesture:1", at: i * 1000 });
    expect(h.present).toBe(20);
    expect(undo(h).present).toBe(0);
  });

  it("collapses quick slider changes but not slow ones", () => {
    let h = createHistory(0);
    h = applyChange(h, 1, { key: "scale", at: 0 });
    h = applyChange(h, 2, { key: "scale", at: 100 });
    h = applyChange(h, 3, { key: "scale", at: 5000 });
    expect(h.past).toEqual([0, 2]);
  });

  it("separates different gestures", () => {
    let h = createHistory(0);
    h = applyChange(h, 1, { key: "gesture:1", at: 0 });
    h = applyChange(h, 2, { key: "gesture:2", at: 1 });
    expect(undo(h).present).toBe(1);
  });

  it("drops the redo stack after a new change and ignores no-ops", () => {
    let h = createHistory(0);
    h = applyChange(h, 1, { at: 0 });
    h = undo(h);
    h = applyChange(h, 5, { at: 1 });
    expect(canRedo(h)).toBe(false);
    expect(applyChange(h, h.present, { at: 2 })).toBe(h);
  });
});
