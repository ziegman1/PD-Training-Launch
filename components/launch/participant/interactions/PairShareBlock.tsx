"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { AudienceLaunchSlide } from "@/types/launch";
import { participantSlideKey } from "@/lib/participantSlideKey";
import { workbookFieldClassName } from "@/components/launch/participant/fieldStyles";

export function PairShareBlock({ slide }: { slide: AudienceLaunchSlide }) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const slideKey = participantSlideKey(slide);
  const value = participantAnswers[slideKey]?.pairShare ?? "";

  return (
    <label className="block text-left">
      <span className="text-base font-semibold text-launch-secondary">
        After you debrief
      </span>
      <textarea
        className={`${workbookFieldClassName} min-h-[9rem] resize-y`}
        placeholder="One thing you heard from your partner…"
        value={value}
        onChange={(e) =>
          setParticipantAnswer(slideKey, "pairShare", e.target.value)
        }
        rows={6}
      />
    </label>
  );
}
