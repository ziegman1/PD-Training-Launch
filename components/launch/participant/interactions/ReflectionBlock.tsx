"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { AudienceLaunchSlide } from "@/types/launch";
import { participantSlideKey } from "@/lib/participantSlideKey";
import { workbookFieldClassName } from "@/components/launch/participant/fieldStyles";

export function ReflectionBlock({ slide }: { slide: AudienceLaunchSlide }) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const slideKey = participantSlideKey(slide);
  const value = participantAnswers[slideKey]?.reflection ?? "";

  return (
    <label className="block text-left">
      <span className="text-base font-semibold text-launch-secondary">Reflection</span>
      <textarea
        className={`${workbookFieldClassName} min-h-[12rem] resize-y`}
        placeholder="Write freely—this stays on your device…"
        value={value}
        onChange={(e) =>
          setParticipantAnswer(slideKey, "reflection", e.target.value)
        }
        rows={8}
      />
    </label>
  );
}
