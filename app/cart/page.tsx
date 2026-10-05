import type { Metadata } from "next";
import { BagContents } from "@/components/cart/BagContents";
import { BagHeading } from "@/components/cart/BagHeading";

export const metadata: Metadata = { title: "Your selection", description: "Keep your favourite DERMAL designs together. Explore a piece, refine your look or commission your own." };

export default function CartPage() {
  return (
    <div className="mx-auto grid max-w-[120rem] gap-x-16 gap-y-10 px-6 pb-32 pt-12 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:px-16 lg:pt-20">
      <BagHeading />
      {/* No box: the lines sit on the paper, under one hairline. */}
      <div className="flex min-h-[24rem] flex-col border-t border-line lg:mt-6 [&_[data-testid=bag-empty]]:px-0 [&_ul]:px-0 [&>div>div]:px-0">
        <BagContents />
      </div>
    </div>
  );
}
