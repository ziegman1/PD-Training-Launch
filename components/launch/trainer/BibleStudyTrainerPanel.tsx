import type { LaunchSlide } from "@/types/launch";

type BibleStudyTrainerPanelProps = {
  slide: LaunchSlide;
};

/**
 * Passage assignments for Scripture breakout — `/trainer` only.
 */
export function BibleStudyTrainerPanel({ slide }: BibleStudyTrainerPanelProps) {
  const groups = slide.bibleStudyGroups;
  if (!groups?.length) return null;

  return (
    <section
      className="rounded-xl border border-launch-gold/30 bg-launch-gold/[0.05] px-4 py-5 md:px-5 md:py-6"
      aria-label="Bible study group assignments"
    >
      <p className="launch-eyebrow text-launch-gold">Breakout passage themes</p>
      <p className="mt-2 text-sm leading-relaxed text-launch-secondary/95">
        Assign one theme per room (or combine adjacent themes if you have fewer
        rooms). Participants use their workbook to capture principles and
        takeaways.
      </p>
      <ol className="mt-5 space-y-5">
        {groups.map((g, i) => (
          <li
            key={g.id}
            className="rounded-lg border border-launch-neutral/30 bg-black/20 px-3 py-3 md:px-4 md:py-4"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-launch-muted">
              Group {i + 1}
            </p>
            <p className="mt-1.5 text-base font-semibold text-launch-primary">
              {g.topic}
            </p>
            {g.facilitatorNote ? (
              <p className="mt-2 text-sm leading-relaxed text-launch-secondary/90">
                {g.facilitatorNote}
              </p>
            ) : null}
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-relaxed text-launch-secondary md:text-base">
              {g.passages.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
