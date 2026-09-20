import type { PlacementId } from "@/lib/catalog/types";

/** The wearer's own left or right, not the viewer's. */
export type Side = "left" | "right";

/** Group transform in photo-relative units so it survives any resize. */
export type GroupTransform = {
  /** Centre, 0..1 across the photo width. */
  x: number;
  /** Centre, 0..1 down the photo height. */
  y: number;
  /** Group box width as a fraction of the photo width. */
  scale: number;
  /** Degrees, clockwise as seen by the viewer. */
  rotation: number;
};

/** Per-piece visual adjustment on top of the product's authored layout. */
export type ComponentTweak = {
  /** Offset in group units, in viewer space. */
  dx: number;
  dy: number;
  /** Size multiplier. */
  scale: number;
  rotation: number;
};

export type LookItem = {
  uid: string;
  productId: string;
  placement: PlacementId;
  side: Side;
  group: GroupTransform;
  tweaks: Record<string, ComponentTweak>;
  visible: boolean;
};

export type Look = {
  items: LookItem[];
  activeUid: string | null;
};

export type Rect = { left: number; top: number; width: number; height: number };

export type StudioPhoto = {
  /** Browser-local object URL. Never leaves the page. */
  url: string;
  width: number;
  height: number;
};
