import type { LaunchSlide } from "@/types/launch";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import { getSlideInteraction } from "@/lib/slideContent";
import { getSlidePrompts } from "@/lib/slideTrainer";
import { BreakoutTrainerPanel } from "@/components/launch/trainer/BreakoutTrainerPanel";
import { BibleStudyTrainerPanel } from "@/components/launch/trainer/BibleStudyTrainerPanel";

type TrainerNotesContentProps = {
  slide: LaunchSlide;
};

/**
 * Facilitator cadence — only for `/trainer` (private). Never mount on `/present`.
 */
export function TrainerNotesContent({ slide }: TrainerNotesContentProps) {
  const { mode, presentationLock } = useLaunchSession();
  if (mode === "presentation" || presentationLock) {
    return null;
  }

  const interaction = getSlideInteraction(slide);
  const prompts = getSlidePrompts(slide);
  const hasCadence =
    slide.timing ||
    slide.pauseCue ||
    (prompts && prompts.length > 0) ||
    slide.discussionHandoff ||
    slide.transitionCue;

  return (
    <div className="flex flex-col gap-8">
      {hasCadence && (
        <section
          className="rounded-xl border border-launch-gold/25 bg-launch-gold/[0.06] px-4 py-5 md:px-5 md:py-6"
          aria-label="Facilitation cadence"
        >
          <p className="launch-eyebrow text-launch-gold">Cadence</p>

          <div className="mt-5 flex flex-col gap-6">
            {slide.timing && (
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-launch-muted">
                  Time estimate
                </p>
                <p className="mt-2 font-mono text-base text-launch-primary">
                  {slide.timing}
                </p>
              </div>
            )}

            {slide.pauseCue && (
              <div
                className={
                  slide.timing ? "border-t border-launch-neutral/35 pt-6" : ""
                }
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-launch-muted">
                  When to pause
                </p>
                <p className="mt-2 text-sm leading-relaxed text-launch-secondary md:text-base">
                  {slide.pauseCue}
                </p>
              </div>
            )}

            {prompts && prompts.length > 0 && (
              <div
                className={
                  slide.timing || slide.pauseCue
                    ? "border-t border-launch-neutral/35 pt-6"
                    : ""
                }
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-launch-muted">
                  When to ask a question
                </p>
                <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-launch-secondary md:text-base">
                  {prompts.map((q) => (
                    <li key={q} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-launch-gold/80" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {slide.discussionHandoff && (
              <div
                className={
                  slide.timing || slide.pauseCue || prompts?.length
                    ? "border-t border-launch-neutral/35 pt-6"
                    : ""
                }
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-launch-muted">
                  When to switch to discussion
                </p>
                <p className="mt-2 text-sm leading-relaxed text-launch-secondary md:text-base">
                  {slide.discussionHandoff}
                </p>
              </div>
            )}

            {slide.transitionCue && (
              <div
                className={
                  slide.timing ||
                  slide.pauseCue ||
                  prompts?.length ||
                  slide.discussionHandoff
                    ? "border-t border-launch-neutral/35 pt-6"
                    : ""
                }
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-launch-muted">
                  Transition / next beat
                </p>
                <p className="mt-2 text-sm leading-relaxed text-launch-secondary md:text-base">
                  {slide.transitionCue}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <BreakoutTrainerPanel slide={slide} />

      <BibleStudyTrainerPanel slide={slide} />

      <div>
        <p className="launch-eyebrow text-launch-muted">Script / notes</p>
        <p className="mt-3 text-launch-body text-launch-secondary md:text-base">
          {slide.trainerNotes}
        </p>
      </div>

      {interaction && (
        <div className="rounded-xl border border-launch-soft/20 bg-launch-soft/[0.06] px-4 py-4">
          <p className="launch-eyebrow text-launch-steel/90">Room prompt (on slide)</p>
          <p className="mt-2 text-sm leading-relaxed text-launch-secondary md:text-base">
            {interaction}
          </p>
        </div>
      )}

    </div>
  );
}
