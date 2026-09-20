"use client";

import Link from "next/link";
import { useReveal } from "@/lib/motion/useScrollProgress";

// Chapter 04. The close of the sequence: three short lines and one way forward.
export function EndingChapter() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="enter" data-chapter="Enter" className="flex min-h-svh flex-col justify-between bg-ink px-5 pb-16 pt-32 text-ivory sm:px-10">
      <p className="label-xs reveal text-ash">04 / 04 — Yours</p>
      <p className="font-display text-[clamp(3rem,9.5vw,10rem)] font-light leading-[0.95]">
        {["Your face.", "Your placement.", "Your piece."].map((line, i) => (
          <span key={line} className={`reveal block ${i === 2 ? "italic text-garnet-display" : ""}`} style={{ "--delay": `${i * 140}ms` } as React.CSSProperties}>
            {line}
          </span>
        ))}
      </p>
      <div className="reveal flex flex-wrap items-end justify-between gap-8" style={{ "--delay": "480ms" } as React.CSSProperties}>
        <Link href="/face-studio" className="text-link">
          Enter Face Studio <span aria-hidden="true">↗</span>
        </Link>
        <p className="label-xs max-w-[20rem] leading-relaxed text-ash">
          No account and no photo are needed to shop. The preview is approximate and is not a fitting.
        </p>
      </div>
    </section>
  );
}
