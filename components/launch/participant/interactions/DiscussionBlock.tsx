"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { AudienceLaunchSlide } from "@/types/launch";
import { participantSlideKey } from "@/lib/participantSlideKey";
import { workbookFieldClassName } from "@/components/launch/participant/fieldStyles";

export function DiscussionBlock({ slide }: { slide: AudienceLaunchSlide }) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const slideKey = participantSlideKey(slide);
  const value = participantAnswers[slideKey]?.discussion ?? "";

  return (
    <label className="block text-left">
      <span className="text-base font-semibold text-launch-secondary">
        Your notes (optional)
      </span>
      <textarea
        className={`${workbookFieldClassName} min-h-[9rem] resize-y`}
        placeholder="Capture ideas from discussion…"
        value={value}
        onChange={(e) =>
          setParticipantAnswer(slideKey, "discussion", e.target.value)
        }
        rows={6}
      />
    </label>
  );
}
