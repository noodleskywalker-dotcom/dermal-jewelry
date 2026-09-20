"use client";

import Link from "next/link";
import { bagActions, useBagDrawerOpen } from "@/lib/cart/store";
import { Modal } from "@/components/layout/Modal";
import { BagContents } from "./BagContents";

export function BagDrawer() {
  const open = useBagDrawerOpen();
  return (
    <Modal open={open} onClose={bagActions.closeDrawer} label="Demo bag" variant="drawer">
      <div className="flex items-center justify-between border-b border-line px-6 py-5">
        <h2 className="font-display text-2xl">Demo bag</h2>
        <button
          type="button"
          onClick={bagActions.closeDrawer}
          className="min-h-11 px-2 text-xs uppercase tracking-[0.22em] text-ash hover:text-ivory"
        >
          Close
        </button>
      </div>
      <BagContents onNavigate={bagActions.closeDrawer} />
      <Link
        href="/cart"
        onClick={bagActions.closeDrawer}
        className="border-t border-line px-6 py-4 text-center text-xs uppercase tracking-[0.22em] text-ash hover:text-ivory"
      >
        Open full bag page
      </Link>
    </Modal>
  );
}
