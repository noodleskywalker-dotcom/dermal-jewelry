"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { MascotClips, MascotMedia } from "@/lib/story/registry";
import { Mascot } from "@/components/home/Mascot";

// The small companion, on every page, in the same lower-right corner: lying on the floor reading, alive but
// quiet. A signature detail, never the hero, and small enough never to block the page. On the
// homepage and the collections a press sends sand from his gourd into DESERT EYE; elsewhere the
// sand would get in the way, so a press simply opens it. Internal concept art: only a development
// server has him, and a build shows nothing here.
export function GlobalMascot({ media, clips }: { media: MascotMedia | null; clips?: MascotClips | null }) {
  const pathname = usePathname();
  // He steps aside over the dark opening and while his large self is on screen in the companion section.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const read = () => {
      const covered = ["cinema-hero", "companion-section"].some((id) => {
        const el = document.querySelector(`[data-testid="${id}"]`);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4;
      });
      setHidden(covered);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [pathname]);
  if (!media) return null;
  const sand = pathname === "/" || pathname === "/collections";
  return (
    <div className="global-mascot" data-testid="global-mascot" data-hidden={hidden} aria-hidden={hidden || undefined}>
      <Mascot media={media} clips={clips} href="/collections?family=desert-eye-love" label="Wake him and open DESERT EYE" transition={sand} />
    </div>
  );
}
