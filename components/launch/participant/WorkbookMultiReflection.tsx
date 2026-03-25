"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { WorkbookReflectionPrompt } from "@/types/launch";
import { workbookFieldClassName } from "@/components/launch/participant/fieldStyles";

type Props = {
  sectionId: string;
  prompts: WorkbookReflectionPrompt[];
};

export function WorkbookMultiReflection({ sectionId, prompts }: Props) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const row = participantAnswers[sectionId] ?? {};

  if (prompts.length === 0) {
    return (
      <p className="text-base text-launch-muted">No reflection prompts configured.</p>
    );
  }

  return (
    <div className="space-y-10 text-left md:space-y-11">
      {prompts.map((p) => {
        const rows = p.rows ?? 5;
        const minH = `${Math.max(8, rows * 1.35)}rem`;
        return (
          <label key={p.fieldId} className="block">
            <span className="text-base font-semibold text-launch-secondary md:text-lg">
              {p.label}
            </span>
            <textarea
              className={`${workbookFieldClassName} resize-y`}
              style={{ minHeight: minH }}
              placeholder={p.placeholder ?? "Write freely—this stays on your device…"}
              rows={rows}
              value={row[p.fieldId] ?? ""}
              onChange={(e) =>
                setParticipantAnswer(sectionId, p.fieldId, e.target.value)
              }
            />
          </label>
        );
      })}
    </div>
  );
}
