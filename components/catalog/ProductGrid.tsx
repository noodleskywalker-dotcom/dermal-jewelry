"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { isFeatured, kindLabels, placementLabel } from "@/lib/catalog";
import { cardPrice } from "@/lib/commerce/display";
import type { Product } from "@/lib/catalog/types";
import { Modal } from "@/components/layout/Modal";
import { FloatingObject } from "./FloatingObject";
import { artworkLabel } from "./ProductArtwork";
import { TryOnPreview } from "./TryOnPreview";

const OPEN_DELAY_MS = 200;
const CLOSE_DELAY_MS = 140;
const PANEL_WIDTH = 304;
const PANEL_HEIGHT_ESTIMATE = 560;

type PanelPlacement = { side: "right" | "left" | "over"; shiftY: number };

/**
 * How the catalogue is laid out. "editorial" is the art-directed rhythm, "even" is the plain
 * browsing view, and "column" is the older paired column a collection page still uses.
 *
 * The rhythm varies composition, never importance: which stage is wide follows the position on the
 * page, not the piece standing in it, and a wide stage is only a little wider than its neighbour.
 */
export type CatalogueLayout = "editorial" | "even" | "column";

const LAYOUT_CLASS: Record<CatalogueLayout, string> = {
  editorial: "catalogue catalogue-editorial",
  even: "catalogue catalogue-even",
  column: "grid grid-cols-1 gap-x-[10vw] gap-y-24 sm:grid-cols-2 sm:[&>li:nth-child(even)]:mt-40 lg:gap-y-32",
};

/** Keeps the hover panel inside the viewport: beside the card when there is room, otherwise over it. */
function placePanel(card: DOMRect, viewportW: number, viewportH: number): PanelPlacement {
  const side =
    card.right + PANEL_WIDTH + 12 <= viewportW ? "right" : card.left - PANEL_WIDTH - 12 >= 0 ? "left" : "over";
  const overflow = card.top + PANEL_HEIGHT_ESTIMATE + 12 - viewportH;
  const shiftY = overflow > 0 ? -Math.min(overflow, Math.max(0, card.top - 76)) : 0;
  return { side, shiftY };
}

export function ProductGrid({
  products,
  className,
  layout = "column",
}: {
  products: Product[];
  className?: string;
  layout?: CatalogueLayout;
}) {
  // One preview at a time, across hover, keyboard focus and the mobile sheet.
  const [hover, setHover] = useState<{ id: string; placement: PanelPlacement } | null>(null);
  const [sheetProduct, setSheetProduct] = useState<Product | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = closeTimer.current = null;
  };

  const scheduleOpen = (product: Product, el: HTMLElement, delay: number) => {
    cancelTimers();
    openTimer.current = setTimeout(() => {
      const placement = placePanel(el.getBoundingClientRect(), window.innerWidth, window.innerHeight);
      setHover({ id: product.id, placement });
    }, delay);
  };

  const scheduleClose = () => {
    cancelTimers();
    closeTimer.current = setTimeout(() => setHover(null), CLOSE_DELAY_MS);
  };

  return (
    <>
      {/* No tiles: each piece stands on the paper, with a great deal of air around it. */}
      <ul data-testid="catalogue" data-layout={layout} className={className ?? LAYOUT_CLASS[layout]}>
        {products.map((product, i) => {
          const open = hover?.id === product.id;
          const panelId = `tryon-panel-${product.slug}`;
          // The wider stage falls on the second and third position of each block of four, so the
          // piece that happens to be listed first is never the one given the widest frame.
          const stage = layout === "editorial" && (i % 4 === 1 || i % 4 === 2) ? "wide" : "regular";
          const kind = kindLabels(product).join(" · ");
          return (
            <li
              key={product.id}
              data-testid="product-card"
              data-product={product.slug}
              data-stage={stage}
              data-object-host
              className={`piece group relative ${open ? "z-30" : ""}`}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") scheduleOpen(product, e.currentTarget, OPEN_DELAY_MS);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse") scheduleClose();
              }}
              onFocus={(e) => {
                // Keyboard focus only; a tap or click must not pop the panel.
                if (e.target instanceof HTMLElement && e.target.matches(":focus-visible")) {
                  scheduleOpen(product, e.currentTarget, 0);
                }
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) scheduleClose();
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape" && open) {
                  e.stopPropagation();
                  cancelTimers();
                  setHover(null);
                }
              }}
            >
              <div className="piece-inner">
              <Link href={`/product/${product.slug}`} className="piece-stage" aria-describedby={open ? panelId : undefined}>
                <span
                  role="img"
                  aria-label={`${product.title}: ${artworkLabel(product).toLowerCase()}. ${product.summary}`}
                  className="piece-object relative block aspect-square"
                >
                  <FloatingObject product={product} depth={1} delay={i * -1.1} />
                </span>
                <span className="label-xs mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-ash">
                  <span>
                    {String(i + 1).padStart(2, "0")} · {artworkLabel(product)}
                  </span>
                  {isFeatured(product) && (
                    <span data-testid="piece-flag" className="piece-flag">
                      Featured
                    </span>
                  )}
                </span>
                <span className="mt-3 flex items-baseline justify-between gap-4">
                  <span className="font-display text-3xl font-light leading-tight tracking-[0.03em] sm:text-4xl">{product.title}</span>
                  <span className="min-w-0 text-right text-sm text-ash">
                    <span className="sr-only">Price </span>
                    {cardPrice(product)}
                  </span>
                </span>
                <span className="label-xs mt-2 block text-ash" data-testid="piece-kind">
                  {product.placements.map(placementLabel).join(" · ")}
                  {kind ? ` · ${kind}` : ""} · Demo
                </span>
              </Link>

              <span className="mt-1 flex flex-wrap items-baseline gap-x-6">
                <Link href={`/product/${product.slug}`} className="text-link" data-testid="view-piece">
                  View piece<span className="sr-only"> {product.title}</span> <span aria-hidden="true">↗</span>
                </Link>
                <button
                  type="button"
                  data-testid="try-on-button"
                  onClick={() => {
                    cancelTimers();
                    setHover(null);
                    setSheetProduct(product);
                  }}
                  className="text-link"
                >
                  Try on<span className="sr-only"> {product.title}</span> <span aria-hidden="true">↗</span>
                </button>
              </span>
              </div>

              {open && hover && (
                <div
                  id={panelId}
                  data-testid="hover-panel"
                  className={`fade-in absolute top-0 z-30 hidden w-[19rem] border border-line bg-paper p-5 shadow-[0_30px_80px_rgba(12,12,13,0.10)] md:block ${
                    hover.placement.side === "right"
                      ? "left-full ml-0"
                      : hover.placement.side === "left"
                        ? "right-full"
                        : "left-0"
                  }`}
                  style={{ transform: `translateY(${hover.placement.shiftY}px)` }}
                >
                  <TryOnPreview product={product} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Modal
        open={sheetProduct !== null}
        onClose={() => setSheetProduct(null)}
        label={sheetProduct ? `Try on ${sheetProduct.title}` : "Try on"}
        variant="sheet"
      >
        {sheetProduct && (
          <div className="overflow-y-auto p-6" data-testid="tryon-sheet">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSheetProduct(null)}
                className="min-h-11 px-2 text-xs uppercase tracking-[0.22em] text-ash hover:text-ink"
              >
                Close
              </button>
            </div>
            <TryOnPreview product={sheetProduct} onNavigate={() => setSheetProduct(null)} allowUpload />
          </div>
        )}
      </Modal>
    </>
  );
}
