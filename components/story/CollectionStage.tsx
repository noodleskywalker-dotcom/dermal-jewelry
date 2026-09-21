"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { formOf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { canPlayCinematic, floatingPieces, STORY_SEEN_PREFIX, type CollectionStory, type StoryMedia } from "@/lib/story";
import { useReducedMotion } from "@/lib/motion/useScrollProgress";
import { useStudio } from "@/components/studio/StudioProvider";
import { useChooseForm, useFormChoice } from "@/components/studio/useFormChoice";
import { FloatingPiece } from "./FloatingPiece";
import { StoryCharacter } from "./StoryCharacter";
import { StoryCinematic } from "./StoryCinematic";
import { StoryProductExperience, type StoryView } from "./StoryProductExperience";

// "Has this story played in this browser session?" Only that one flag is kept, in sessionStorage.
// It holds nothing about a photo, a face or a person.
const seenInMemory = new Set<string>();
const seenListeners = new Set<() => void>();
function subscribeSeen(callback: () => void) {
  seenListeners.add(callback);
  return () => {
    seenListeners.delete(callback);
  };
}
function readSeen(key: string): boolean {
  if (seenInMemory.has(key)) return true;
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
function markSeen(key: string) {
  seenInMemory.add(key);
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Storage can be unavailable. The in-memory flag still covers this page.
  }
  seenListeners.forEach((listener) => listener());
}

type Collection = { slug: string; number: string; title: string; blurb: string };

const UNVERIFIED_NOTE = "Concept pieces with demo prices. Materials, dimensions and compatibility are not verified yet.";

