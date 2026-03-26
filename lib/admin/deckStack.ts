import type { LaunchSlide } from "@/types/launch";

/**
 * Returns contiguous `LaunchSlide[]` rows from the normalized session JSON that correspond to one
 * authoring slide: slides sharing `continuationGroup === authoringSlideId` (bullets/prompts stack)
 * or `authoringSlideId + "__ix"` (interaction / participation prompt subset). Falls back to id match
 * or ids prefixed `baseId__rg`.
 */
export function deckStackForAuthoringSlide(
  slides: LaunchSlide[],
  authoringSlideId: string,
): LaunchSlide[] {
  if (!authoringSlideId) return [];

  const ixGroup = `${authoringSlideId}__ix`;
  const grouped = slides.filter(
    (s) =>
      s.continuationGroup === authoringSlideId ||
      s.continuationGroup === ixGroup,
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
