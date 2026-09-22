"use client";

import { usePathname } from "next/navigation";
import type { MascotMedia } from "@/lib/story/registry";
import { Mascot } from "@/components/home/Mascot";

// The small companion, on every page, in the same lower-right corner: lying on the floor reading, alive but
// quiet. A signature detail, never the hero, and small enough never to block the page. On the
// homepage and the collections a press sends sand from his gourd into DESERT EYE; elsewhere the
// sand would get in the way, so a press simply opens it. Internal concept art: only a development
// server has him, and a build shows nothing here.
export function GlobalMascot({ media }: { media: MascotMedia | null }) {
  const pathname = usePathname();
  if (!media) return null;
  const sand = pathname === "/" || pathname === "/collections";
  return (
    <div className="global-mascot" data-testid="global-mascot">
      <Mascot media={media} href="/collections?family=desert-eye-love" label="Wake him and open DESERT EYE" transition={sand} />
    </div>
  );
}
