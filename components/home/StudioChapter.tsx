"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import { resolveComponents } from "@/lib/studio/geometry";
import { fadeWindow, windowProps } from "@/lib/motion/fade";
import { useReducedMotion, useScrollProgress } from "@/lib/motion/useScrollProgress";
import { JewelryArt } from "@/components/studio/JewelryArt";

// Chapter 02. Face Studio is shown, not described: pieces change on a line drawing as the visitor
// scrolls, then the adjust tools appear. The drawing is an illustration, never a photograph.
export function StudioChapter({ first, second }: { first: Product; second: Product }) {
  const reduced = useReducedMotion();
  const ref = useScrollProgress<HTMLElement>(!reduced);

  const copy = (
    <>
      <p className="label-xs text-ash">02 / 04 — Face Studio</p>
      <h2 className="mt-4 font-display text-[clamp(2.2rem,3.8vw,3.6rem)] font-light leading-[1.02]">Try it on your face.</h2>
      <p className="label-xs mt-5 leading-relaxed text-ash">
        Upload once.
        <br />
        Explore everything.
      </p>
      <Link href="/face-studio" className="text-link mt-4">
        Enter Face Studio <span aria-hidden="true">↗</span>
      </Link>
    </>
  );

  const note = (
    <p className="label-xs max-w-[16rem] leading-relaxed text-ash">
      Illustration. In the Studio you use your own photo, and it never leaves your device.
    </p>
  );

  if (reduced) {
    return (
      <section id="studio" data-chapter="Face Studio" className="bg-ink px-5 py-24 text-ivory sm:px-10">
        <div className="mx-auto max-w-5xl">
          <Drawing>
            <Pieces product={first} />
          </Drawing>
        </div>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
          <div>{copy}</div>
          {note}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="studio" data-chapter="Face Studio" className="chapter h-[320vh] bg-ink text-ivory">
      <div className="chapter-stage">
        <div
          className="absolute left-1/2 top-1/2 w-[min(150vh,112vw)] -translate-x-1/2 -translate-y-1/2 will-change-transform"
          style={{ transform: "scale(calc(1.02 + var(--p) * 0.16))", opacity: "clamp(0, calc(var(--p) * 12), 1)" }}
        >
          <Drawing>
            <div className="absolute inset-0" style={{ opacity: fadeWindow(0.08, 0.16, 0.42, 0.5) }}>
              <Pieces product={first} />
            </div>
            <div className="absolute inset-0" style={{ opacity: fadeWindow(0.46, 0.54, 0.68, 0.76) }}>
              <Pieces product={second} />
            </div>
            {/* The first piece returns, moved and turned, with the selection frame: adjusting. */}
            <div
              className="absolute inset-0"
              style={{ opacity: fadeWindow(0.74, 0.82, 2, 3), transform: "translate(4%, -5%) rotate(-9deg)" }}
            >
              <Pieces product={first} />
              <span className="absolute -inset-[14%] border border-ivory/60" />
              <span className="absolute -right-[14%] -top-[14%] size-2 -translate-y-1/2 translate-x-1/2 bg-ivory" />
              <span className="absolute -bottom-[14%] -left-[14%] size-2 -translate-x-1/2 translate-y-1/2 bg-ivory" />
            </div>
          </Drawing>
        </div>

        <p className="label-xs absolute right-5 top-[24svh] text-right sm:right-10" {...windowProps(0.1, 0.18, 0.42, 0.5)}>
          Now wearing
          <span className="mt-2 block font-display text-2xl font-light normal-case tracking-normal">{first.title}</span>
        </p>
        <p className="label-xs absolute right-5 top-[24svh] text-right sm:right-10" {...windowProps(0.48, 0.56, 0.68, 0.76)}>
          Now wearing
          <span className="mt-2 block font-display text-2xl font-light normal-case tracking-normal">{second.title}</span>
        </p>

        {/* A reduced echo of the real tool strip. Decorative here; the working one is in the Studio. */}
        <div
          aria-hidden="true"
          className="label-xs absolute left-1/2 top-[11svh] flex -translate-x-1/2 gap-6 border border-ivory/25 px-5 py-3 text-ivory/80 backdrop-blur-sm"
          style={{ opacity: fadeWindow(0.78, 0.86, 2, 3) }}
        >
          <span>Move</span>
          <span>Scale</span>
          <span>Rotate</span>
          <span className="text-ash">Undo</span>
        </div>

        <div className="absolute bottom-[12svh] left-5 sm:left-10">{copy}</div>
        <div className="absolute bottom-[12svh] right-5 hidden text-right sm:right-10 md:block">{note}</div>
      </div>
    </section>
  );
}

/** Line drawing of an eye and cheek. The anchor box marks the anti-eyebrow placement. */
function Drawing({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-[3/2] w-full">
      <svg viewBox="0 0 1200 800" className="absolute inset-0 h-full w-full" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
        <defs>
          <clipPath id="eye-opening">
            <path d="M330 400 C430 300 640 300 780 410 C650 480 450 470 330 400 Z" />
          </clipPath>
        </defs>
        <g strokeWidth="2.2" opacity="0.9">
          <path d="M290 262 C420 176 640 172 812 268" strokeWidth="7" opacity="0.85" />
          <path d="M360 362 C460 286 630 290 752 372" opacity="0.45" />
          <path d="M330 400 C430 300 640 300 780 410" strokeWidth="4" />
          <path d="M330 400 C450 470 650 480 780 410" />
          <path d="M780 410 C832 396 872 372 902 344" strokeWidth="4" />
          <g clipPath="url(#eye-opening)">
            <circle cx="555" cy="390" r="66" />
            <circle cx="555" cy="390" r="25" fill="currentColor" stroke="none" />
            <circle cx="577" cy="370" r="7" fill="#0c0c0d" stroke="none" />
          </g>
          <path d="M236 330 C214 450 206 546 262 604" opacity="0.4" />
          <path d="M972 180 C1024 372 1002 566 906 730" opacity="0.4" />
          <path d="M420 520 C560 560 700 552 800 500" opacity="0.18" />
        </g>
      </svg>
      {/* Placement anchor: below and outside the outer corner of the eye. */}
      <div className="absolute aspect-square w-[9%]" style={{ left: "70.5%", top: "54%" }}>
        {children}
      </div>
    </div>
  );
}

/** Same layout function as the Studio renderer, so the arrangement matches the real try-on. */
function Pieces({ product }: { product: Product }) {
  return (
    <>
      {resolveComponents(product, { side: "left", tweaks: {} }).map((c) => (
        <span
          key={c.id}
          className="absolute block"
          style={{ left: `${c.leftPct}%`, top: `${c.topPct}%`, width: `${c.widthPct}%`, transform: "translate(-50%, -50%)" }}
        >
          <JewelryArt art={c.art} />
        </span>
      ))}
    </>
  );
}
