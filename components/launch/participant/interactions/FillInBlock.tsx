"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { AudienceLaunchSlide } from "@/types/launch";
import { participantSlideKey } from "@/lib/participantSlideKey";
import { countFillInBlanks, parseFillInPrompt } from "@/lib/fillInPrompt";
import {
  workbookFieldClassName,
  workbookInlineBlankClassName,
} from "@/components/launch/participant/fieldStyles";

const LEGACY_KEY_PREFIX = "fillIn-blank-";

function blankStorageKey(index: number) {
  return `${LEGACY_KEY_PREFIX}${index}`;
}

export function FillInBlock({ slide }: { slide: AudienceLaunchSlide }) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const slideKey = participantSlideKey(slide);
  const row = participantAnswers[slideKey] ?? {};
  const structured = slide.interactionData?.prompt?.trim();
  const legacyFields = slide.fillInFields?.length ? slide.fillInFields : null;

  if (structured) {
    const data = slide.interactionData!;
    const segments = parseFillInPrompt(data.prompt);

    if (countFillInBlanks(data.prompt) === 0) {
      return (
        <div className="space-y-4 text-left">
          <p className="text-lg leading-relaxed text-launch-primary md:text-xl">
            {data.prompt}
          </p>
          <p className="text-sm text-launch-muted">
            Add blanks to the prompt using three or more underscores (e.g. ________) in
            session data.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6 text-left">
        {data.helperText ? (
          <p className="text-sm leading-relaxed text-launch-steel/95 md:text-base">
            {data.helperText}
          </p>
        ) : null}
        <p
          className="text-lg leading-[1.85] text-launch-primary md:text-xl md:leading-[1.9]"
          lang="en"
        >
          {segments.map((seg, i) => {
            if (seg.kind === "text") {
              return (
                <span key={`t-${i}`} className="whitespace-pre-wrap">
                  {seg.text}
                </span>
              );
            }
            const hint = data.answers?.[seg.index];
            const value = row[blankStorageKey(seg.index)] ?? "";
            return (
              <input
                key={`b-${seg.index}-${i}`}
                type="text"
                name={blankStorageKey(seg.index)}
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
                  setParticipantAnswer(
                    slideKey,
                    blankStorageKey(seg.index),
                    e.target.value,
                  )
                }
              />
            );
          })}
        </p>
      </div>
    );
  }

  if (legacyFields) {
    return (
      <div className="space-y-8 text-left">
        {legacyFields.map((f) => (
          <label key={f.id} className="block">
            <span className="text-base font-semibold text-launch-secondary">{f.label}</span>
            <input
              type="text"
              className={workbookFieldClassName}
              placeholder={f.placeholder ?? "Type here…"}
              value={row[f.id] ?? ""}
              onChange={(e) => setParticipantAnswer(slideKey, f.id, e.target.value)}
            />
          </label>
        ))}
      </div>
    );
  }

  return (
    <p className="text-base text-launch-muted">
      Fill-in activity is not configured for this slide.
    </p>
  );
}
