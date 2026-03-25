import type { AudienceLaunchSlide, InteractionType } from "@/types/launch";

export type SlideMomentType = "standard" | "discussion" | "reflection" | "pairShare";

/** Canonical audience/participant prompt (`interaction` preferred; `interactionPrompt` legacy). */
export function getSlideInteraction(slide: AudienceLaunchSlide): string | undefined {
  const t = slide.interaction ?? slide.interactionPrompt;
  const s = t?.trim();
  return s ? s : undefined;
}

/** Participant / presentation prompts (after normalize merge). */
export function getSlidePromptLines(slide: AudienceLaunchSlide): string[] {
  if (!Array.isArray(slide.prompts) || slide.prompts.length === 0) return [];
  return slide.prompts.map((p) => String(p));
}

/** True when every slide prompt is allowed to show (progressive reveal complete or not used). */
export function promptsFullyRevealed(slide: AudienceLaunchSlide): boolean {
  const lines = getSlidePromptLines(slide);
  if (lines.length === 0) return true;
  const v = slide.promptRevealVisibleCount;
  if (v == null) return true;
  return v >= lines.length;
}

/**
 * Participant UI mode: explicit `interactionType`, else inferred from content.
 */
export function resolveInteractionType(slide: AudienceLaunchSlide): InteractionType {
  if (slide.interactionType) return slide.interactionType;
  if (slide.interactionData?.prompt?.trim()) return "fillIn";
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
