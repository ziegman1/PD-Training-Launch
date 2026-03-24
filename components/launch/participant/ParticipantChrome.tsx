"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";

type ParticipantChromeProps = {
  programLine: string;
  sessionTitle: string;
};

/**
 * Minimal header for `/workbook/...` — companion to the live presentation (separate URL).
 */
export function ParticipantChrome({
  programLine,
  sessionTitle,
}: ParticipantChromeProps) {
  const { slideIndex, totalSlides } = useLaunchSession();
  const progress = ((slideIndex + 1) / totalSlides) * 100;

  return (
    <header
      data-launch-surface="workbook"
      className="shrink-0 border-b border-launch-soft/10 px-5 py-5 md:px-8 md:py-6"
    >
      <p className="launch-eyebrow text-launch-muted">Companion workbook</p>
      <p className="launch-eyebrow mt-3 text-launch-gold">{programLine}</p>
      <h1 className="mt-2 text-base font-medium leading-snug text-launch-secondary md:text-lg">
        {sessionTitle}
      </h1>
      <p className="mt-3 max-w-xl text-xs leading-relaxed text-launch-muted md:text-sm">
        For your notes while you follow the session — the live slides are shared separately.
      </p>
      <div
        className="mt-5 h-1 w-full max-w-md overflow-hidden rounded-full bg-launch-neutral/50"
        role="progressbar"
        aria-valuenow={slideIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalSlides}
        aria-label={`Slide ${slideIndex + 1} of ${totalSlides}`}
      >
        <div
          className="h-full bg-launch-gold transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
