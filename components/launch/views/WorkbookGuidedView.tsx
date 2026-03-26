"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AudienceLaunchSlide, LaunchSession, WorkbookSectionDefinition } from "@/types/launch";
import { toAudienceSlide } from "@/lib/audienceSlide";
import { BaseLayout } from "@/components/launch/layout/BaseLayout";
import { ParticipantChrome } from "@/components/launch/participant/ParticipantChrome";
import { WorkbookSectionHeader } from "@/components/launch/participant/WorkbookSectionHeader";
import { WorkbookSectionView } from "@/components/launch/participant/WorkbookSectionView";
import { WorkbookSectionNavigation } from "@/components/launch/navigation/WorkbookSectionNavigation";

type Props = {
  session: LaunchSession;
  sections: WorkbookSectionDefinition[];
};

export function WorkbookGuidedView({ session, sections }: Props) {
  const [sectionIndex, setSectionIndex] = useState(0);
  const total = sections.length;
  const section = sections[sectionIndex];

  const goNext = useCallback(() => {
    setSectionIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setSectionIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")
        return;
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

  const bibleStudySlide: AudienceLaunchSlide | undefined = useMemo(() => {
    if (section.kind !== "bibleStudy" || !section.sourceSlideId) return undefined;
    const id = section.sourceSlideId;
    const full =
      session.slides.find((s) => s.id === id) ??
      session.slides.find((s) => s.continuationGroup === id) ??
      session.slides.find((s) => s.continuationGroup === `${id}__ix`);
    return full ? toAudienceSlide(full) : undefined;
  }, [session.slides, section.kind, section.sourceSlideId]);

  const programLine = `${session.programName}${
    session.subtitle ? ` · ${session.subtitle}` : ""
  }`;

  return (
    <BaseLayout className="relative">
      <div className="flex min-h-dvh flex-col">
        <ParticipantChrome programLine={programLine} sessionTitle={session.title} />
        <main
          id="workbook-main"
          className="relative z-0 mx-auto w-full max-w-[min(42rem,100%)] flex-1 px-5 py-8 pb-28 sm:px-8 sm:py-10 sm:pb-32 md:max-w-[44rem] md:px-10 md:py-12 md:pb-36"
        >
          <div className="flex w-full flex-col gap-10 md:gap-12">
            <WorkbookSectionHeader
              section={section}
              sectionIndex={sectionIndex}
              sectionTotal={total}
            />
            <WorkbookSectionView section={section} bibleStudySlide={bibleStudySlide} />
          </div>
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-launch-soft/15 bg-launch-navy/95 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[min(42rem,100%)] justify-center px-4 py-3 md:max-w-[44rem] md:px-6">
            <WorkbookSectionNavigation
              sectionIndex={sectionIndex}
              sectionTotal={total}
              onPrev={goPrev}
              onNext={goNext}
            />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
