"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { AudienceLaunchSlide } from "@/types/launch";
import { fieldClassName } from "@/components/launch/participant/fieldStyles";

export function ReflectionBlock({ slide }: { slide: AudienceLaunchSlide }) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const value = participantAnswers[slide.id]?.reflection ?? "";

  return (
    <label className="block text-left">
      <span className="launch-eyebrow text-launch-muted">Reflection</span>
      <textarea
        className={`${fieldClassName} min-h-[140px] resize-y`}
        placeholder="Type here…"
        value={value}
        onChange={(e) =>
          setParticipantAnswer(slide.id, "reflection", e.target.value)
        }
        rows={5}
      />
    </label>
  );
}
