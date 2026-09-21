"use client";

import Link from "next/link";
import { catalog, formatPrice, formOf } from "@/lib/catalog";
import { bagSubtotal, MAX_QUANTITY } from "@/lib/cart/bag";
import { bagActions, useBag } from "@/lib/cart/store";
import { site } from "@/lib/config/site";
import { ProductArtwork } from "@/components/catalog/ProductArtwork";

// Shared by the bag drawer and the /cart page so quantities and totals can never disagree.
export function BagContents({ onNavigate }: { onNavigate?: () => void }) {
  const bag = useBag();
  const subtotal = bagSubtotal(bag, catalog);

  if (bag.lines.length === 0) {
    return (
      <div className="px-6 py-16" data-testid="bag-empty">
        <p className="font-display text-4xl font-light leading-tight">Your demo bag is empty.</p>
        <p className="mt-3 text-sm text-ash">Add a piece from the shop or from Face Studio.</p>
        <Link
          href="/shop"
          onClick={onNavigate}
          className="btn-line mt-8"
        >
          Explore the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto px-6">
        {bag.lines.map((line) => {
          const product = catalog.getProductById(line.productId);
          if (!product) return null;
          const form = formOf(product, line.formId);
          return (
            <li key={`${line.productId}:${line.formId}`} className="flex gap-4 py-5" data-testid="bag-line" data-product={product.slug} data-form={form.id}>
              <ProductArtwork product={product} formId={form.id} className="h-24 w-20 shrink-0" showLabel={false} />
              <div className="min-w-0 flex-1">
                <Link href={`/product/${product.slug}?form=${form.id}`} onClick={onNavigate} className="font-display text-lg leading-tight hover:text-garnet-text">
                  {product.title}
                </Link>
                <p className="mt-1 text-xs text-ash" data-testid="bag-line-form">{form.label} form</p>
                <p className="mt-1 text-xs text-ash">Demo price {formatPrice(form.demoPrice, product.currency)}</p>
                <div className="mt-3 flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${product.title}, ${form.label}`}
                    onClick={() => bagActions.setQuantity(product.id, form.id, line.quantity - 1)}
                    className="h-11 w-11 text-lg text-ash hover:text-ink"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm" aria-live="polite" data-testid="bag-quantity">
                    <span className="sr-only">Quantity </span>
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${product.title}, ${form.label}`}
                    disabled={line.quantity >= MAX_QUANTITY}
                    onClick={() => bagActions.setQuantity(product.id, form.id, line.quantity + 1)}
                    className="h-11 w-11 text-lg text-ash hover:text-ink disabled:opacity-40"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => bagActions.remove(product.id, form.id)}
                    className="ml-auto min-h-11 px-2 text-xs uppercase tracking-[0.18em] text-ash hover:text-ink"
                  >
                    Remove<span className="sr-only"> {product.title}, {form.label}</span>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-line px-6 py-6">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Demo subtotal</span>
          <span className="font-display text-2xl" data-testid="bag-subtotal">
            {formatPrice(subtotal, site.currency)}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ash">
          Demo prices only. They are placeholders, not selling prices.
        </p>
        <button
          type="button"
          disabled
          aria-describedby="checkout-note"
          className="label-xs mt-5 min-h-12 w-full cursor-not-allowed border-y border-line text-ash"
        >
          Checkout unavailable in preview
        </button>
        <p id="checkout-note" className="mt-2 text-xs leading-relaxed text-ash">
          This is a preview store. Nothing can be ordered or paid for yet.
        </p>
      </div>
    </div>
  );
}
