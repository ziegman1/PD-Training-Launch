import type { LaunchSlide } from "@/types/launch";

/** Questions for trainer cadence — supports `prompts` or `promptQuestions`. */
export function getSlidePrompts(slide: LaunchSlide): string[] | undefined {
  const p = slide.prompts ?? slide.promptQuestions;
  return p?.length ? p : undefined;
}
