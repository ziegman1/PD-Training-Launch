"use client";

import { useEffect } from "react";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import { BaseLayout } from "@/components/launch/layout/BaseLayout";
import { DeckNavigation } from "@/components/launch/navigation/DeckNavigation";
import { SlideContent } from "@/components/launch/slide/SlideContent";
import { TrainerNotesContent } from "@/components/launch/trainer/TrainerNotesContent";

type TrainerConsoleViewProps = {
  presentPath: string;
};

/**
 * Private facilitator console — never share this window in Teams.
 * Import only via `SessionTrainer` → `/trainer/[sessionId]` (never from `/present`).
 */
export function TrainerConsoleView({ presentPath }: TrainerConsoleViewProps) {
  const { slide, audienceSlide, session, slideIndex, totalSlides, goNext, goPrev } =
    useLaunchSession();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  if (!slide) {
    return (
      <BaseLayout className="flex items-center justify-center">
        <p className="text-launch-muted">No slides.</p>
      </BaseLayout>
    );
  }

  if (!audienceSlide) {
    return (
      <BaseLayout className="flex items-center justify-center">
        <p className="text-launch-muted">No slides.</p>
      </BaseLayout>
    );
  }

  const previewSlide = audienceSlide;

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const presentUrl = `${origin}${presentPath}`;

  return (
    <BaseLayout className="min-h-dvh">
      <header
        data-launch-mode="trainer"
        className="border-b border-launch-soft/15 bg-black/25 px-4 py-3 md:px-6"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="min-w-0">
            <p className="launch-eyebrow text-launch-gold">Trainer console</p>
            <p className="mt-1 text-sm text-launch-muted">
              Private · do not share this window. Share only the presentation link.
            </p>
          </div>
          <div className="flex w-full min-w-0 flex-col gap-3 md:max-w-md md:flex-none">
            <div
              className="h-1 w-full overflow-hidden rounded-full bg-launch-neutral/60"
              role="progressbar"
              aria-valuenow={slideIndex + 1}
              aria-valuemin={1}
              aria-valuemax={totalSlides}
            >
              <div
                className="h-full bg-launch-gold transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  width: `${((slideIndex + 1) / totalSlides) * 100}%`,
                }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="font-mono text-xs text-launch-muted">
                Slide {slideIndex + 1} / {totalSlides}
              </span>
              <a
                href={presentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-launch-steel/40 px-3 py-1.5 text-xs font-semibold text-launch-steel transition-colors hover:border-launch-steel hover:text-launch-primary"
              >
                Open presentation (share this)
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8 lg:px-6 lg:py-8">
        <main className="min-w-0 space-y-6" aria-label="Trainer notes and deck control">
          <TrainerNotesContent slide={slide} />
          <DeckNavigation />
        </main>

        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <p className="launch-eyebrow text-launch-muted">Audience preview</p>
          <p className="mt-2 text-xs text-launch-muted">
            Static preview — motion may differ on the live tab.
          </p>
          <div className="mt-4 overflow-hidden rounded-lg border border-launch-neutral/40 bg-launch-navy/60">
            <div className="max-h-[min(42vh,360px)] overflow-y-auto p-3">
              <div className="origin-top scale-[0.42] transform text-left">
                <div className="w-[238%] min-w-[20rem]">
                  <SlideContent slide={previewSlide} />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[0.65rem] leading-snug text-launch-muted">
            {session.title}
          </p>
        </aside>
      </div>
    </BaseLayout>
  );
}
