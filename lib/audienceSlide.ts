import type { AudienceLaunchSlide, LaunchSlide } from "@/types/launch";

/**
 * Strip facilitator-only fields before rendering on /present, workbook deck, or trainer preview.
 * Full `LaunchSlide` must never be passed to `Slide` / `SlideContent`.
 */
export function toAudienceSlide(slide: LaunchSlide): AudienceLaunchSlide {
  const {
    trainerNotes: _trainerNotes,
    timing: _timing,
    pauseCue: _pauseCue,
    promptQuestions: _promptQuestions,
    prompts: _prompts,
    discussionHandoff: _discussionHandoff,
    transitionCue: _transitionCue,
    breakout: _breakout,
    ...audience
  } = slide;
  return audience;
}
