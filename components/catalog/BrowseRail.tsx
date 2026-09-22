"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/catalog/types";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";
import { ANCHORS, PlacementPreview } from "./PlacementPreview";
import { FloatingObject } from "./FloatingObject";
import { ConceptBlade } from "./SelectionRail";
import { SandLayer } from "@/components/story/SandLayer";

// The ways into the collection, browsed sideways like a gallery: each entry is a world, not a
// filter button. One entry centred, its neighbours well into the frame at either edge. A finger
// swipes it, a mouse drags it, the arrows and keys step it; the vertical wheel stays with the page.
//
// Worlds: DESERT EYE is sand and garnet; KIRI is ivory, chrome and one blade of light; LIMITED
// EDITION is the dark campaign treatment; the full collection is clean and editorial. Nothing is
// invented: no limited edition has been announced, and men and women both show the unisex pieces.

type World = "sand" | "chrome" | "dark" | "signature" | "face";
type Entry = { id: string; name: string; kind: string; href: string; action: string; world: World; visual: React.ReactNode };

export function BrowseRail({ products }: { products: Product[] }) {
  const byslug = (slug: string) => products.find((p) => p.slug === slug) ?? products[0];
  const desert = byslug("desert-eye-love");
  const originals = products.filter((p) => p.origin === "original");
  const anchor = ANCHORS["anti-eyebrow"] ?? { x: 0.66, y: 0.45 };

  const entries: Entry[] = [
    {
      id: "desert-eye",
      name: "DESERT EYE",
      kind: "Inspired collection",
      href: "/collections?family=desert-eye-love",
      action: "Explore",
      world: "sand",
      visual: (
        <span className="browse-object">
          <SandLayer className="browse-sand" />
          <FloatingObject product={desert} depth={1} />
        </span>
      ),
    },
    {
      id: "kiri",
      name: "KIRI",
      kind: "Original · concept",
      href: "/shop?browse=original",
      action: "Explore",
      world: "chrome",
      visual: (
        <span className="browse-object browse-blade" data-object-host>
          <ConceptBlade />
          <span aria-hidden="true" className="fo-blade" />
        </span>
      ),
    },
    {
      id: "limited",
      name: "LIMITED EDITION",
      kind: "None announced",
      href: "/shop?browse=limited",
      action: "Explore",
      world: "dark",
      // eslint-disable-next-line @next/next/no-img-element
      visual: <img src="/media/hero-orbit/desert-eye-love/f-048.jpg" alt="" aria-hidden="true" loading="lazy" className="browse-dark-media" />,
    },
    {
      id: "full",
      name: "FULL COLLECTION",
      kind: `${products.length} pieces`,
      href: "/shop",
      action: "Explore",
      world: "signature",
      visual: (
        <span className="browse-row">
          {products.map((p, i) => (
            <span key={p.id} className="browse-row-item">
              <FloatingObject product={p} depth={1} delay={i * -1.3} />
            </span>
          ))}
        </span>
      ),
    },
    {
      id: "men",
      name: "MEN",
      kind: "Unisex pieces included",
      href: "/shop?browse=men",
      action: "Explore",
      world: "signature",
      visual: (
        <span className="browse-object">
          <FloatingObject product={originals[1] ?? desert} depth={1} />
        </span>
      ),
    },
    {
      id: "women",
      name: "WOMEN",
      kind: "Unisex pieces included",
      href: "/shop?browse=women",
      action: "Explore",
      world: "signature",
      visual: (
        <span className="browse-object">
          <FloatingObject product={originals[0] ?? desert} depth={1} />
        </span>
      ),
    },
    {
      id: "face",
      name: "TRY ON YOUR FACE",
      kind: "Face Studio · your photo stays on this device",
      href: "/face-studio",
      action: "Enter",
      world: "face",
      visual: (
        <span className="browse-face">
          <span className="crop-head" style={{ "--px": anchor.x, "--py": anchor.y, "--s": 2.4, "--tx": 0.52, "--ty": 0.48 } as React.CSSProperties}>
            <PlacementPreview product={desert} formId="anti-eyebrow" bare />
          </span>
        </span>
      ),
    },
  ];

  const rail = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  const go = useCallback((to: number) => {
    const el = rail.current;
    const slide = el?.children[Math.max(0, Math.min(to, (el?.children.length ?? 1) - 1))] as HTMLElement | undefined;
    if (!el || !slide) return;
    el.scrollTo({ left: slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const middle = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let distance = Infinity;
      [...el.children].forEach((child, i) => {
        const c = child as HTMLElement;
        const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - middle);
        if (d < distance) {
          distance = d;
          best = i;
        }
      });
      setIndex(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    read();
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div data-testid="browse" className="browse relative">
      <div className="browse-head">
        <p className="label-xs" data-testid="browse-index" aria-live="polite">
          {String(index + 1).padStart(2, "0")} / {String(entries.length).padStart(2, "0")}
        </p>
        <p className="label-xs text-ash">
          <span className="hidden lg:inline">Drag</span>
          <span className="lg:hidden">Swipe</span>
        </p>
      </div>
      <ul
        ref={rail}
        data-testid="browse-rail"
        data-dragging={dragging}
        aria-label="Browse the collection"
        tabIndex={0}
        className="browse-rail"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (!d.moved && Math.abs(dx) > 6) {
            d.moved = true;
            setDragging(true);
          }
          if (d.moved) e.currentTarget.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (d?.moved) requestAnimationFrame(() => {
            setDragging(false);
            go(index);
          });
        }}
        onPointerLeave={() => {
          if (drag.current?.moved) setDragging(false);
          drag.current = null;
        }}
        onClickCapture={(e) => {
          if (dragging) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!delta) return;
          e.preventDefault();
          go(index + delta);
        }}
      >
        {entries.map((entry, i) => {
          const current = i === index;
          return (
            <li key={entry.id} data-testid="browse-entry" data-entry={entry.id} data-world={entry.world} data-current={current} className="browse-entry">
              <Link href={entry.href} draggable={false} tabIndex={current ? 0 : -1} className="browse-visual" aria-label={`${entry.name}, ${entry.kind}`}>
                {entry.visual}
              </Link>
              <div className="browse-label">
                <p className="label-xs">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-display text-[clamp(1.75rem,3.2vw,3rem)] font-light leading-none tracking-[0.06em]">{entry.name}</h3>
                <p className="label-xs mt-3 text-ash">{entry.kind}</p>
                <Link href={entry.href} draggable={false} tabIndex={current ? 0 : -1} className="text-link mt-3" data-testid="browse-go">
                  {entry.action} <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="browse-steps" data-testid="browse-steps">
        <button type="button" data-testid="browse-prev" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous" className="label-xs inline-flex min-h-11 items-center gap-2 disabled:opacity-25">
          <span aria-hidden="true">←</span> Prev
        </button>
        <button type="button" data-testid="browse-next" onClick={() => go(index + 1)} disabled={index === entries.length - 1} aria-label="Next" className="label-xs inline-flex min-h-11 items-center gap-2 disabled:opacity-25">
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
