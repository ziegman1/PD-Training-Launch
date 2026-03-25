import type { LaunchSlide } from "@/types/launch";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import { getSlideInteraction } from "@/lib/slideContent";
import { getSlidePrompts } from "@/lib/slideTrainer";
import { BreakoutTrainerPanel } from "@/components/launch/trainer/BreakoutTrainerPanel";
import { BibleStudyTrainerPanel } from "@/components/launch/trainer/BibleStudyTrainerPanel";

type TrainerNotesContentProps = {
  slide: LaunchSlide;
};

const sectionShell = "rounded-xl border px-4 py-5 md:px-5 md:py-6";
const cadenceShell = `${sectionShell} border-launch-gold/25 bg-launch-gold/[0.06]`;
const transitionShell = `${sectionShell} border-launch-steel/25 bg-launch-steel/[0.05]`;
const scriptShell = `${sectionShell} border-launch-neutral/30 bg-black/20`;
const timingShell = `${sectionShell} border-launch-neutral/25 bg-launch-navy/30`;

function parseScriptNoteLines(text: string): string[] {
  return text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-•*]\s*/, ""));
}

/** Script notes: render as bullets when most non-empty lines look like list items. */
function TrainerScriptNotesBody({ text }: { text: string }) {
  const rawLines = text.split(/\n/).map((l) => l.trim());
  const nonEmpty = rawLines.filter(Boolean);
  const bulletLike = nonEmpty.filter((l) => /^[-•*]/.test(l));
  const items =
    bulletLike.length > 0 && bulletLike.length >= nonEmpty.length * 0.5
      ? parseScriptNoteLines(text)
      : null;

  if (items && items.length > 0) {
    return (
      <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-launch-secondary md:text-base">
        {items.map((line, i) => (
          <li key={`${i}-${line.slice(0, 24)}`} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-launch-steel/70" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-launch-secondary md:text-base">
      {text.trim()}
    </p>
  );
}

function CadenceBody({ text }: { text: string }) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length <= 1) {
    return (
      <div className="mt-4 text-base leading-[1.65] text-launch-primary md:text-[1.05rem]">
        {blocks[0] ?? text.trim()}
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-4 text-base leading-[1.65] text-launch-primary md:text-[1.05rem]">
      {blocks.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/**
 * Facilitator coaching — `/trainer` only. Cadence = say aloud; transition = bridge; script = internal.
 */
export function TrainerNotesContent({ slide }: TrainerNotesContentProps) {
  const { mode, presentationLock } = useLaunchSession();
  if (mode === "presentation" || presentationLock) {
    return null;
  }

  const interaction = getSlideInteraction(slide);
  const prompts = getSlidePrompts(slide);
  const promptRevealLimit =
    prompts && prompts.length > 0
      ? typeof slide.promptRevealVisibleCount === "number"
        ? Math.min(
            prompts.length,
            Math.max(0, Math.floor(slide.promptRevealVisibleCount)),
          )
        : prompts.length
      : 0;

  const hasTimingBlock =
    slide.timing ||
    slide.pauseCue ||
    (prompts && prompts.length > 0) ||
    slide.discussionHandoff;

  const hasCadence = Boolean(slide.trainerCadence?.trim());
  const hasTransition = Boolean(slide.trainerTransition?.trim());
  const hasScript = Boolean(slide.trainerScriptNotes?.trim());

  return (
    <div className="flex flex-col gap-6">
      {hasTimingBlock && (
        <section className={timingShell} aria-label="Timing and facilitation structure">
          <p className="launch-eyebrow text-launch-muted">Timing & structure</p>
          <p className="mt-1 text-xs text-launch-muted/80">
            Logistics and room mechanics — not necessarily spoken verbatim.
          </p>

          <div className="mt-5 flex flex-col gap-6">
            {slide.timing && (
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-launch-muted">
                  Time estimate
                </p>
                <p className="mt-2 font-mono text-base text-launch-primary">{slide.timing}</p>
              </div>
            )}

            {slide.pauseCue && (
              <div
                className={slide.timing ? "border-t border-launch-neutral/35 pt-6" : ""}
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
                  Questions you may put to the room
                </p>
                <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-launch-secondary md:text-base">
                  {prompts.map((q, i) => {
                    const revealed = i < promptRevealLimit;
                    return (
                      <li
                        key={q}
                        className={`flex gap-2 ${
                          revealed ? "" : "pointer-events-none opacity-0"
                        }`.trim()}
                        aria-hidden={!revealed}
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-launch-steel/80" />
                        <span>{q}</span>
                      </li>
                    );
                  })}
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
                  Discussion / room handoff
                </p>
                <p className="mt-2 text-sm leading-relaxed text-launch-secondary md:text-base">
                  {slide.discussionHandoff}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <BreakoutTrainerPanel slide={slide} />

      <BibleStudyTrainerPanel slide={slide} />

      {hasCadence && (
        <section className={cadenceShell} aria-label="Cadence — say aloud">
          <p className="launch-eyebrow text-launch-gold">Cadence</p>
          <p className="mt-1 text-xs text-launch-muted/85">
            Say this in your own voice — conversational, not bullet points.
          </p>
          <CadenceBody text={slide.trainerCadence} />
        </section>
      )}

      {hasTransition && (
        <section className={transitionShell} aria-label="Transition to next slide">
          <p className="launch-eyebrow text-launch-steel/95">Transition</p>
          <p className="mt-1 text-xs text-launch-muted/85">
            Spoken bridge before you advance — one or two confident sentences.
          </p>
          <p className="mt-4 text-base leading-relaxed text-launch-primary md:text-[1.05rem]">
            {slide.trainerTransition}
          </p>
        </section>
      )}

      {hasScript && (
        <section className={scriptShell} aria-label="Script notes — internal coaching">
          <p className="launch-eyebrow text-launch-muted">Script notes</p>
          <p className="mt-1 text-xs text-launch-muted/85">
            Internal only — pacing, tone, and what to watch for in the room.
          </p>
          <TrainerScriptNotesBody text={slide.trainerScriptNotes} />
        </section>
      )}

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
