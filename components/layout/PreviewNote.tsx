"use client";

import { usePathname } from "next/navigation";

// A quiet notice on the campaign page that this is a preview. Inner pages label demo products and
// prices inline, where a fixed note would collide with their controls.
export function PreviewNote() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return (
    <p className="label-xs pointer-events-none fixed bottom-3 right-4 z-30 text-ash">
      Preview · demo prices · no checkout
    </p>
  );
}
