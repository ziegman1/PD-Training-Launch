"use client";

import { useEffect } from "react";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import { BaseLayout } from "@/components/launch/layout/BaseLayout";
import { DeckNavigation } from "@/components/launch/navigation/DeckNavigation";
import { ParticipantChrome } from "@/components/launch/participant/ParticipantChrome";
import { ParticipantLayer } from "@/components/launch/participant/ParticipantLayer";
import { WorkbookGuidedView } from "@/components/launch/views/WorkbookGuidedView";

/**
 * `/workbook/...` — single-column, scrollable participant workbook (slides live in the meeting).
 * Sessions with `workbook.sections` use guided steps only; others mirror the deck slide-by-slide.
 */
export function WorkbookView() {
  const { slide, audienceSlide, session, goNext, goPrev } = useLaunchSession();
  const guidedSections = session.workbook?.sections;
  const isGuided = Boolean(guidedSections?.length);

  useEffect(() => {
    if (isGuided) return;
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
  }, [goNext, goPrev, isGuided]);

  if (guidedSections?.length) {
    return <WorkbookGuidedView session={session} sections={guidedSections} />;
  }

  if (!slide || !audienceSlide) {
    return (
      <BaseLayout className="flex items-center justify-center">
        <p className="text-launch-muted">No slides.</p>
      </BaseLayout>
    );
  }

  const programLine = `${session.programName}${
    session.subtitle ? ` · ${session.subtitle}` : ""
  }`;

  return (
    <BaseLayout className="relative">
      <div className="flex min-h-dvh flex-col">
        <ParticipantChrome
          programLine={programLine}
          sessionTitle={session.title}
        />
        <main
          id="workbook-main"
          className="relative z-0 mx-auto w-full max-w-[min(42rem,100%)] flex-1 px-5 py-8 pb-28 sm:px-8 sm:py-10 sm:pb-32 md:max-w-[44rem] md:px-10 md:py-12 md:pb-36"
        >
          <ParticipantLayer slide={audienceSlide} />
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-launch-soft/15 bg-launch-navy/95 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[min(42rem,100%)] justify-center px-4 py-3 md:max-w-[44rem] md:px-6">
            <DeckNavigation />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
