"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { AudienceLaunchSlide } from "@/types/launch";
import { fieldClassName } from "@/components/launch/participant/fieldStyles";

export function ExerciseBlock({ slide }: { slide: AudienceLaunchSlide }) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const value = participantAnswers[slide.id]?.exercise ?? "";

  return (
    <label className="block text-left">
      <span className="launch-eyebrow text-launch-muted">Exercise</span>
      <textarea
        className={`${fieldClassName} min-h-[160px] resize-y`}
        placeholder="Your response…"
        value={value}
        onChange={(e) =>
          setParticipantAnswer(slide.id, "exercise", e.target.value)
        }
        rows={6}
      />
    </label>
  );
}
