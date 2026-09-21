import { desertEyeStory } from "./desert-eye";
import type { CollectionStory, StoryMedia } from "./types";

// Server-side registry. Pages read a story here and hand the client only what that build may show.

const STORIES: CollectionStory[] = [desertEyeStory];

/** The story for a collection, or undefined. A collection without one keeps the ordinary grid. */
export function storyFor(collectionSlug: string): CollectionStory | undefined {
  return STORIES.find((s) => s.collection === collectionSlug);
}

/** Internal review runs on a development server only. Preview and production deployments are builds. */
export function isInternalReview(): boolean {
  return process.env.NODE_ENV !== "production";
}

/**
 * The story as a given build may see it. Outside internal review the working names and the
 * production briefs are removed, so they are in neither the page nor the client bundle.
 */
export function storyForBuild(story: CollectionStory, internal: boolean): CollectionStory {
  if (internal) return story;
  return {
    ...story,
    internal: { character: story.publicCharacterLabel, opponent: "Opponent", notice: "" },
    slots: story.slots.map((slot) => ({ ...slot, brief: "" })),
  };
}

/** Internal media addresses, served only by a development server. A build gets none. */
export function internalStoryMedia(story: CollectionStory, internal: boolean): StoryMedia {
  if (!internal || story.readiness.characterMedia !== "internal-concept") return {};
  return {
    character: "/api/dev-concept/seated",
    closeup: "/api/dev-concept/closeup-clean",
    portrait: "/api/dev-concept/start",
    sand: "/api/dev-concept/sand",
    sandfx: "/api/dev-concept/sandfx",
  };
}

export type MascotMedia = { idle: string; blink: string; yawn: string; page: string; look: string };

/**
 * The homepage mascot is a franchise character in a cute style, so it is internal concept material
 * like the rest: a development server gets its pictures, every build gets none and shows jewelry instead.
 */
export function internalMascotMedia(internal: boolean): MascotMedia | null {
  if (!internal) return null;
  const at = (pose: string) => `/api/dev-concept/chibi-${pose}`;
  return { idle: at("idle"), blink: at("blink"), yawn: at("yawn"), page: at("page"), look: at("look") };
}

/** The sand clip for page transitions. Development server only, like the rest of the internal media. */
export function internalSandSource(internal: boolean): string | undefined {
  return internal ? "/api/dev-concept/sandfx" : undefined;
}
