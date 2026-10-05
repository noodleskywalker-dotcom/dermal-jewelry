"use client";

import { useEffect } from "react";
import Link from "next/link";
import { catalog, formatPrice, formOf } from "@/lib/catalog";
import { MAX_QUANTITY } from "@/lib/cart/bag";
import { bagActions, useBag } from "@/lib/cart/store";
import { cartActions, useShopifyCart } from "@/lib/cart/shopify-store";
import { useCommerceLive } from "@/components/commerce/CommerceProvider";
import { ProductArtwork } from "@/components/catalog/ProductArtwork";

// Shared by the bag drawer and the /cart page so quantities and totals can never disagree.
//
// Two backings, one appearance. A real Shopify cart takes precedence whenever there is one, and
// every amount it shows came back from Shopify: nothing on this page adds money up. With no Shopify
// cart — which is the case while the store holds no products — a saved design selection is shown
// instead. It has no selling prices or calculated totals.
export function BagContents({ onNavigate }: { onNavigate?: () => void }) {
  const bag = useBag();
  const { cart, status, error } = useShopifyCart();
  const commerceLive = useCommerceLive();
  // Shopify is the only cart from the moment the storefront really sells anything, or the moment a
  // Shopify cart exists at all. The demo bag is a development fallback and never runs beside it.
  const shopifyOwnsTheBag = commerceLive || cart !== null;
  const live = cart && cart.lines.length > 0 ? cart : null;

  // A demo line must never sit beside a real one, so the demo bag is emptied as Shopify takes over.
  useEffect(() => {
    if (shopifyOwnsTheBag) bagActions.clear();
  }, [shopifyOwnsTheBag]);

  const showDemo = !shopifyOwnsTheBag && bag.lines.length > 0;

  if (!live && !showDemo) {
    return (
      <div className="px-6 py-16" data-testid="bag-empty">
        <p className="font-display text-4xl font-light leading-tight">Your {shopifyOwnsTheBag ? "bag" : "selection"} is empty.</p>
        <p className="mt-3 text-sm leading-relaxed text-ash">{shopifyOwnsTheBag ? "Explore the collection and find your piece." : "Keep the designs you’re drawn to together, ready to revisit."}</p>
        {error && <p className="mt-3 text-sm text-ash" data-testid="bag-error">{error}</p>}
        <Link href="/shop" onClick={onNavigate} className="btn-line mt-8">
          Explore the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto px-6" data-backing={live ? "shopify" : "demo"}>
        {live
          ? live.lines.map((line) => {
              // The editorial family behind the handle, for its artwork. Shopify owns the words and
              // the money; the picture is still DERMAL's.
              const product = catalog.listProducts().find((p) => p.slug === line.handle);
              return (
                <li key={line.id} className="flex gap-4 py-5" data-testid="bag-line" data-product={line.handle} data-line={line.id}>
                  {product && <ProductArtwork product={product} className="h-24 w-20 shrink-0" showLabel={false} />}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={product ? `/product/${product.slug}` : "/shop"}
                      onClick={onNavigate}
                      className="font-display text-lg leading-tight hover:text-garnet-text"
                    >
                      {line.title}
                    </Link>
                    <p className="mt-1 text-xs text-ash" data-testid="bag-line-form">{line.variantTitle}</p>
                    <p className="mt-1 text-xs text-ash">{formatPrice(Number(line.unitPrice.amount), line.unitPrice.currencyCode)}</p>
                    {!line.availableForSale && (
                      <p className="mt-1 text-xs text-garnet-text" data-testid="bag-line-unavailable">
                        No longer available.
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${line.title}`}
                        disabled={status === "busy"}
                        onClick={() => cartActions.setQuantity(line.id, line.quantity - 1)}
                        className="h-11 w-11 text-lg text-ash hover:text-ink disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm" aria-live="polite" data-testid="bag-quantity">
                        <span className="sr-only">Quantity </span>
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${line.title}`}
                        disabled={status === "busy" || line.quantity >= MAX_QUANTITY}
                        onClick={() => cartActions.setQuantity(line.id, line.quantity + 1)}
                        className="h-11 w-11 text-lg text-ash hover:text-ink disabled:opacity-40"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        disabled={status === "busy"}
                        onClick={() => cartActions.remove(line.id)}
                        className="ml-auto min-h-11 px-2 text-xs uppercase tracking-[0.18em] text-ash hover:text-ink disabled:opacity-40"
                      >
                        Remove<span className="sr-only"> {line.title}</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
          : bag.lines.map((line) => {
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
                    <p className="mt-1 text-xs text-ash">Price pending</p>
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
          <span className="eyebrow">{live ? "Subtotal" : "Pricing"}</span>
          <span className="font-display text-2xl" data-testid="bag-subtotal">
            {live ? formatPrice(Number(live.subtotal.amount), live.subtotal.currencyCode) : "Price pending"}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ash">
          {live
            ? "Taxes and shipping will be confirmed when checkout opens."
            : "Your selection saves designs on this device. It does not reserve pieces or place an order."}
        </p>
        {error && <p className="mt-2 text-xs leading-relaxed text-ash" data-testid="bag-error">{error}</p>}
        <button
          type="button"
          disabled
          aria-describedby="checkout-note"
          data-testid="checkout-button"
          className="label-xs mt-5 min-h-12 w-full cursor-not-allowed border-y border-line text-ash"
        >
          {live ? "Checkout — coming soon" : "Preorder — coming soon"}
        </button>
        <p id="checkout-note" className="mt-2 text-xs leading-relaxed text-ash">
          {live
            ? "Your pieces are in your bag. Ordering has not opened yet."
            : "Prices and availability will be confirmed before ordering opens."}
        </p>
        {!live && <Link href="/commission" onClick={onNavigate} className="btn-line mt-5">Commission your own</Link>}
      </div>
    </div>
  );
}
