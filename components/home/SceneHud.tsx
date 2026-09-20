"use client";

import { useEffect, useRef, useState } from "react";

type Chapter = { id: string; label: string };

// Fixed chapter index on the right edge and a hairline progress rule along the bottom.
// White with mix-blend-difference, so it reads on both paper and ink chapters.
export function SceneHud({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(0);
  const ruleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ruleRef.current) ruleRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      const middle = window.innerHeight / 2;
      let current = 0;
      chapters.forEach((chapter, i) => {
        const el = document.getElementById(chapter.id);
        if (el && el.getBoundingClientRect().top <= middle) current = i;
      });
      setActive((prev) => (prev === current ? prev : current));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    request();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [chapters]);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 text-white mix-blend-difference">
      <nav aria-label="Chapters" className="pointer-events-auto absolute right-4 top-1/2 hidden -translate-y-1/2 sm:right-8 md:block">
        <ol className="flex flex-col items-end gap-1">
          {chapters.map((chapter, i) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={i === active ? "true" : undefined}
                className={`label-xs flex min-h-8 items-center gap-3 transition-opacity duration-300 ${i === active ? "opacity-100" : "opacity-40 hover:opacity-80"}`}
              >
                <span className={i === active ? "" : "sr-only"}>{chapter.label}</span>
                <span>0{i + 1}</span>
                <span className={`block h-px bg-current transition-[width] duration-300 ${i === active ? "w-8" : "w-3"}`} />
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <span className="absolute inset-x-0 bottom-0 block h-px bg-white/20">
        <span ref={ruleRef} className="block h-full origin-left bg-white" style={{ transform: "scaleX(0)" }} />
      </span>
    </div>
  );
}
