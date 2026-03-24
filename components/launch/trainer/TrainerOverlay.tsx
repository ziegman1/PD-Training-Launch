"use client";

import type { LaunchSlide } from "@/types/launch";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import { ModeToggle } from "@/components/launch/ModeToggle";
import { DeckNavigation } from "@/components/launch/navigation/DeckNavigation";
import { TrainerNotesContent } from "@/components/launch/trainer/TrainerNotesContent";

/**
 * @deprecated Trainer notes on the same window as slides — do not use for live
 * training. `LaunchShell` no longer mounts this; use `/trainer/[sessionId]`
 * in a separate browser window.
 */

type TrainerOverlayProps = {
  slide: LaunchSlide;
  slideIndex: number;
  totalSlides: number;
  sessionTitle: string;
  programLine: string;
};

export function TrainerOverlay({
  slide,
  slideIndex,
  totalSlides,
  sessionTitle,
  programLine,
}: TrainerOverlayProps) {
  const { mode, presentationLock } = useLaunchSession();
  if (mode === "presentation" || presentationLock) {
    return null;
  }

  const progress = ((slideIndex + 1) / totalSlides) * 100;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex justify-end">
      <div
        className="pointer-events-none min-w-0 flex-1 bg-gradient-to-r from-transparent via-black/25 to-black/50"
        aria-hidden
      />

      <aside
        className="pointer-events-auto flex h-full w-full max-w-md flex-col border-l border-launch-soft/15 bg-[color-mix(in_srgb,var(--launch-navy)_92%,black)] backdrop-blur-xl"
        aria-label="Trainer notes"
      >
        <header className="shrink-0 space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="launch-eyebrow text-launch-gold">{programLine}</p>
              <p className="mt-2 text-launch-body text-launch-muted">
                {sessionTitle}
              </p>
            </div>
            <ModeToggle />
          </div>
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-launch-neutral/60"
            role="progressbar"
            aria-valuenow={slideIndex + 1}
            aria-valuemin={1}
            aria-valuemax={totalSlides}
          >
            <div
              className="h-full bg-launch-gold transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2 md:px-6">
          <TrainerNotesContent slide={slide} />
        </div>

        <div className="shrink-0 bg-launch-navy/90 px-2 py-1">
          <DeckNavigation />
        </div>
      </aside>
    </div>
  );
}
