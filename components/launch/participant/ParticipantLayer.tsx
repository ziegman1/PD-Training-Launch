"use client";

import type { AudienceLaunchSlide } from "@/types/launch";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import {
  getSlideInteraction,
  getSlideInteractionLines,
  getSlideMomentType,
  getSlidePromptLines,
  momentParticipantPromptVisible,
  promptsFullyRevealed,
  resolveParticipantInteractionType,
} from "@/lib/slideContent";
import { getParticipantInteraction } from "@/components/launch/participant/interactionRegistry";
import { WorkbookContextHeader } from "@/components/launch/participant/WorkbookContextHeader";

type ParticipantLayerProps = {
  slide: AudienceLaunchSlide;
  className?: string;
};

export function ParticipantLayer({ slide, className = "" }: ParticipantLayerProps) {
  const { slide: sessionSlide } = useLaunchSession();
  const moment = getSlideMomentType(slide);
  const resolvedType = resolveParticipantInteractionType(slide);
  const Block = getParticipantInteraction(resolvedType);
  const interaction = getSlideInteraction(slide);
  const slidePrompts = getSlidePromptLines(slide).slice(0, 8);
  const rawIxLines = getSlideInteractionLines(slide).slice(0, 8);
  const interactionLines =
    rawIxLines.length > 0 ? rawIxLines : interaction ? [interaction] : [];
  const interactionRevealLimit =
    interactionLines.length > 0
      ? typeof slide.interactionRevealVisibleCount === "number"
        ? Math.min(
            interactionLines.length,
            Math.max(0, Math.floor(slide.interactionRevealVisibleCount)),
          )
        : interactionLines.length
      : 0;
  const promptRevealLimit =
    slidePrompts.length > 0
      ? typeof slide.promptRevealVisibleCount === "number"
        ? Math.min(
            slidePrompts.length,
            Math.max(0, Math.floor(slide.promptRevealVisibleCount)),
          )
        : slidePrompts.length
      : 0;
  const promptOnSlide = moment !== "standard";
  const reflectionOnSlide = moment === "reflection";
  const breakoutRooms =
    sessionSlide?.id === slide.id && sessionSlide.breakout?.enabled;

  return (
    <div
      className={`flex w-full flex-col gap-10 md:gap-12 ${className}`.trim()}
      aria-label="Workbook"
    >
      <WorkbookContextHeader slide={slide} />

      {(breakoutRooms ||
        (slide.interactionType === "bibleStudy" && !breakoutRooms) ||
        reflectionOnSlide ||
        (promptOnSlide && !reflectionOnSlide && !breakoutRooms) ||
        (!promptOnSlide && interaction) ||
        slidePrompts.length > 0) && (
        <section
          className="rounded-xl border border-launch-steel/20 bg-launch-navy/30 px-4 py-4 md:px-5 md:py-5"
          aria-label="Facilitator context"
        >
          {breakoutRooms && (
            <p className="text-sm leading-relaxed text-launch-steel/95 md:text-base">
              {slide.interactionType === "bibleStudy" ? (
                <>
                  Your facilitator may place you in a Teams breakout. Select your
                  assigned theme below, write your notes in the middle section, and open
                  Explore More only if you want extra passages afterward.
                </>
              ) : (
                <>
                  Your facilitator may open a short breakout for this activity. Use
                  this page for your notes—the live prompt matches what you see in the
                  meeting.
                </>
              )}
            </p>
          )}
          {slide.interactionType === "bibleStudy" && !breakoutRooms && (
            <p className="text-sm leading-relaxed text-launch-steel/95 md:text-base">
              Start with <span className="text-launch-soft/95">Your Study Assignment</span>,
              then capture your notes. Explore More is optional.
            </p>
          )}
          {reflectionOnSlide && (
            <p className="text-sm leading-relaxed text-launch-steel/95 md:text-base">
              Use the writing area below for your reflection. Take the time you need;
              your answers stay on this device.
            </p>
          )}
          {promptOnSlide && !reflectionOnSlide && !breakoutRooms && (
            <p className="text-sm leading-relaxed text-launch-steel/95 md:text-base">
              The activity prompt matches what your facilitator is showing. Add your
              responses in the fields below.
            </p>
          )}
          {slidePrompts.length > 0 && (
            <div className={interaction || promptOnSlide ? "mt-5 border-t border-launch-steel/25 pt-5" : ""}>
              <p className="launch-eyebrow text-launch-muted">
                For the room (mirrors the slide)
              </p>
              <ul className="mt-3 space-y-3 text-base leading-relaxed text-launch-secondary md:text-lg">
                {slidePrompts.map((line, i) => {
                  const revealed = i < promptRevealLimit;
                  return (
                    <li
                      key={`${i}-${line.slice(0, 48)}`}
                      className={`flex gap-3 ${
                        revealed ? "" : "pointer-events-none opacity-0"
                      }`.trim()}
                      aria-hidden={!revealed}
                    >
                      <span
                        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-launch-gold/45 text-xs font-semibold text-launch-gold"
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <span>{line}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {!promptOnSlide && interaction && (
            <div
              className={[
                slidePrompts.length > 0
                  ? "mt-5 border-t border-launch-steel/25 pt-5"
                  : "",
                !momentParticipantPromptVisible(slide)
                  ? "pointer-events-none opacity-0"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden={
                !momentParticipantPromptVisible(slide) ? true : undefined
              }
            >
              <p className="launch-eyebrow text-launch-muted">On this slide</p>
              <ul className="mt-3 space-y-3 text-lg font-medium leading-relaxed text-launch-secondary md:text-xl">
                {interactionLines.map((line, i) => {
                  const revealed = i < interactionRevealLimit;
                  return (
                    <li
                      key={`${i}-${line.slice(0, 48)}`}
                      className={`flex gap-3 ${
                        revealed ? "" : "pointer-events-none opacity-0"
                      }`.trim()}
                      aria-hidden={!revealed}
                    >
                      <span
                        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-launch-gold/45 text-xs font-semibold text-launch-gold"
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <span>{line}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}

      <section aria-label="Your work" className="space-y-2">
        <p className="launch-eyebrow text-launch-gold/90">Your workbook</p>
        <Block slide={slide} />
      </section>
    </div>
  );
}
