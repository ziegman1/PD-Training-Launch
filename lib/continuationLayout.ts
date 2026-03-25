import type { AudienceLaunchSlide, LaunchSession } from "@/types/launch";

const DEFAULT_MAX_BULLETS = 5;
const DEFAULT_MAX_PROMPTS = 8;

/**
 * For Presentation Mode: max bullet count among slides sharing `continuationGroup`.
 * Used to pad the bullet list so row count (and vertical layout) stays fixed within the group.
 */
export function getContinuationMaxBulletCount(
  session: LaunchSession,
  slide: AudienceLaunchSlide,
  cap = DEFAULT_MAX_BULLETS,
): number | undefined {
  if (!slide.continuationGroup) return undefined;
  const inGroup = session.slides.filter(
    (s) => s.continuationGroup === slide.continuationGroup,
  );
  if (inGroup.length < 2) return undefined;
  const max = Math.max(...inGroup.map((s) => s.bullets.length));
  return Math.min(max, cap);
}

/**
 * Same as bullets: max `prompts` length within the continuation group (locked prompt rail height).
 */
export function getContinuationMaxPromptCount(
  session: LaunchSession,
  slide: AudienceLaunchSlide,
  cap = DEFAULT_MAX_PROMPTS,
): number | undefined {
  if (!slide.continuationGroup) return undefined;
  const inGroup = session.slides.filter(
    (s) => s.continuationGroup === slide.continuationGroup,
  );
  if (inGroup.length < 2) return undefined;
  const max = Math.max(...inGroup.map((s) => s.prompts?.length ?? 0));
  if (max < 1) return undefined;
  return Math.min(max, cap);
}
