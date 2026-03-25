"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { AudienceLaunchSlide } from "@/types/launch";
import { participantSlideKey } from "@/lib/participantSlideKey";
import { workbookFieldClassName } from "@/components/launch/participant/fieldStyles";

export function ExerciseBlock({ slide }: { slide: AudienceLaunchSlide }) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const slideKey = participantSlideKey(slide);
  const value = participantAnswers[slideKey]?.exercise ?? "";

  return (
    <label className="block text-left">
      <span className="text-base font-semibold text-launch-secondary">Exercise</span>
      <textarea
        className={`${workbookFieldClassName} min-h-[11rem] resize-y`}
        placeholder="Your response…"
        value={value}
        onChange={(e) =>
          setParticipantAnswer(slideKey, "exercise", e.target.value)
        }
        rows={8}
      />
    </label>
  );
}
