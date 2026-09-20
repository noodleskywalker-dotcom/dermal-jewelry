import type { Metadata } from "next";
import { BagContents } from "@/components/cart/BagContents";

export const metadata: Metadata = { title: "Demo bag" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <p className="eyebrow">Preview</p>
      <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Demo bag</h1>
      <div className="mt-10 flex min-h-[24rem] flex-col border border-line">
        <BagContents />
      </div>
    </div>
  );
}
