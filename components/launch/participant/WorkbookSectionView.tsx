"use client";

import type { AudienceLaunchSlide, WorkbookSectionDefinition } from "@/types/launch";
import { BibleStudyBlock } from "@/components/launch/participant/interactions/BibleStudyBlock";
import { WorkbookFillInMultiple } from "@/components/launch/participant/WorkbookFillInMultiple";
import { WorkbookMultiReflection } from "@/components/launch/participant/WorkbookMultiReflection";

function IntroBox({ text }: { text: string }) {
  return (
    <section
      className="rounded-xl border border-launch-steel/20 bg-launch-navy/30 px-4 py-4 md:px-5 md:py-5"
      aria-label="Section context"
    >
      <p className="text-sm leading-relaxed text-launch-steel/95 md:text-base">{text}</p>
    </section>
  );
}

type Props = {
  section: WorkbookSectionDefinition;
  bibleStudySlide: AudienceLaunchSlide | undefined;
};

export function WorkbookSectionView({ section, bibleStudySlide }: Props) {
  const intro = section.intro?.trim();

  switch (section.kind) {
    case "reflection":
      return (
        <div className="flex w-full flex-col gap-10 md:gap-12">
          {intro ? <IntroBox text={intro} /> : null}
          <section aria-label="Your work" className="space-y-2">
            <p className="launch-eyebrow text-launch-gold/90">Your workbook</p>
            <WorkbookMultiReflection
              sectionId={section.id}
              prompts={section.reflectionPrompts ?? []}
            />
          </section>
        </div>
      );

    case "fillIn": {
      const followUp = section.reflectionPrompts?.length
        ? section.reflectionPrompts
        : [];
      return (
        <div className="flex w-full flex-col gap-10 md:gap-12">
          {intro ? <IntroBox text={intro} /> : null}
          <section aria-label="Your work" className="space-y-2">
            <p className="launch-eyebrow text-launch-gold/90">Your workbook</p>
            <WorkbookFillInMultiple
              sectionId={section.id}
              items={section.fillInItems ?? []}
              compact={section.fillInCompact === true}
            />
          </section>
          {followUp.length > 0 ? (
            <section
              aria-label="Reflection"
              className="space-y-2 border-t border-launch-steel/15 pt-10 md:pt-12"
            >
              <p className="launch-eyebrow text-launch-muted/90">Reflection</p>
              <WorkbookMultiReflection sectionId={section.id} prompts={followUp} />
            </section>
          ) : null}
        </div>
      );
    }

    case "bibleStudy": {
      if (!bibleStudySlide) {
        return (
          <p className="rounded-xl border border-launch-neutral/40 bg-black/20 px-4 py-3 text-sm text-launch-muted">
            Bible study content could not be loaded (missing source slide). Tell your facilitator
            if this persists.
          </p>
        );
      }
      return (
        <div className="flex w-full flex-col gap-10 md:gap-12">
          {intro ? <IntroBox text={intro} /> : null}
          <section aria-label="Your work" className="space-y-2">
            <p className="launch-eyebrow text-launch-gold/90">Your workbook</p>
            <BibleStudyBlock slide={bibleStudySlide} />
          </section>
        </div>
      );
    }

    default:
      return null;
  }
}
