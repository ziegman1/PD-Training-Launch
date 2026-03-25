"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { WorkbookFillInItem } from "@/types/launch";
import {
  countFillInBlanks,
  parseFillInPrompt,
} from "@/lib/fillInPrompt";
import { workbookInlineBlankClassName } from "@/components/launch/participant/fieldStyles";

function fieldKey(itemIndex: number, blankIndex: number) {
  return `fi${itemIndex}-b${blankIndex}`;
}

type Props = {
  sectionId: string;
  items: WorkbookFillInItem[];
  /** Short one-blank lines — less vertical gap between rows */
  compact?: boolean;
};

export function WorkbookFillInMultiple({
  sectionId,
  items,
  compact = false,
}: Props) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const row = participantAnswers[sectionId] ?? {};

  const gap = compact ? "space-y-5 md:space-y-6" : "space-y-12 md:space-y-14";
  const rowInner = compact ? "space-y-1 md:space-y-1.5" : "space-y-4 md:space-y-5";

  return (
    <div className={`${gap} text-left`}>
      {items.map((item, itemIndex) => {
        const segments = parseFillInPrompt(item.prompt);
        const hasBlanks = countFillInBlanks(item.prompt) > 0;

        return (
          <div key={`${sectionId}-fi-${itemIndex}`} className={rowInner}>
            {item.helperText ? (
              <p className="text-sm leading-relaxed text-launch-steel/95 md:text-base">
                {item.helperText}
              </p>
            ) : null}
            {!hasBlanks ? (
              <div className="space-y-2">
                <p className="text-lg leading-relaxed text-launch-primary md:text-xl">
                  {item.prompt}
                </p>
                <p className="text-sm text-launch-muted">
                  Add blanks with three or more underscores (e.g. ________) in session data.
                </p>
              </div>
            ) : (
              <p
                className="text-lg leading-[1.85] text-launch-primary md:text-xl md:leading-[1.9]"
                lang="en"
              >
                {segments.map((seg, i) => {
                  if (seg.kind === "text") {
                    return (
                      <span key={`t-${itemIndex}-${i}`} className="whitespace-pre-wrap">
                        {seg.text}
                      </span>
                    );
                  }
                  const hint = item.answers?.[seg.index];
                  const fid = fieldKey(itemIndex, seg.index);
                  const value = row[fid] ?? "";
                  return (
                    <input
                      key={`b-${itemIndex}-${seg.index}-${i}`}
                      type="text"
                      name={fid}
                      autoComplete="off"
                      aria-label={
                        hint
                          ? `Blank ${seg.index + 1}, hint: ${hint}`
                          : `Blank ${seg.index + 1}`
                      }
                      placeholder={hint ? `e.g. ${hint}` : "Type here…"}
                      className={`${workbookInlineBlankClassName} mx-1 align-middle`}
                      style={{
                        width: `${Math.min(
                          22,
                          Math.max(10, (hint?.length ?? 6) + 6, value.length + 4),
                        )}ch`,
                      }}
                      value={value}
                      onChange={(e) =>
                        setParticipantAnswer(sectionId, fid, e.target.value)
                      }
                    />
                  );
                })}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
