import type { Product } from "@/lib/catalog/types";
import { resolveComponents } from "@/lib/studio/geometry";
import { JewelryArt } from "@/components/studio/JewelryArt";

// Product-only composition used wherever final photography is missing. It uses the same
// layout maths as the try-on renderer so the arrangement is identical everywhere.
export function ProductArtwork({
  product,
  className,
  scale = 0.62,
  showLabel = true,
}: {
  product: Product;
  className?: string;
  /** Group width as a fraction of the box. */
  scale?: number;
  showLabel?: boolean;
}) {
  const components = resolveComponents(product, { side: "left", tweaks: {} });
  return (
    <div
      role="img"
      aria-label={`${product.title}: concept artwork. ${product.summary}`}
      className={`grain relative overflow-hidden bg-coal ${className ?? ""}`}
      style={{
        backgroundImage:
          "radial-gradient(ellipse 70% 60% at 55% 40%, rgba(143,35,55,0.22), transparent 70%), radial-gradient(ellipse 90% 80% at 50% 110%, rgba(0,0,0,0.6), transparent 60%)",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2"
        style={{ width: `${scale * 100}%` }}
      >
        {components.map((c) => (
          <span
            key={c.id}
            className="absolute block drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)]"
            style={{
              left: `${c.leftPct}%`,
              top: `${c.topPct}%`,
              width: `${c.widthPct}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <JewelryArt art={c.art} />
          </span>
        ))}
      </div>
      {showLabel && (
        <span className="absolute bottom-3 left-3 text-[0.625rem] uppercase tracking-[0.2em] text-ash">
          Concept artwork
        </span>
      )}
    </div>
  );
}
