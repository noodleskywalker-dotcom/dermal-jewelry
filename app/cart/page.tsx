import type { Metadata } from "next";
import { BagContents } from "@/components/cart/BagContents";

export const metadata: Metadata = { title: "Demo bag" };

export default function CartPage() {
  return (
    <div className="mx-auto grid max-w-[120rem] gap-x-16 gap-y-10 px-6 pb-32 pt-12 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:px-16 lg:pt-20">
      <div>
        <p className="label-xs text-ash">Preview · Nothing can be ordered yet</p>
        <h1 className="mt-6 font-display text-[clamp(3.25rem,7.2vw,7.5rem)] font-light leading-[0.98] tracking-[-0.01em]">Demo bag</h1>
      </div>
      {/* No box: the lines sit on the paper, under one hairline. */}
      <div className="flex min-h-[24rem] flex-col border-t border-line lg:mt-6 [&_[data-testid=bag-empty]]:px-0 [&_ul]:px-0 [&>div>div]:px-0">
        <BagContents />
      </div>
    </div>
  );
}
