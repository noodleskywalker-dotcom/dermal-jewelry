"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/catalog/types";
import { beatAt, totalSeconds, type CollectionStory, type StoryMedia } from "@/lib/story";
import { Modal } from "@/components/layout/Modal";
import { KeyedEffect } from "./KeyedEffect";
import { StoryVisual } from "./StoryVisual";

export type StoryOutcome = "ended" | "skipped" | "unavailable";

// The story: the seated figure is a still picture and stays one. A press sends sand from the opening
// of his gourd across the real page, the sand covers everything, and the cut to the close-up happens
// under it. The sand is separate, generic effect footage with no character in it, keyed in the browser.
//
// The dialog is transparent, so the sand really moves over the live page, with no frame around it.
// It opens only from a press, Skip is there from the first moment, Escape skips too, and it always
// ends in the product experience. Nothing starts until the footage and the close-up are loaded, and
// if they cannot be loaded or keyed the story is skipped rather than imitated.
export function StoryCinematic({
  open,
  story,
  media,
  internal,
  product,
  formId,
  getOrigin,
  onFinish,
}: {
  open: boolean;
  story: CollectionStory;
  media: StoryMedia;
  internal: boolean;
  product: Product;
  formId: string;
  /** Where the sand must first appear, in viewport pixels: the opening of the gourd on the page. */
  getOrigin: () => { x: number; y: number; pictureWidth: number } | null;
  /** Called once, however the story stopped. */
  onFinish: (how: StoryOutcome) => void;
}) {
  return (
    <Modal open={open} onClose={() => onFinish("skipped")} label={`${product.title} story`} variant="clear">
      {open && <Sequence story={story} media={media} internal={internal} product={product} formId={formId} getOrigin={getOrigin} onFinish={onFinish} />}
    </Modal>
  );
}

// Generous, because the alternative to waiting is no story at all. Skip is on screen the whole time.
const LOAD_TIMEOUT_MS = 12000;
const STALL_MS = 5000;

