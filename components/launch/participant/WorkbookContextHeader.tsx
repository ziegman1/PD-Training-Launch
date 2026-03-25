import type { AudienceLaunchSlide } from "@/types/launch";

/**
 * Session / slide context at top of workbook — participant-first reading order.
 */
export function WorkbookContextHeader({ slide }: { slide: AudienceLaunchSlide }) {
  return (
    <header className="border-b border-launch-steel/15 pb-8 md:pb-10">
      {slide.section ? (
        <p className="launch-eyebrow text-launch-gold/90">{slide.section}</p>
      ) : (
        <p className="launch-eyebrow text-launch-muted/90">Session</p>
      )}
      <h1 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-launch-primary md:text-3xl">
        {slide.title}
      </h1>
      {slide.emphasis?.trim() ? (
        <p className="mt-5 border-l-2 border-launch-gold/50 pl-4 text-base font-medium leading-relaxed text-launch-secondary md:text-lg">
          {slide.emphasis}
        </p>
      ) : null}
    </header>
  );
}
