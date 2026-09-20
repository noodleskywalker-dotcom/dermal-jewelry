"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { formatPrice, placementLabel } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { Modal } from "@/components/layout/Modal";
import { ProductArtwork } from "./ProductArtwork";
import { TryOnPreview } from "./TryOnPreview";

const OPEN_DELAY_MS = 200;
const CLOSE_DELAY_MS = 140;
const PANEL_WIDTH = 304;
const PANEL_HEIGHT_ESTIMATE = 560;

type PanelPlacement = { side: "right" | "left" | "over"; shiftY: number };

/** Keeps the hover panel inside the viewport: beside the card when there is room, otherwise over it. */
function placePanel(card: DOMRect, viewportW: number, viewportH: number): PanelPlacement {
  const side =
    card.right + PANEL_WIDTH + 12 <= viewportW ? "right" : card.left - PANEL_WIDTH - 12 >= 0 ? "left" : "over";
  const overflow = card.top + PANEL_HEIGHT_ESTIMATE + 12 - viewportH;
  const shiftY = overflow > 0 ? -Math.min(overflow, Math.max(0, card.top - 76)) : 0;
  return { side, shiftY };
}

export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
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
      <ul className={className ?? "grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-4"}>
        {products.map((product) => {
          const open = hover?.id === product.id;
          const panelId = `tryon-panel-${product.slug}`;
          return (
            <li
              key={product.id}
              data-testid="product-card"
              data-product={product.slug}
              className={`group relative ${open ? "z-30" : ""}`}
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
              <Link href={`/product/${product.slug}`} className="block" aria-describedby={open ? panelId : undefined}>
                <ProductArtwork
                  product={product}
                  className="aspect-[4/5] w-full transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:scale-[1.015]"
                />
                <span className="mt-4 flex items-baseline justify-between gap-4">
                  <span className="font-display text-xl leading-tight">{product.title}</span>
                  <span className="shrink-0 text-sm text-ash">
                    <span className="sr-only">Demo price </span>
                    {formatPrice(product.demoPrice, product.currency)}
                  </span>
                </span>
                <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-ash">
                  {product.placements.map(placementLabel).join(" · ")} · Demo
                </span>
              </Link>

              <button
                type="button"
                data-testid="try-on-button"
                onClick={() => {
                  cancelTimers();
                  setHover(null);
                  setSheetProduct(product);
                }}
                className="mt-4 min-h-11 w-full border border-line text-xs uppercase tracking-[0.22em] transition-colors duration-200 hover:border-ivory"
              >
                Try on<span className="sr-only"> {product.title}</span>
              </button>

              {open && hover && (
                <div
                  id={panelId}
                  data-testid="hover-panel"
                  className={`fade-in absolute top-0 z-30 hidden w-[19rem] border border-line bg-coal p-5 shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:block ${
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
                className="min-h-11 px-2 text-xs uppercase tracking-[0.22em] text-ash hover:text-ivory"
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