function Sequence({
  story,
  media,
  internal,
  product,
  formId,
  getOrigin,
  onFinish,
}: {
  story: CollectionStory;
  media: StoryMedia;
  internal: boolean;
  product: Product;
  formId: string;
  getOrigin: () => { x: number; y: number; pictureWidth: number } | null;
  onFinish: (how: StoryOutcome) => void;
}) {
  const effect = story.effect;
  const total = totalSeconds(story);
  const [ready, setReady] = useState<{ video: HTMLVideoElement; target: { x: number; y: number; pictureWidth: number } } | null>(null);
  const [beat, setBeat] = useState(story.beats[0]);
  const finish = useRef(onFinish);
  useEffect(() => {
    finish.current = onFinish;
  });

  // Skip takes focus as the dialog opens.
  const skip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => skip.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  // Load everything first. The reveal never starts on media that is not there.
  useEffect(() => {
    const src = effect ? media[effect.slot] : undefined;
    if (!effect || !src) {
      finish.current("unavailable");
      return;
    }
    let cancelled = false;
    // The figure's own picture may still be arriving, right after a reload for instance. The point the
    // sand comes from can only be found once it has been drawn.
    const origin = new Promise<{ x: number; y: number; pictureWidth: number }>((resolve) => {
      const look = () => {
        const found = getOrigin();
        if (found) resolve(found);
        else if (!cancelled) setTimeout(look, 100);
      };
      look();
    });
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    const fail = () => {
      if (!cancelled) finish.current("unavailable");
    };
    const timer = setTimeout(fail, LOAD_TIMEOUT_MS);
    const closeup = media.closeup ? new Image() : null;
    const pictures = closeup
      ? new Promise<void>((resolve) => {
          closeup.onload = closeup.onerror = () => resolve();
          closeup.src = media.closeup!;
        })
      : Promise.resolve();
    const footage = new Promise<void>((resolve, reject) => {
      video.oncanplaythrough = () => resolve();
      video.onerror = () => reject(new Error("footage"));
    });
    video.src = src;
    video.load();
    Promise.all([origin, footage, pictures]).then(
      ([target]) => {
        clearTimeout(timer);
        if (!cancelled) setReady({ video, target });
      },
      () => {
        clearTimeout(timer);
        fail();
      },
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
    // Loaded once per opening of the dialog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The clock starts only when everything is loaded. While the footage plays, the footage IS the clock,
  // so a slow device can never reach the cut before the sand has really covered the page.
  useEffect(() => {
    if (!ready || !effect) return;
    const { video } = ready;
    const started = performance.now();
    let frame = 0;
    let playing = false;
    let endedAt = 0;
    let lastAdvance = started;
    let lastTime = 0;
    const tick = (now: number) => {
      let seconds = (now - started) / 1000;
      if (seconds >= effect.startAt && !playing) {
        playing = true;
        lastAdvance = now;
        void video.play().catch(() => finish.current("unavailable"));
      }
      if (playing) {
        const done = video.ended || video.currentTime >= video.duration - 0.04;
        if (done && !endedAt) endedAt = now;
        seconds = endedAt ? effect.startAt + video.duration + (now - endedAt) / 1000 : effect.startAt + video.currentTime;
        if (video.currentTime !== lastTime) {
          lastTime = video.currentTime;
          lastAdvance = now;
        } else if (!endedAt && now - lastAdvance > STALL_MS) {
          finish.current("unavailable");
          return;
        }
      }
      if (seconds >= total) {
        finish.current("ended");
        return;
      }
      const current = beatAt(story, seconds);
      setBeat((prev) => (prev.id === current.id ? prev : current));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ready, effect, story, total]);

  const under = beat.id === "cover" || beat.id === "closeup";
  const dark = ready && (beat.id === "spread" || under);

  return (
    <div
      data-testid="story-cinematic"
      data-beat={ready ? beat.id : "loading"}
      data-ready={Boolean(ready)}
      className="relative h-full w-full overflow-hidden"
      style={{ "--total": `${total}s` } as React.CSSProperties}
    >
      {/* Mounted only under full sand, so the change of picture is never seen. */}
      {under && (
        <div data-testid="story-closeup" className="story-light absolute inset-0">
          <StoryVisual story={story} media={media} product={product} formId={formId} captions={false} />
        </div>
      )}

      {ready && effect && (
        <div className="story-effect-layer absolute inset-0 overflow-hidden" data-clearing={beat.id === "closeup"}>
          <KeyedEffect video={ready.video} effect={effect} target={ready.target} onUnavailable={() => onFinish("unavailable")} />
        </div>
      )}

      {/* Below the navigation bar, so nothing of the page is written over. */}
      <div className={`absolute inset-x-0 top-16 flex items-start justify-between gap-4 p-4 sm:p-6 ${dark ? "text-ink" : "text-ink"}`}>
        {/* On a phone the page's own heading is right here, so the label is left out and only Skip is shown. */}
        <p data-testid="story-cinematic-tag" className="label-xs invisible leading-relaxed sm:visible">
          {story.storyLabel}
          {/* Development-only. A build plays a story only once it is cleared and approved. */}
          {internal && <span className="story-dev block">Concept motion prototype · generated sand effect over a still · not final</span>}
        </p>
        <button ref={skip} type="button" data-testid="story-skip" onClick={() => onFinish("skipped")} className="label-xs inline-flex min-h-11 items-center bg-ink px-4 text-ivory">
          Skip <span aria-hidden="true">&nbsp;→</span>
        </button>
      </div>

      <p role="status" data-testid="story-beat" className="sr-only">
        {ready ? beat.caption : "Loading the story"}
      </p>
      <div className={`absolute inset-x-0 bottom-0 h-px ${dark ? "text-ink" : "text-ink"}`}>{ready && <div className="cine-progress h-px w-full bg-current" />}</div>
    </div>
  );
}
