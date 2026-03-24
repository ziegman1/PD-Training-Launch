"use client";

import type { AudienceLaunchSlide } from "@/types/launch";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import {
  getSlideInteraction,
  getSlideMomentType,
  resolveParticipantInteractionType,
} from "@/lib/slideContent";
import { getParticipantInteraction } from "@/components/launch/participant/interactionRegistry";

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
  const promptOnSlide = moment !== "standard";
  const reflectionOnSlide = moment === "reflection";
  const breakoutRooms =
    sessionSlide?.id === slide.id && sessionSlide.breakout?.enabled;

  return (
    <aside
      className={`flex min-h-screen flex-col gap-6 overflow-y-auto bg-launch-navy/25 p-5 md:gap-7 md:p-7 lg:max-h-dvh lg:min-h-screen lg:w-[min(22rem,38vw)] lg:shrink-0 ${className}`}
      aria-label="Workbook notes and activities"
    >
      <div>
        <p className="launch-eyebrow text-launch-steel/90">Your notes</p>
        {breakoutRooms && (
          <p className="mt-2 border-l-2 border-launch-steel/35 pl-3 text-xs leading-relaxed text-launch-steel/90">
            {slide.interactionType === "bibleStudy" ? (
              <>
                Your facilitator may place you in a Teams breakout. Select your
                assigned theme at the top, capture notes in the middle, and use
                Explore More only if you want extra passages afterward.
              </>
            ) : (
              <>
                Your facilitator may place you in a short Teams breakout for this
                activity. The main slide has your discussion or reflection prompt.
              </>
            )}
          </p>
        )}
        {slide.interactionType === "bibleStudy" && !breakoutRooms && (
          <p className="mt-2 border-l-2 border-launch-steel/35 pl-3 text-xs leading-relaxed text-launch-steel/90">
            Your assignment and the optional study library are in the blocks
            below—start with Your Study Assignment, then your notes.
          </p>
        )}
        {reflectionOnSlide && (
          <p className="mt-3 text-sm leading-relaxed text-launch-muted">
            Write your reflection on the main slide. Use the space below only if you
            want extra notes.
          </p>
        )}
        {promptOnSlide && !reflectionOnSlide && !breakoutRooms && (
          <p className="mt-3 text-sm leading-relaxed text-launch-muted">
            The prompt is on the slide. Add optional notes underneath.
          </p>
        )}
        {!promptOnSlide && interaction && (
          <p className="mt-3 text-lg font-medium leading-relaxed text-launch-secondary md:text-xl">
            {interaction}
          </p>
        )}
      </div>

      <Block slide={slide} />
    </aside>
  );
}
