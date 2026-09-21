"use client";

import { useEffect, useRef, useState } from "react";
import { catalog } from "@/lib/catalog";
import { containRect, zoomedRect, pxDeltaToGroupUnits, pxDeltaToNormalized, resolveComponents, ZERO_TWEAK } from "@/lib/studio/geometry";
import type { ComponentTweak, GroupTransform, LookItem, StudioPhoto } from "@/lib/studio/types";
import { PieceArt } from "@/components/catalog/FormVisual";

// The single renderer for jewelry on a photo. Face Studio, product-card previews and the mobile
// try-on sheet all use it, so every surface shows the same placement.
//
// Everything inside the photo frame is positioned in percentages of the photo itself, so a
// resize, letterbox or orientation change cannot make the jewelry drift.

export type LookInteraction = {
  activeUid: string | null;
  /** null moves the whole piece group; a component id moves one piece. */
  selectedComponent: string | null;
  onSelectItem: (uid: string) => void;
  onGroupChange: (uid: string, patch: Partial<GroupTransform>, key: string) => void;
  onTweakChange: (uid: string, componentId: string, patch: Partial<ComponentTweak>, key: string) => void;
};

type Props = {
  photo: StudioPhoto;
  items: LookItem[];
  showJewelry?: boolean;
  interaction?: LookInteraction;
  /** Enlarges the photo around a photo-normalized point. Used by compact previews. */
  zoom?: { x: number; y: number; factor: number };
  /** Accessible description of the composed image. */
  label: string;
  className?: string;
};

const NUDGE = 0.004;
const NUDGE_FAST = 0.02;

let gestureCounter = 0;

export function LookRenderer({ photo, items, showJewelry = true, interaction, zoom, label, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rect = zoom
    ? zoomedRect(box.width, box.height, photo.width, photo.height, zoom, zoom.factor)
    : containRect(box.width, box.height, photo.width, photo.height);

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${className ?? ""}`}>
      <div
        ref={frameRef}
        data-testid="photo-frame"
        // role="img" would hide the drag handles from assistive tech, so the editable stage is a group.
        role={interaction ? "group" : "img"}
        aria-label={label}
        className="absolute"
        style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      >
        {/* A local blob URL; next/image cannot optimise it and must not send it anywhere. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt=""
          data-testid="studio-photo"
          draggable={false}
          className="pointer-events-none block h-full w-full select-none"
        />
        {showJewelry &&
          items
            .filter((item) => item.visible)
            .map((item) => (
              <PlacedItem key={item.uid} item={item} frameRef={frameRef} interaction={interaction} />
            ))}
      </div>
    </div>
  );
}

function PlacedItem({
  item,
  frameRef,
  interaction,
}: {
  item: LookItem;
  frameRef: React.RefObject<HTMLDivElement | null>;
  interaction?: LookInteraction;
}) {
  const product = catalog.getProductById(item.productId);
  if (!product) return null;

  const components = resolveComponents(product, item);
  const isActive = interaction?.activeUid === item.uid;
  const pieceMode = Boolean(interaction && isActive && interaction.selectedComponent);

  const groupStyle: React.CSSProperties = {
    left: `${item.group.x * 100}%`,
    top: `${item.group.y * 100}%`,
    width: `${item.group.scale * 100}%`,
    aspectRatio: "1 / 1",
    transform: `translate(-50%, -50%) rotate(${item.group.rotation}deg)`,
  };

  // Each piece is its own source image (or drawn fallback), so pieces stay individually movable.
  const art = components.map((c) => {
    const piece = <PieceArt product={product} formId={item.formId} componentId={c.id} art={c.art} side={item.side} />;
    const style: React.CSSProperties = {
      left: `${c.leftPct}%`,
      top: `${c.topPct}%`,
      width: `${c.widthPct}%`,
      transform: `translate(-50%, -50%) rotate(${c.rotation}deg)`,
    };
    if (pieceMode && interaction) {
      const selected = interaction.selectedComponent === c.id;
      return (
        <DragHandle
          key={c.id}
          testId={`piece-${c.id}`}
          label={`Move ${c.label}. Arrow keys nudge it.`}
          className={`absolute ${selected ? "outline outline-1 outline-offset-4 outline-white/90 shadow-[0_0_0_1px_rgba(12,12,13,0.35)]" : ""}`}
          style={style}
          frameRef={frameRef}
          onStart={() => item.tweaks[c.id] ?? ZERO_TWEAK}
          onMove={(start, dxPx, dyPx, frame, key) => {
            const d = pxDeltaToGroupUnits(dxPx, dyPx, frame, item.group);
            interaction.onTweakChange(item.uid, c.id, { dx: start.dx + d.dx, dy: start.dy + d.dy }, key);
          }}
          onNudge={(dx, dy, key) => {
            const t = item.tweaks[c.id] ?? ZERO_TWEAK;
            // Nudges are in photo units; convert to this group's units.
            interaction.onTweakChange(
              item.uid,
              c.id,
              { dx: t.dx + dx / item.group.scale, dy: t.dy + dy / item.group.scale },
              key,
            );
          }}
        >
          {piece}
        </DragHandle>
      );
    }
    return (
      <span key={c.id} data-testid={`piece-${c.id}`} className="pointer-events-none absolute block" style={style}>
        {piece}
      </span>
    );
  });

  if (!interaction) {
    return (
      <div data-testid="placed-item" data-product={product.slug} className="pointer-events-none absolute" style={groupStyle}>
        {art}
      </div>
    );
  }

  if (pieceMode) {
    return (
      <div data-testid="placed-item" data-product={product.slug} className="absolute" style={groupStyle}>
        {art}
      </div>
    );
  }

  return (
    <DragHandle
      testId="placed-item"
      dataProduct={product.slug}
      label={`Move ${product.title} on the wearer's ${item.side} side. Arrow keys nudge it.`}
      className={`absolute ${isActive ? "outline outline-1 outline-offset-8 outline-white/90 shadow-[0_0_0_1px_rgba(12,12,13,0.35)]" : ""}`}
      style={groupStyle}
      frameRef={frameRef}
      onFocusOrPress={() => interaction.onSelectItem(item.uid)}
      onStart={() => item.group}
      onMove={(start, dxPx, dyPx, frame, key) => {
        const d = pxDeltaToNormalized(dxPx, dyPx, frame);
        interaction.onGroupChange(item.uid, { x: start.x + d.dx, y: start.y + d.dy }, key);
      }}
      onNudge={(dx, dy, key) =>
        interaction.onGroupChange(item.uid, { x: item.group.x + dx, y: item.group.y + dy }, key)
      }
    >
      {art}
    </DragHandle>
  );
}

