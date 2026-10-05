import { internalConceptUrl } from "./internal-media";
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
  const slots = { character: "seated", closeup: "closeup-clean", portrait: "start", sand: "sand", sandfx: "sandfx" };
  return Object.fromEntries(Object.entries(slots).flatMap(([slot, name]) => {
    const url = internalConceptUrl(name, internal);
    return url ? [[slot, url]] : [];
  }));
}

export type MascotMedia = { idle: string; blink: string; yawn: string; page: string; look: string };

/**
 * The homepage mascot is a franchise character in a cute style, so it is internal concept material
 * like the rest: a development server gets its pictures, every build gets none and shows jewelry instead.
 */
export function internalMascotMedia(internal: boolean): MascotMedia | null {
  const idle = internalConceptUrl("chibi-idle", internal);
  if (!idle) return null;
  // An incomplete pose set may still use the real idle still without requesting missing files.
  const at = (pose: string) => internalConceptUrl(`chibi-${pose}`, internal) ?? idle;
  return { idle, blink: at("blink"), yawn: at("yawn"), page: at("page"), look: at("look") };
}

/** The companion still for the homepage world. Development server only; a build leaves the section out. */
export function internalCompanionStill(internal: boolean): string | undefined {
  return internalConceptUrl("companion-dune", internal);
}

export type MascotClips = { idle: string; react: string };

/**
 * The mascot's animated clips, generated on this machine. Like the stills they only exist on a
 * development server; a build gets null and the page falls back to the still poses.
 */
export function internalMascotClips(internal: boolean): MascotClips | null {
  const idle = internalConceptUrl("mascot-idle", internal);
  const react = internalConceptUrl("mascot-react", internal);
  return idle && react ? { idle, react } : null;
}

/**
 * The sand clips for page transitions, development server only. The local one is composed on this
 * machine and is what the transition uses; the earlier supplied clip stays as a fallback until the
 * local transition has been reviewed.
 */
export function internalSandSource(internal: boolean): string | undefined {
  return internalConceptUrl("sandfx-local", internal);
}

export function internalSandFallback(internal: boolean): string | undefined {
  return internalConceptUrl("sandfx", internal);
}
