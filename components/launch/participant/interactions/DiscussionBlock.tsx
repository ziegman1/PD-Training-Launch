"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { AudienceLaunchSlide } from "@/types/launch";
import { fieldClassName } from "@/components/launch/participant/fieldStyles";

export function DiscussionBlock({ slide }: { slide: AudienceLaunchSlide }) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const value = participantAnswers[slide.id]?.discussion ?? "";

  return (
    <label className="block text-left">
      <span className="launch-eyebrow text-launch-muted">Notes (optional)</span>
      <textarea
        className={`${fieldClassName} min-h-[100px] resize-y`}
        placeholder="Capture ideas from discussion…"
        value={value}
        onChange={(e) =>
          setParticipantAnswer(slide.id, "discussion", e.target.value)
        }
        rows={4}
      />
    </label>
  );
}
