"use client";

import { useEffect } from "react";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import { BaseLayout } from "@/components/launch/layout/BaseLayout";
import { DeckNavigation } from "@/components/launch/navigation/DeckNavigation";
import { ParticipantChrome } from "@/components/launch/participant/ParticipantChrome";
import { ParticipantLayer } from "@/components/launch/participant/ParticipantLayer";
import { Slide } from "@/components/launch/slide/Slide";

/**
 * `/workbook/...` — lightweight companion; deck index syncs with the presenter when enabled.
 */
export function WorkbookView() {
  const { slide, audienceSlide, session, goNext, goPrev } = useLaunchSession();

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
      <div className="flex min-h-dvh flex-col lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-launch-soft/10 lg:border-b-0 lg:border-r">
          <ParticipantChrome
            programLine={programLine}
            sessionTitle={session.title}
          />
          <Slide slide={audienceSlide} containerClassName="flex-1" />
          <DeckNavigation />
        </div>
        <ParticipantLayer slide={audienceSlide} />
      </div>
    </BaseLayout>
  );
}
