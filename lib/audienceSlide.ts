import type { AudienceLaunchSlide, LaunchSlide } from "@/types/launch";

/**
 * Strip facilitator-only fields before rendering on /present, workbook deck, or trainer preview.
 * Full `LaunchSlide` must never be passed to `Slide` / `SlideContent`.
 */
export function toAudienceSlide(slide: LaunchSlide): AudienceLaunchSlide {
  const {
    trainerCadence: _trainerCadence,
    trainerTransition: _trainerTransition,
    trainerScriptNotes: _trainerScriptNotes,
    timing: _timing,
    pauseCue: _pauseCue,
    promptQuestions: _promptQuestions,
    discussionHandoff: _discussionHandoff,
    transitionCue: _transitionCue,
    breakout: _breakout,
    progressiveReveal: _progressiveReveal,
    progressiveRevealLeadIn: _progressiveRevealLeadIn,
    ...audience
  } = slide;
  return audience;
}