function DragHandle<T>({
  children,
  label,
  className,
  style,
  testId,
  dataProduct,
  frameRef,
  onStart,
  onMove,
  onNudge,
  onFocusOrPress,
}: {
  children: React.ReactNode;
  label: string;
  className: string;
  style: React.CSSProperties;
  testId: string;
  dataProduct?: string;
  frameRef: React.RefObject<HTMLDivElement | null>;
  onStart: () => T;
  onMove: (start: T, dxPx: number, dyPx: number, frame: { width: number; height: number }, key: string) => void;
  onNudge: (dx: number, dy: number, key: string) => void;
  onFocusOrPress?: () => void;
}) {
  const gesture = useRef<{ id: number; x: number; y: number; start: T; key: string } | null>(null);

  return (
    <button
      type="button"
      data-testid={testId}
      data-product={dataProduct}
      aria-label={label}
      // The enlarged ::before keeps the touch target usable when the jewelry is only a few pixels wide.
      className={`${className} cursor-grab touch-none appearance-none border-0 bg-transparent p-0 before:absolute before:-inset-4 before:content-[''] active:cursor-grabbing`}
      style={style}
      onFocus={onFocusOrPress}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Capture can fail for synthetic or already-released pointers; dragging still works without it.
        }
        onFocusOrPress?.();
        gesture.current = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          start: onStart(),
          key: `gesture:${++gestureCounter}`,
        };
      }}
      onPointerMove={(e) => {
        const g = gesture.current;
        const frame = frameRef.current?.getBoundingClientRect();
        if (!g || g.id !== e.pointerId || !frame) return;
        onMove(g.start, e.clientX - g.x, e.clientY - g.y, frame, g.key);
      }}
      onPointerUp={(e) => {
        if (gesture.current?.id === e.pointerId) gesture.current = null;
      }}
      onPointerCancel={() => {
        gesture.current = null;
      }}
      onKeyDown={(e) => {
        const step = e.shiftKey ? NUDGE_FAST : NUDGE;
        const moves: Record<string, [number, number]> = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        };
        const move = moves[e.key];
        if (!move) return;
        e.preventDefault();
        onNudge(move[0], move[1], "nudge");
      }}
    >
      {children}
    </button>
  );
}
