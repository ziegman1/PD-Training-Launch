import type { AudienceLaunchSlide, LaunchSlide } from "@/types/launch";

/**
 * Stable key for workbook inputs when the deck uses progressive reveals:
 * multiple deck slides share `continuationGroup` and matching reveal counters.
 */
export function participantSlideKey(
  slide: LaunchSlide | AudienceLaunchSlide,
): string {
  if (
    slide.continuationGroup &&
    (typeof slide.bulletRevealVisibleCount === "number" ||
      typeof slide.promptRevealVisibleCount === "number" ||
      typeof slide.interactionRevealVisibleCount === "number")
  ) {
    return slide.continuationGroup;
  }
  return slide.id;
}
