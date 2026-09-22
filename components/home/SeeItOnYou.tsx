import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import { PlacementPreview } from "@/components/catalog/PlacementPreview";

// 07: SEE IT ON YOU. A close crop of the sculpted head around the placement, the piece large on it,
// and one way in. The head is the approved featureless device, not a person, and the crop keeps
// the piece, not the mannequin, as the object of the frame.
export function SeeItOnYou({ product }: { product: Product }) {
  return (
    <section aria-labelledby="onyou-heading" data-testid="onyou-section" className="mx-auto max-w-[120rem] px-6 py-20 sm:px-10 lg:px-16 lg:py-32">
      <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div className="lg:order-2">
          <p className="label-xs">06 / ON YOU</p>
          <h2 id="onyou-heading" className="mt-3 font-display text-[clamp(2rem,3vw,3rem)] font-light uppercase leading-[1.05] tracking-[0.04em]">
            See it on you
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ash">Your photo stays on your device. A still, approximate preview: not a size, not a fitting.</p>
          <Link href={`/face-studio?product=${product.slug}`} className="text-link mt-8" data-testid="onyou-try">
            Try on your face <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="onyou-crop lg:order-1" data-testid="onyou-crop">
          <div className="onyou-head">
            <PlacementPreview product={product} formId="anti-eyebrow" bare />
          </div>
          <p className="label-xs absolute bottom-3 left-3 text-ash">Sculpted form, not a person · approximate</p>
        </div>
      </div>
    </section>
  );
}