// A story-driven collection page. Three states share one section of an ordinary scrolling page:
// browsing (character and floating jewelry), the cinematic (a dialog opened by a press), and the
// product experience. Every route into shopping works without the cinematic.
export function CollectionStage({
  story,
  collection,
  products,
  media,
  internal,
  initialProduct,
  initialForm,
  continuesId,
}: {
  story: CollectionStory;
  collection: Collection;
  products: Product[];
  /** Addresses of internal stills. Empty in every build, so builds draw labelled placeholders. */
  media: StoryMedia;
  internal: boolean;
  initialProduct?: string;
  initialForm?: string;
  /** Id of the section that follows the stage, when there is one. The scroll cue points at it. */
  continuesId?: string;
}) {
  const reducedMotion = useReducedMotion();
  const storyProduct = products.find((p) => p.slug === story.productSlug) ?? products[0];
  const opened = products.find((p) => p.slug === initialProduct);

  const [active, setActive] = useState<Product | null>(opened ?? null);
  const [view, setView] = useState<StoryView>("concept");
  const [playing, setPlaying] = useState(false);
  const section = useRef<HTMLElement>(null);
  const character = useRef<HTMLButtonElement>(null);

  const seenKey = `${STORY_SEEN_PREFIX}${story.collection}`;
  const seen = useSyncExternalStore(
    subscribeSeen,
    () => readSeen(seenKey),
    () => false,
  );

  const current = active ?? storyProduct;
  const { form, choose } = useFormChoice(current, opened && current.id === opened.id ? initialForm : undefined);
  const chooseForm = useChooseForm();
  const { forms } = useStudio();
  // The cinematic always ends on the form the customer has chosen for the story's own design.
  const storyFormId = formOf(storyProduct, forms[storyProduct.id]).id;
  const playable = canPlayCinematic(story, { internal, reducedMotion });
  const pieces = floatingPieces(story, products);

  // The address may name a product and a form, and never anything else.
  const writeAddress = useCallback((product: Product | null, formId?: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("product");
    url.searchParams.delete("form");
    if (product) {
      url.searchParams.set("product", product.slug);
      if (formId) url.searchParams.set("form", formId);
    }
    window.history.replaceState(null, "", url);
  }, []);

  const toTop = () => section.current?.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });

  const openProduct = (product: Product, formId: string | undefined, nextView: StoryView) => {
    setActive(product);
    setView(nextView);
    writeAddress(product, formId);
    toTop();
  };

  const playStory = () => {
    // The product experience is already in place underneath, so Skip lands on it at once.
    openProduct(storyProduct, storyFormId, "concept");
    setPlaying(true);
  };

  const finishStory = () => {
    if (!playing) return;
    setPlaying(false);
    markSeen(seenKey);
  };

  // Once the story has played in this session, the character opens the piece and never replays by itself.
  const pressCharacter = () => {
    if (playable && !seen) playStory();
    else openProduct(storyProduct, storyFormId, "concept");
  };

  const back = () => {
    setActive(null);
    writeAddress(null);
    toTop();
  };
  // Returning to the collection puts focus back on the character.
  const wasActive = useRef(Boolean(opened));
  useEffect(() => {
    if (wasActive.current && !active) character.current?.focus({ preventScroll: true });
    wasActive.current = Boolean(active);
  }, [active]);

  const watchLabel = !playable ? "View the piece" : seen ? "Replay story" : "Watch story";


  return (
    <section ref={section} data-testid="story-stage" data-mode={active ? "product" : "browse"} data-internal={internal} className="story-light relative scroll-mt-16">
      {active ? (
        <StoryProductExperience
          key={active.id}
          story={story}
          media={media}
          product={active}
          form={form}
          view={view}
          collectionTitle={collection.title}
          replay={playable && active.id === storyProduct.id ? { label: seen ? "Replay story" : "Watch story", onPress: playStory } : undefined}
          onChooseForm={(formId) => {
            choose(formId);
            writeAddress(active, formId);
          }}
          onChooseView={setView}
          onBack={back}
        />
      ) : (
        <div className="story-browse">
          <header className="story-head lg:px-0">
            <p className="label-xs text-ink/60">Collection {collection.number}</p>
            <h1 className="mt-2 font-display text-5xl font-light leading-none sm:text-7xl lg:mt-3 lg:text-8xl">{collection.title}</h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/60 lg:mt-5">{collection.blurb}</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-5 lg:mt-5">
              <button type="button" data-testid="story-watch" onClick={playable ? playStory : pressCharacter} className="text-link">
                {watchLabel} <span aria-hidden="true">↗</span>
              </button>
              <span data-testid="story-label" className="label-xs text-ink/55">
                {story.storyLabel}
                {!playable && !reducedMotion && " · in preparation"}
              </span>
            </div>
            {reducedMotion && (
              <p data-testid="story-status" className="sr-only">
                Reduced motion is on. The story is skipped and the piece opens directly.
              </p>
            )}
            <p className="mt-6 hidden max-w-xs text-xs leading-relaxed text-ink/55 lg:block">{UNVERIFIED_NOTE}</p>
          </header>

          <div className="story-char-wrap">
            <StoryCharacter
              buttonRef={character}
              src={media.character}
              label={playable && !seen ? `Watch the ${collection.title} story` : `Open ${storyProduct.title}`}
              tag={playable && !seen ? "Watch story" : "View the piece"}
              reactionMs={story.microReactionMs}
              onPress={pressCharacter}
            />
            <div className="story-ground grain" aria-hidden="true" />
          </div>

          <ul aria-label={`${collection.title} pieces`} className="story-canvas">
            {pieces.map((piece, index) => (
              <FloatingPiece
                key={`${piece.product.id}:${piece.form.id}`}
                piece={piece}
                index={index}
                collectionSlug={collection.slug}
                sand
                onOpen={(nextView) => {
                  // Straight to the product. The cinematic is never in the way of shopping.
                  chooseForm(piece.product, piece.form.id);
                  openProduct(piece.product, piece.form.id, nextView);
                }}
              />
            ))}
          </ul>
          <p className="relative z-[2] px-6 pb-10 text-xs leading-relaxed text-ink/55 lg:hidden">{UNVERIFIED_NOTE}</p>

          {continuesId && (
            <a href={`#${continuesId}`} data-testid="story-scroll-cue" className="story-scroll-cue label-xs text-ink/70 hover:text-ink">
              Scroll
            </a>
          )}
        </div>
      )}

      {/* Development-only. Internal status never appears in a build. */}
      {internal && (
        <p data-testid="story-dev-note" className="story-dev absolute bottom-1 right-3 z-[4] hidden text-ink sm:block" title={story.internal.notice}>
          Dev only · internal concept media · not for publication
        </p>
      )}

      <StoryCinematic open={playing} story={story} media={media} internal={internal} product={storyProduct} formId={storyFormId} onFinish={finishStory} />
    </section>
  );
}
