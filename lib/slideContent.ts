import type { AudienceLaunchSlide, InteractionType } from "@/types/launch";

export type SlideMomentType = "standard" | "discussion" | "reflection" | "pairShare";

/** Canonical audience/participant prompt (`interaction` preferred; `interactionPrompt` legacy). */
export function getSlideInteraction(slide: AudienceLaunchSlide): string | undefined {
  const t = slide.interaction ?? slide.interactionPrompt;
  const s = t?.trim();
  return s ? s : undefined;
}

/**
 * Participant UI mode: explicit `interactionType`, else inferred from content.
 */
export function resolveInteractionType(slide: AudienceLaunchSlide): InteractionType {
  if (slide.interactionType) return slide.interactionType;
  if (slide.fillInFields?.length) return "fillIn";
  if (getSlideInteraction(slide)) return "discussion";
  return "none";
}

/**
 * Main-slide layout: interactive moments vs standard content.
 * Fill-in / exercise slides stay standard (workbook handles inputs in the column).
 */
export function getSlideMomentType(slide: AudienceLaunchSlide): SlideMomentType {
  const explicit = slide.interactionType;
  if (
    explicit === "fillIn" ||
    explicit === "exercise" ||
    explicit === "bibleStudy"
  ) {
    return "standard";
  }
  if (explicit === "reflection") return "reflection";
  if (explicit === "pairShare") return "pairShare";
  if (explicit === "discussion" || explicit === "prayer") return "discussion";
  if (getSlideInteraction(slide)) return "discussion";
  return "standard";
}

/**
 * Participant column block type (avoid duplicating on-slide reflection textarea).
 */
export function resolveParticipantInteractionType(
  slide: AudienceLaunchSlide,
): InteractionType {
  if (slide.interactionType === "prayer") return "none";
  if (slide.interactionType === "bibleStudy") return "bibleStudy";
  if (getSlideMomentType(slide) === "reflection") return "none";
  return resolveInteractionType(slide);
}
