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
