"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { AudienceLaunchSlide } from "@/types/launch";
import { fieldClassName } from "@/components/launch/participant/fieldStyles";

export function PairShareBlock({ slide }: { slide: AudienceLaunchSlide }) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const value = participantAnswers[slide.id]?.pairShare ?? "";

  return (
    <label className="block text-left">
      <span className="launch-eyebrow text-launch-muted">After you debrief</span>
      <textarea
        className={`${fieldClassName} min-h-[100px] resize-y`}
        placeholder="One thing you heard from your partner…"
        value={value}
        onChange={(e) =>
          setParticipantAnswer(slide.id, "pairShare", e.target.value)
        }
        rows={4}
      />
    </label>
  );
}
