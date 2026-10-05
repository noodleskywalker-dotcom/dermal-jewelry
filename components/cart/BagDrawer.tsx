"use client";

import Link from "next/link";
import { bagActions, useBagDrawerOpen } from "@/lib/cart/store";
import { Modal } from "@/components/layout/Modal";
import { BagContents } from "./BagContents";
import { useCommerceLive } from "@/components/commerce/CommerceProvider";
import { useShopifyCart } from "@/lib/cart/shopify-store";

export function BagDrawer() {
  const open = useBagDrawerOpen();
  const commerceLive = useCommerceLive();
  const { cart } = useShopifyCart();
  const title = commerceLive || cart !== null ? "Your bag" : "Your selection";
  return (
    <Modal open={open} onClose={bagActions.closeDrawer} label={title} variant="drawer">
      <div className="flex items-center justify-between px-6 pb-4 pt-6">
        <h2 className="font-display text-3xl font-light tracking-[0.02em]">{title}</h2>
        <button
          type="button"
          onClick={bagActions.closeDrawer}
          className="label-xs min-h-11 px-2 text-ash hover:text-ink"
        >
          Close
        </button>
      </div>
      <BagContents onNavigate={bagActions.closeDrawer} />
      <Link
        href="/cart"
        onClick={bagActions.closeDrawer}
        className="label-xs border-t border-line px-6 py-4 text-center text-ash hover:text-ink"
      >
        View {title.toLowerCase()}
      </Link>
    </Modal>
  );
}
