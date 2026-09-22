"use client";

import { useEffect, useRef, useState } from "react";
import type { Product, ProductFilm as Film } from "@/lib/catalog/types";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";

// The approved product animation on the product stage. It follows the same rules as a reveal: it
// never autoplays, never starts on hover, loads its media only after a press, is muted unless the
// customer turns the sound on, can be skipped at once, and always leaves the completed piece in view.
// Material words are HTML laid over the picture from the moment each part seats. They are never part
// of the footage, and the film never stands in for Face Studio or for the exact product assets.
//
// Before the first press only the poster is on the page. With reduced motion, on a failure or after
// a skip, the completed piece is shown as a still. Once the film has played, its last frame holds.

type PlayState = "idle" | "loading" | "playing" | "ended" | "failed";

const LOAD_TIMEOUT_MS = 8000;

type Props = { product: Product; film: Film; formId: string };

// The motion preference is only known after mount, so a change of it starts a fresh stage, which
// then begins from its own first state and never has to be reset from an effect.
export function ProductFilm(props: Props) {
  const reduced = useReducedMotion();
  return <Stage key={String(reduced)} {...props} reduced={reduced} />;
}

function Stage({ product, film, formId, reduced }: Props & { reduced: boolean }) {
  // With reduced motion the completed piece is simply there.
  const [state, setState] = useState<PlayState>(reduced ? "ended" : "idle");
  const [muted, setMuted] = useState(true);
  // Which captions have had their moment. All of them, once the piece is complete.
  const [shown, setShown] = useState(0);
  const [held, setHeld] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const active = state === "loading" || state === "playing";
  const complete = state === "ended" || state === "failed";

  // Slow or stalled media falls back to the still instead of leaving the customer waiting.
  useEffect(() => {
    if (state !== "loading") return;
    const timer = setTimeout(() => setState("failed"), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const play = () => {
    if (reduced) return;
    setHeld(false);
    setShown(0);
    setMuted(true);
    setState("loading");
    // After a full play the element is still on the page, holding its last frame, and `canplay` will
    // not fire again: it is rewound and started here. A fresh element starts from `onCanPlay`.
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      void v.play().then(
        () => setState("playing"),
        () => setState("failed"),
      );
    }
  };

  const skip = () => {
    videoRef.current?.pause();
    setHeld(false);
    setState("ended");
  };

  // Every caption once the piece is complete, otherwise those whose moment has come.
  const captionsVisible = complete ? film.captions : film.captions.slice(0, shown);

  return (
    <figure data-testid="product-film" data-state={state} data-form={formId} className="product-film w-full">
      <div className="product-film-stage relative w-full">
      <div className="product-film-frame relative w-full overflow-hidden bg-paper">
        {/* The poster until the film is asked for; the completed piece once it is over. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={complete ? film.final : film.poster}
          alt={complete ? `${product.title}, the completed piece` : `${product.title} product animation, first frame`}
          data-testid={complete ? "film-final" : "film-poster"}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* The film is only on the page once the customer asks for it, and its last frame holds. */}
        {(active || held) && (
          <video
            ref={videoRef}
            data-testid="film-video"
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${state === "playing" || held ? "opacity-100" : "opacity-0"}`}
            muted={muted}
            playsInline
            preload="auto"
            poster={film.poster}
            onCanPlay={(e) => {
              if (state !== "loading") return;
              void e.currentTarget.play().then(
                () => setState((s) => (s === "loading" ? "playing" : s)),
                () => setState("failed"),
              );
            }}
            onTimeUpdate={(e) => {
              const t = e.currentTarget.currentTime;
              setShown(film.captions.filter((c) => t >= c.at).length);
            }}
            onEnded={() => {
              setHeld(true);
              setState("ended");
            }}
            onError={() => setState("failed")}
          >
            {film.sources.map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
          </video>
        )}

        {!reduced && !active && !complete && (
          <button type="button" data-testid="film-play-area" aria-label={`Play the product animation for ${product.title}`} onClick={play} className="group absolute inset-0 cursor-pointer">
            <span aria-hidden="true" className="label-xs absolute bottom-3 right-3 inline-flex min-h-11 items-center gap-2 bg-paper/90 px-4 text-ink transition-colors duration-300 group-hover:bg-paper">
              Play <span>▷</span>
            </span>
          </button>
        )}

        {active && (
          <button type="button" data-testid="film-skip" onClick={skip} className="label-xs absolute right-3 top-3 inline-flex min-h-11 items-center bg-paper/90 px-3 text-ink">
            Skip
          </button>
        )}
      </div>

      {/* Material words in HTML, from the moment each part seats. Never baked into the film. Over the
          quiet lower-left of the picture on a wide screen, under the frame on a phone. */}
      <dl data-testid="film-captions" className="product-film-captions" aria-live="polite">
        {captionsVisible.map((c) => (
          <div key={c.label} className="product-film-caption rise">
            <dt className="label-xs">{c.label}</dt>
            <dd className="label-xs text-ash">{c.status}</dd>
          </div>
        ))}
      </dl>
      </div>

      <figcaption className="label-xs mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <span className="text-ash">Prototype product animation · concept hardware · not a size</span>
        <span className="flex flex-wrap items-center gap-x-6">
          {!reduced && !active && (
            <button type="button" data-testid={complete ? "film-replay" : "film-play"} onClick={play} className="label-xs inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline">
              {complete ? "Replay" : "Play"}
            </button>
          )}
          {state === "playing" && (
            <button type="button" data-testid="film-sound" aria-pressed={!muted} onClick={() => setMuted((m) => !m)} className="label-xs inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline">
              {muted ? "Sound off" : "Sound on"}
            </button>
          )}
          <span role="status" data-testid="film-status" className="text-ash">
            {state === "loading" && "Loading…"}
            {state === "failed" && "The animation couldn't play. Showing the completed piece."}
            {reduced && "Reduced motion is on. Showing the completed piece."}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
