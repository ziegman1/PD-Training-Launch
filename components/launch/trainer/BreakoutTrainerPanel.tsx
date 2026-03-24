import type { LaunchSlide } from "@/types/launch";

type BreakoutTrainerPanelProps = {
  slide: LaunchSlide;
};

/**
 * Teams breakout logistics — `/trainer` only. Never mount on presentation surface.
 */
export function BreakoutTrainerPanel({ slide }: BreakoutTrainerPanelProps) {
  const b = slide.breakout;
  if (!b) return null;

  const hasStructuredContent =
    b.instructions?.length ||
    b.debrief?.length ||
    b.duration ||
    b.groupSize != null;

  if (!b.enabled && !hasStructuredContent) return null;

  const groupSize = b.groupSize ?? 2;
  const duration = b.duration ?? slide.timing ?? "";

  return (
    <section
      className={`rounded-xl border px-4 py-5 md:px-5 md:py-6 ${
        b.enabled
          ? "border-launch-steel/40 bg-launch-steel/[0.08]"
          : "border-launch-neutral/35 bg-black/20"
      }`}
      aria-label={b.enabled ? "Breakout facilitation" : "Structured activity"}
    >
      <div className="flex flex-wrap items-center gap-2">
        {b.enabled ? (
          <span className="inline-flex items-center rounded-full border border-launch-steel/50 bg-launch-navy/60 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-launch-steel">
            Breakout session
          </span>
        ) : (
          <span className="launch-eyebrow text-launch-muted">
            Structured activity (main room)
          </span>
        )}
        {b.enabled && (
          <span className="text-xs text-launch-secondary">
            Groups of {groupSize}
          </span>
        )}
        {duration ? (
          <span className="font-mono text-xs text-launch-muted">
            {b.enabled ? `Rooms: ${duration}` : `Allow ~${duration}`}
          </span>
        ) : null}
      </div>

      {b.enabled && (
        <div className="mt-4 rounded-lg border border-launch-neutral/30 bg-black/25 px-3 py-3 text-sm leading-relaxed text-launch-secondary">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-launch-gold">
            Suggested script (Teams)
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-launch-secondary/95">
            <li>
              I&apos;m going to open breakout rooms —{" "}
              <strong className="text-launch-primary">{groupSize}</strong> people
              per room.
            </li>
            <li>
              You&apos;ll have about{" "}
              <strong className="text-launch-primary">{duration || "the time shown"}</strong>{" "}
              in the room.
            </li>
            <li>
              One person shares first, then switch so everyone participates.
            </li>
            <li>When you&apos;re back, we&apos;ll debrief briefly as a group.</li>
          </ul>
        </div>
      )}

      {b.instructions && b.instructions.length > 0 && (
        <div className={b.enabled ? "mt-5 border-t border-launch-neutral/25 pt-5" : "mt-4"}>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-launch-muted">
            {b.enabled ? "In the room" : "Participant steps"}
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-launch-secondary md:text-base">
            {b.instructions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </div>
      )}

      {b.debrief && b.debrief.length > 0 && (
        <div className="mt-5 border-t border-launch-neutral/25 pt-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-launch-muted">
            {b.enabled ? "After breakout (debrief)" : "Follow-up"}
          </p>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-launch-secondary md:text-base">
            {b.debrief.map((q) => (
              <li key={q} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-launch-gold/80" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
