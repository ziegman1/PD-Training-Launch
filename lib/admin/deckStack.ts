import type { LaunchSlide } from "@/types/launch";

/**
 * Returns contiguous `LaunchSlide[]` rows from the normalized session JSON that correspond to one
 * authoring slide: either all slides sharing `continuationGroup === authoringSlideId`, or the single
 * slide whose `id` matches when nothing was auto-expanded. Falls back to ids prefixed `baseId__rg`.
 */
export function deckStackForAuthoringSlide(
  slides: LaunchSlide[],
  authoringSlideId: string,
): LaunchSlide[] {
  if (!authoringSlideId) return [];

  const grouped = slides.filter(
    (s) => s.continuationGroup === authoringSlideId,
  );
  if (grouped.length > 0) {
    return grouped;
  }

  const byId = slides.filter((s) => s.id === authoringSlideId);
  if (byId.length > 0) {
    return byId;
  }

  const prefix = `${authoringSlideId}__rg`;
  const byRgPrefix = slides.filter((s) => s.id.startsWith(prefix));
  return byRgPrefix;
}
