import type { AudienceLaunchSlide, InteractionType } from "@/types/launch";

export type SlideMomentType = "standard" | "discussion" | "reflection" | "pairShare";

type InteractionFields = Pick<
  AudienceLaunchSlide,
  "interaction" | "interactionPrompt"
>;

/** Canonical audience/participant prompt (`interaction` preferred; `interactionPrompt` legacy). */
export function getSlideInteraction(slide: InteractionFields): string | undefined {
  const t = slide.interaction ?? slide.interactionPrompt;
  const s = t?.trim();
  return s ? s : undefined;
}

/** Non-empty trimmed lines from `interaction` / `interactionPrompt` (Together progressive steps). */
export function getSlideInteractionLines(slide: InteractionFields): string[] {
  const t = getSlideInteraction(slide);
  if (!t) return [];
  return t
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** True when progressive interaction (Together lines) is complete or unused. */
export function interactionFullyRevealed(slide: AudienceLaunchSlide): boolean {
  const lines = getSlideInteractionLines(slide);
  if (lines.length === 0) return true;
  const v = slide.interactionRevealVisibleCount;
  if (v == null) return true;
  return v >= lines.length;
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
 * Discussion / pair / prayer layouts: show the main participant prompt card (below numbered prompts)
 * only after room prompts are complete **and**, when the deck uses `interactionRevealVisibleCount`,
 * after advancing past the “prompts-only” beat (`iv` > 0). Keeps facilitation copy off the same step
 * as the last room prompt.
 */
export function momentParticipantPromptVisible(slide: AudienceLaunchSlide): boolean {
  if (!getSlideInteraction(slide)) return false;
  if (!promptsFullyRevealed(slide)) return false;
  if (typeof slide.interactionRevealVisibleCount !== "number") return true;
  return slide.interactionRevealVisibleCount > 0;
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
