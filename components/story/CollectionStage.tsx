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
}: {
  story: CollectionStory;
  collection: Collection;
  products: Product[];
  /** Addresses of internal stills. Empty in every build, so builds draw labelled placeholders. */
  media: StoryMedia;
  internal: boolean;
  initialProduct?: string;
  initialForm?: string;
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
  const statusNote = reducedMotion
    ? "Reduced motion is on. The story is skipped and the piece opens directly."
    : !playable
      ? "Story in preparation. The piece opens directly."
      : "About six seconds. Skip at any time. It never plays by itself.";

  return (
    <section ref={section} data-testid="story-stage" data-mode={active ? "product" : "browse"} data-internal={internal} className="story-light scroll-mt-16">
      {active ? (
        <StoryProductExperience
          key={active.id}
          story={story}
          media={media}
          internal={internal}
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
        <div className="mx-auto grid max-w-[110rem] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="relative h-[68svh] min-h-[26rem] px-5 pt-6 sm:px-8 lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)] lg:self-start lg:pt-10">
            <StoryCharacter
              buttonRef={character}
              src={media.character}
              label={playable && !seen ? `Watch the ${collection.title} story` : `Open ${storyProduct.title}`}
              caption={
                internal
                  ? `${story.internal.character} · ${story.internal.notice}`
                  : `${story.publicCharacterLabel} placeholder · not a person · artwork in preparation`
              }
              reactionMs={story.microReactionMs}
              onPress={pressCharacter}
            />
          </div>

          <div className="relative px-5 sm:px-8 lg:pl-0 lg:pr-12">
            <header className="pt-8 lg:absolute lg:z-10 lg:max-w-sm lg:pt-14">
              <p className="label-xs text-ink/60">Collection {collection.number}</p>
              <h1 className="mt-3 font-display text-6xl font-light leading-none sm:text-8xl">{collection.title}</h1>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/60">
                {collection.blurb} Concept pieces with demo prices. Materials, dimensions and compatibility are not verified yet.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-6">
                <button type="button" data-testid="story-watch" onClick={playable ? playStory : pressCharacter} className="text-link">
                  {watchLabel} <span aria-hidden="true">→</span>
                </button>
                <span className="label-xs text-ink/60 lg:hidden">or tap the character</span>
              </div>
              <p data-testid="story-status" className="label-xs mt-1 max-w-sm leading-relaxed text-ink/60">
                {statusNote}
              </p>
            </header>

            <ul aria-label={`${collection.title} pieces`} className="story-canvas mt-12 lg:mt-0">
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
          </div>
        </div>
      )}

      <StoryCinematic open={playing} story={story} media={media} internal={internal} product={storyProduct} formId={storyFormId} onFinish={finishStory} />
    </section>
  );
}
