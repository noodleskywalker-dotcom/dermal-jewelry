"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/catalog/types";
import { formOf } from "@/lib/catalog";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";
import { ProductPieces } from "@/components/catalog/ProductArtwork";
import { Modal } from "@/components/layout/Modal";

// Optional concept reveal for selected products. It never autoplays, never starts on hover, loads
// its media only after an explicit press, and always leaves a usable still of the chosen form.
// The final jewelry frame is a separate overlay drawn from the product asset, so a video can never
// redesign the piece and the reveal always matches the customer's selected piercing form.

type PlayState = "idle" | "loading" | "playing" | "ended" | "failed";

const LOAD_TIMEOUT_MS = 8000;
const LOOP_MS = 2600;

// Only one reveal may play at a time across the whole page.
let stopCurrent: (() => void) | null = null;

export function RevealPlayer({
  product,
  formId,
  fixtureSrc,
}: {
  product: Product;
  formId: string;
  /** Development-only test pattern used to exercise the player. Never campaign media. */
  fixtureSrc?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      {expanded ? (
        <div className="flex aspect-[4/5] w-full items-center justify-center bg-bone text-ink">
          <p className="label-xs text-ink/60">Reveal is open in the expanded view.</p>
        </div>
      ) : (
        <Stage product={product} formId={formId} fixtureSrc={fixtureSrc} onExpand={() => setExpanded(true)} />
      )}
      <Modal open={expanded} onClose={() => setExpanded(false)} label={`${product.title} reveal, expanded`} variant="full">
        {expanded && (
          <div className="flex h-full flex-col bg-ink p-4 sm:p-8">
            <div className="flex justify-end">
              <button type="button" data-testid="reveal-close" onClick={() => setExpanded(false)} className="label-xs inline-flex min-h-11 items-center px-2">
                Close reveal
              </button>
            </div>
            <div className="mx-auto flex min-h-0 w-full max-w-[70vh] flex-1 items-center">
              <Stage product={product} formId={formId} fixtureSrc={fixtureSrc} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function Stage({
  product,
  formId,
  fixtureSrc,
  onExpand,
}: {
  product: Product;
  formId: string;
  fixtureSrc?: string;
  onExpand?: () => void;
}) {
  const reveal = product.reveal;
  const form = formOf(product, formId);
  const reduced = useReducedMotion();
  const [state, setState] = useState<PlayState>("idle");
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isLoop = reveal.mode === "loop";
  const usingFixture = reveal.mode === "mini-scene" && !reveal.src && Boolean(fixtureSrc);
  const src = reveal.mode === "mini-scene" ? (reveal.src ?? fixtureSrc) : undefined;
  // A mini-scene is playable only with prepared media. Publication approval is checked for real
  // media; the labeled test pattern exists only to exercise the player in development.
  const playable = !reduced && (isLoop || (Boolean(src) && (usingFixture || reveal.readiness.approvedForPublication)));
  const active = state === "loading" || state === "playing";

  const stop = (next: PlayState) => {
    videoRef.current?.pause();
    if (stopCurrent === stopSelf.current) stopCurrent = null;
    setState(next);
  };
  const stopSelf = useRef<() => void>(() => {});
  useEffect(() => {
    stopSelf.current = () => stop("idle");
  });

  // Leaving the view, switching product or closing the expanded view stops playback.
  useEffect(() => {
    const self = stopSelf;
    return () => {
      if (stopCurrent === self.current) stopCurrent = null;
    };
  }, []);

  // A loop has no media file: it runs for a fixed, short time and settles.
  useEffect(() => {
    if (!(isLoop && state === "playing")) return;
    const timer = setTimeout(() => setState("ended"), LOOP_MS);
    return () => clearTimeout(timer);
  }, [isLoop, state]);

  // Slow or stalled media falls back to the still instead of leaving a spinner.
  useEffect(() => {
    if (state !== "loading") return;
    const timer = setTimeout(() => setState("failed"), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const play = () => {
    if (!playable) return;
    stopCurrent?.();
    stopCurrent = stopSelf.current;
    setMuted(true);
    setState(isLoop ? "playing" : "loading");
  };

  if (reveal.mode === "none") {
    return <Still product={product} formId={form.id} />;
  }

  return (
    <div data-testid="reveal-player" data-state={state} data-form={form.id} className="relative aspect-[4/5] w-full overflow-hidden bg-bone text-ink">
      <Still product={product} formId={form.id} bare />

      {isLoop && state === "playing" && <span aria-hidden="true" className="reveal-sweep absolute inset-0" />}

      {src && active && (
        <video
          ref={videoRef}
          data-testid="reveal-video"
          className={`absolute inset-0 h-full w-full bg-ink object-cover ${state === "playing" ? "opacity-100" : "opacity-0"}`}
          src={src}
          muted={muted}
          playsInline
          preload="auto"
          onCanPlay={(e) => {
            void e.currentTarget.play().then(
              () => setState((s) => (s === "loading" ? "playing" : s)),
              () => setState("failed"),
            );
          }}
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime >= reveal.maxSeconds) stop("ended");
          }}
          onEnded={() => stop("ended")}
          onError={() => setState("failed")}
        />
      )}

      {state === "ended" && (
        <div data-testid="reveal-final" data-form={form.id} className="fade-in absolute inset-0 bg-bone">
          <ProductPieces product={product} formId={form.id} scale={form.components.length > 1 ? 0.62 : 0.3} shadow="soft" />
        </div>
      )}

      {playable && !active && state !== "ended" && (
        <button
          type="button"
          data-testid="reveal-artwork"
          aria-label={`Watch the ${reveal.title.toLowerCase()} for ${product.title}`}
          onClick={play}
          className="absolute inset-0 cursor-pointer"
        />
      )}

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <p className="label-xs text-ink/60">
          {reveal.title}
          {usingFixture && <span data-testid="reveal-fixture-tag"> · test pattern, not campaign media</span>}
        </p>
        {active && (
          <button type="button" data-testid="reveal-skip" onClick={() => stop("ended")} className="label-xs inline-flex min-h-11 items-center bg-ink px-3 text-ivory">
            Skip
          </button>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-3">
        <div className="flex flex-wrap gap-2">
          {playable && !active && (
            <button
              type="button"
              data-testid={state === "ended" ? "reveal-replay" : "reveal-watch"}
              onClick={play}
              className="label-xs inline-flex min-h-11 items-center bg-ink px-4 text-ivory"
            >
              {state === "ended" ? "Replay" : "Watch reveal"}
            </button>
          )}
          {src && active && (
            <button
              type="button"
              data-testid="reveal-sound"
              aria-pressed={!muted}
              onClick={() => setMuted((m) => !m)}
              className="label-xs inline-flex min-h-11 items-center bg-ink px-4 text-ivory"
            >
              {muted ? "Sound off" : "Sound on"}
            </button>
          )}
          {playable && onExpand && !active && (
            <button type="button" data-testid="reveal-expand" onClick={onExpand} className="label-xs inline-flex min-h-11 items-center px-3 text-ink underline underline-offset-4">
              Expand
            </button>
          )}
        </div>
        <p role="status" data-testid="reveal-status" className="label-xs max-w-[60%] text-right leading-relaxed text-ink/60">
          {state === "loading" && "Loading reveal…"}
          {state === "failed" && "The reveal couldn't play. Showing the still instead."}
          {!playable && reduced && "Reduced motion is on. Showing the still."}
          {!playable && !reduced && "Reveal in preparation. Showing the still."}
        </p>
      </div>
    </div>
  );
}

function Still({ product, formId, bare = false }: { product: Product; formId: string; bare?: boolean }) {
  const form = formOf(product, formId);
  const pieces = <ProductPieces product={product} formId={form.id} scale={form.components.length > 1 ? 0.62 : 0.3} shadow="soft" />;
  if (bare) return <div className="absolute inset-0">{pieces}</div>;
  return <div className="relative aspect-[4/5] w-full bg-bone">{pieces}</div>;
}
