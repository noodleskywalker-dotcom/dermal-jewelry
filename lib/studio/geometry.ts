import { formOf } from "@/lib/catalog";
import type { PlacementId, Product, ProductForm } from "@/lib/catalog/types";
import type { ComponentTweak, GroupTransform, LookItem, Rect, Side } from "./types";

export const SCALE_MIN = 0.02;
export const SCALE_MAX = 0.6;
export const TWEAK_SCALE_MIN = 0.4;
export const TWEAK_SCALE_MAX = 2.5;

export const ZERO_TWEAK: ComponentTweak = { dx: 0, dy: 0, scale: 1, rotation: 0 };

/** The rectangle an image occupies when fitted with contain-style geometry. */
export function containRect(containerW: number, containerH: number, imageW: number, imageH: number): Rect {
  if (containerW <= 0 || containerH <= 0 || imageW <= 0 || imageH <= 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }
  const ratio = Math.min(containerW / imageW, containerH / imageH);
  const width = imageW * ratio;
  const height = imageH * ratio;
  return { left: (containerW - width) / 2, top: (containerH - height) / 2, width, height };
}

/**
 * Enlarges a contain-fitted photo around a focus point (photo-normalized), keeping the photo
 * covering the container wherever it is large enough to do so.
 */
export function zoomedRect(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
  focus: { x: number; y: number },
  zoom: number,
): Rect {
  const base = containRect(containerW, containerH, imageW, imageH);
  if (base.width === 0 || zoom <= 1) return base;
  const width = base.width * zoom;
  const height = base.height * zoom;
  const place = (container: number, size: number, focusAt: number) =>
    size <= container ? (container - size) / 2 : clamp(container / 2 - focusAt * size, container - size, 0);
  return { left: place(containerW, width, focus.x), top: place(containerH, height, focus.y), width, height };
}

/**
 * The wearer's left appears on the viewer's right in an unmirrored photo,
 * so "outward" for the left side is +x on screen.
 */
export function sideSign(side: Side): 1 | -1 {
  return side === "left" ? 1 : -1;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeRotation(deg: number): number {
  const wrapped = ((((deg + 180) % 360) + 360) % 360) - 180;
  return Object.is(wrapped, -0) ? 0 : wrapped;
}

export function clampGroup(group: GroupTransform): GroupTransform {
  return {
    x: clamp(group.x, 0, 1),
    y: clamp(group.y, 0, 1),
    scale: clamp(group.scale, SCALE_MIN, SCALE_MAX),
    rotation: normalizeRotation(group.rotation),
  };
}

export function clampTweak(tweak: ComponentTweak): ComponentTweak {
  return {
    dx: clamp(tweak.dx, -2, 2),
    dy: clamp(tweak.dy, -2, 2),
    scale: clamp(tweak.scale, TWEAK_SCALE_MIN, TWEAK_SCALE_MAX),
    rotation: normalizeRotation(tweak.rotation),
  };
}

// Manual starting points for a front-facing portrait. They are a guess without landmarks;
// the customer is expected to adjust them.
const DEFAULT_ANCHORS: Record<PlacementId, { offsetX: number; y: number }> = {
  "anti-eyebrow": { offsetX: 0.19, y: 0.47 },
  dermal: { offsetX: 0.2, y: 0.58 },
  eyebrow: { offsetX: 0.17, y: 0.36 },
  nostril: { offsetX: 0.055, y: 0.6 },
  septum: { offsetX: 0, y: 0.62 },
  lip: { offsetX: 0.06, y: 0.74 },
};

/** Starting transform for a form. Each form has its own placement profile, so a nose form never starts on the cheek. */
export function defaultGroup(form: ProductForm, side: Side): GroupTransform {
  const anchor = DEFAULT_ANCHORS[form.placement];
  const sign = sideSign(side);
  return clampGroup({ x: 0.5 + sign * anchor.offsetX, y: anchor.y, scale: form.defaultScale, rotation: 0 });
}

/** Moves an item to the other side of the face. Artwork is never flipped, only its position. */
export function mirrorItem(item: LookItem): LookItem {
  const tweaks: LookItem["tweaks"] = {};
  for (const [id, t] of Object.entries(item.tweaks)) {
    tweaks[id] = { ...t, dx: -t.dx, rotation: normalizeRotation(-t.rotation) };
  }
  return {
    ...item,
    side: item.side === "left" ? "right" : "left",
    group: clampGroup({ ...item.group, x: 1 - item.group.x, rotation: -item.group.rotation }),
    tweaks,
  };
}

export type ResolvedComponent = {
  id: string;
  label: string;
  art: Product["components"][number]["art"];
  /** Centre, as a percentage of the group box. */
  leftPct: number;
  topPct: number;
  /** Width as a percentage of the group box. */
  widthPct: number;
  rotation: number;
};

/** Final per-piece layout inside the group box, shared by the Studio and every preview. */
export function resolveComponents(
  product: Product,
  item: Pick<LookItem, "side" | "tweaks"> & { formId?: string },
): ResolvedComponent[] {
  const sign = sideSign(item.side);
  return formOf(product, item.formId).components.map((c) => {
    const t = item.tweaks[c.id] ?? ZERO_TWEAK;
    return {
      id: c.id,
      label: c.label,
      art: c.art,
      leftPct: (0.5 + sign * c.x + t.dx) * 100,
      topPct: (0.5 + c.y + t.dy) * 100,
      widthPct: c.size * t.scale * 100,
      rotation: t.rotation,
    };
  });
}

/** Converts a pointer movement in CSS pixels to photo-normalized units. */
export function pxDeltaToNormalized(dxPx: number, dyPx: number, photoRect: Pick<Rect, "width" | "height">) {
  if (photoRect.width <= 0 || photoRect.height <= 0) return { dx: 0, dy: 0 };
  return { dx: dxPx / photoRect.width, dy: dyPx / photoRect.height };
}

/** Converts a pointer movement in CSS pixels to the rotated group's own units. */
export function pxDeltaToGroupUnits(
  dxPx: number,
  dyPx: number,
  photoRect: Pick<Rect, "width">,
  group: Pick<GroupTransform, "scale" | "rotation">,
) {
  const unitPx = group.scale * photoRect.width;
  if (unitPx <= 0) return { dx: 0, dy: 0 };
  const rad = (-group.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    dx: (dxPx * cos - dyPx * sin) / unitPx,
    dy: (dxPx * sin + dyPx * cos) / unitPx,
  };
}
