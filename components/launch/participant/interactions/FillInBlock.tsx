"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { AudienceLaunchSlide } from "@/types/launch";
import { fieldClassName } from "@/components/launch/participant/fieldStyles";

export function FillInBlock({ slide }: { slide: AudienceLaunchSlide }) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const answers = participantAnswers[slide.id] ?? {};

  if (!slide.fillInFields?.length) {
    return (
      <p className="text-sm text-launch-muted">
        Fill-in fields are not defined for this slide.
      </p>
    );
  }

  return (
    <div className="space-y-5 text-left">
      {slide.fillInFields.map((f) => (
        <label key={f.id} className="block">
          <span className="text-sm font-medium text-launch-secondary">{f.label}</span>
          <input
            type="text"
            className={fieldClassName}
            placeholder={f.placeholder ?? "…"}
            value={answers[f.id] ?? ""}
            onChange={(e) =>
              setParticipantAnswer(slide.id, f.id, e.target.value)
            }
          />
        </label>
      ))}
    </div>
  );
}
