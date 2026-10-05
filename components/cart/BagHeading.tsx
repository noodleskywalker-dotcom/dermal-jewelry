"use client";

import { useCommerceLive } from "@/components/commerce/CommerceProvider";
import { useShopifyCart } from "@/lib/cart/shopify-store";

export function BagHeading() {
  const commerceLive = useCommerceLive();
  const { cart } = useShopifyCart();
  const isBag = commerceLive || cart !== null;
  return (
    <header>
      <p className="label-xs text-ash">{isBag ? "The pieces you chose" : "Keep your favourites close"}</p>
      <h1 className="mt-6 font-display text-[clamp(3.25rem,7.2vw,7.5rem)] font-light leading-[0.98] tracking-[-0.01em]">
        Your {isBag ? "bag" : "selection"}
      </h1>
      <p className="mt-7 max-w-md text-sm leading-relaxed text-ash">
        {isBag ? "A considered collection, chosen by you. Ordering has not opened yet." : "A space for the designs you want to return to. Saved on this device, ready when you are."}
      </p>
    </header>
  );
}
