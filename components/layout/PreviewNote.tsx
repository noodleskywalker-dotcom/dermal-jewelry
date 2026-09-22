"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// A quiet notice on the homepage's opening that this is a preview. It leaves once the page scrolls,
// so it never sits over the controls further down. Inner pages label demo products and prices inline.
export function PreviewNote() {
  const pathname = usePathname();
  const [top, setTop] = useState(true);
  useEffect(() => {
    const read = () => setTop(window.scrollY < 120);
    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, []);
  if (pathname !== "/") return null;
  return (
    <p aria-hidden={!top} className={`label-xs pointer-events-none fixed bottom-4 right-4 z-30 text-ash transition-opacity duration-700 lg:right-16 ${top ? "opacity-100" : "opacity-0"}`}>
      Preview · demo prices · no checkout
    </p>
  );
}
