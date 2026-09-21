"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/catalog/types";
import { beatAt, totalSeconds, type CollectionStory, type StoryMedia } from "@/lib/story";
import { Modal } from "@/components/layout/Modal";
import { PlaceholderFigure } from "./StoryCharacter";
import { StoryVisual } from "./StoryVisual";

// The special cinematic: one short action, sand fills the frame as the hidden cut, then the close-up
// with the jewelry worn. It opens only from a press, Skip is there from the first frame, Escape skips
// too, and it always ends in the product experience. The timeline is the story's beat data.
//
// Until real footage exists this draws a labelled storyboard animatic from whatever stills this build
// has, or from placeholders. When footage is supplied in the `video` slot it plays underneath the
// same timeline, and the close-up and the jewelry overlay still come from the page, never the clip.
export function StoryCinematic({
  open,
  story,
  media,
  internal,
  product,
  formId,
  onFinish,
}: {
  open: boolean;
  story: CollectionStory;
  media: StoryMedia;
  internal: boolean;
  product: Product;
  formId: string;
  /** Called once, whether the story ran to its end or was skipped. */
  onFinish: (how: "ended" | "skipped") => void;
}) {
  return (
    <Modal open={open} onClose={() => onFinish("skipped")} label={`${product.title} story`} variant="full">
      {open && <Sequence story={story} media={media} internal={internal} product={product} formId={formId} onFinish={onFinish} />}
    </Modal>
  );
}

function Sequence({
  story,
  media,
  internal,
  product,
  formId,
  onFinish,
}: {
  story: CollectionStory;
  media: StoryMedia;
  internal: boolean;
  product: Product;
  formId: string;
  onFinish: (how: "ended" | "skipped") => void;
}) {
  const total = totalSeconds(story);
  const [beat, setBeat] = useState(story.beats[0]);
  const [videoFailed, setVideoFailed] = useState(false);
  const finish = useRef(onFinish);
  useEffect(() => {
    finish.current = onFinish;
  });

  // Skip takes focus as the dialog opens. It is asked for a frame late, because the dialog itself
  // opens after this component mounts, and not every browser focuses a button by itself.
  const skip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => skip.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const seconds = (now - started) / 1000;
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
  }, [story, total]);

  const footage = media.video && !videoFailed ? media.video : undefined;
  const closeupAt = story.beats.find((b) => b.id === "closeup")?.from ?? total;

  return (
    <div
      data-testid="story-cinematic"
      data-beat={beat.id}
      data-footage={footage ? "video" : "animatic"}
      className="story-light relative h-full w-full overflow-hidden"
      style={{ "--beat": `${beat.to - beat.from}s`, "--total": `${total}s` } as React.CSSProperties}
    >
      {footage ? (
        <video
          data-testid="story-video"
          className="absolute inset-0 h-full w-full object-cover"
          src={footage}
          muted
          playsInline
          autoPlay
          onTimeUpdate={(e) => {
            // The clip only ever covers the action. The close-up belongs to the page.
            if (e.currentTarget.currentTime >= closeupAt) e.currentTarget.pause();
          }}
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <>
          <div className="cine-character">
            {media.character ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media.character} alt="" draggable={false} className="story-figure-still block h-full w-full select-none object-cover object-top" />
            ) : (
              <PlaceholderFigure className="block h-full w-full" />
            )}
          </div>
          <div className="cine-shield" aria-hidden="true" />
          <div className="cine-opponent">
            <PlaceholderFigure tone="slate" className="block h-full w-full" />
            <span className="label-xs absolute -top-6 left-1/2 w-max -translate-x-1/2 text-ink/60">
              {internal ? `${story.internal.opponent} · placeholder` : "Placeholder"}
            </span>
          </div>
        </>
      )}

      <div className="cine-sand grain" aria-hidden="true" style={media.sand ? { backgroundImage: `url(${media.sand})` } : undefined} />

      <div className="cine-closeup">
        {beat.id === "closeup" && <StoryVisual story={story} media={media} product={product} formId={formId} internal={internal} captions={false} />}
      </div>

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 sm:p-6">
        <p data-testid="story-cinematic-tag" className="label-xs max-w-[60%] leading-relaxed text-white mix-blend-difference">
          {footage ? product.title : "Storyboard animatic · placeholder media · not the final cinematic"}
          {internal && <span className="block">{story.internal.notice}</span>}
        </p>
        <button
          ref={skip}
          type="button"
          data-testid="story-skip"
          onClick={() => onFinish("skipped")}
          className="label-xs inline-flex min-h-11 items-center bg-ink px-4 text-ivory"
        >
          Skip <span aria-hidden="true">&nbsp;→</span>
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <p role="status" data-testid="story-beat" className="label-xs text-white mix-blend-difference">
          {beat.caption}
        </p>
        <div className="mt-3 h-px w-full bg-ink/15">
          <div className="cine-progress h-px w-full bg-ink" />
        </div>
      </div>
    </div>
  );
}
