"use client";

import { useCallback, useMemo } from "react";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import type { AudienceLaunchSlide, BibleStudyGroup } from "@/types/launch";
import { participantSlideKey } from "@/lib/participantSlideKey";
import { workbookFieldClassName } from "@/components/launch/participant/fieldStyles";
import {
  BIBLICAL_FOUNDATIONS_LIBRARY,
  type BibleStudyLibraryCategory,
} from "@/lib/biblicalFoundationsLibrary";

const ROW_COUNT_KEY = "bible-study-row-count";
const SELECTED_GROUP_KEY = "bible-study-selected-group";
const MAX_ROWS = 8;

const noteLabels: {
  suffix: string;
  label: string;
  placeholder: string;
  rows: number;
}[] = [
  {
    suffix: "principles",
    label: "3–5 key principles",
    placeholder: "List 3–5 principles you see in the text…",
    rows: 5,
  },
  {
    suffix: "god",
    label: "What this reveals about God",
    placeholder: "…",
    rows: 4,
  },
  {
    suffix: "assumptions",
    label: "Assumptions corrected",
    placeholder: "What ideas does this passage challenge?",
    rows: 4,
  },
  {
    suffix: "takeaway",
    label: "Takeaway",
    placeholder: "One thing to share with the larger group…",
    rows: 3,
  },
];

function fieldId(row: number, suffix: string) {
  return `bs-${row}-${suffix}`;
}

function PassageBulletList({ passages }: { passages: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5 text-sm leading-snug text-launch-secondary md:text-base">
      {passages.map((p) => (
        <li key={p} className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-launch-gold/80" aria-hidden />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

function AssignmentSection({
  groups,
  selectedGroupId,
  selectedGroup,
  onSelectGroup,
}: {
  groups: BibleStudyGroup[];
  selectedGroupId: string;
  selectedGroup: BibleStudyGroup | undefined;
  onSelectGroup: (id: string) => void;
}) {
  return (
    <section
      className="space-y-5 rounded-2xl border-2 border-launch-gold/40 bg-launch-navy/40 p-5 shadow-lg shadow-black/15 md:p-7"
      aria-labelledby="bible-study-assignment-heading"
    >
      <h3
        id="bible-study-assignment-heading"
        className="launch-eyebrow text-launch-gold"
      >
        Your Study Assignment
      </h3>

      <label className="block">
        <span className="text-base font-semibold text-launch-secondary">
          Assigned topic
        </span>
        <select
          className={`${workbookFieldClassName} cursor-pointer`}
          value={selectedGroupId}
          onChange={(e) => onSelectGroup(e.target.value)}
        >
          <option value="">Select the theme your facilitator assigned…</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.topic}
            </option>
          ))}
        </select>
      </label>

      {selectedGroup ? (
        <div className="rounded-lg border border-launch-gold/25 bg-launch-gold/[0.06] px-4 py-3 md:px-5 md:py-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-launch-gold">
            Assigned passages
          </p>
          <p className="mt-2 text-sm font-semibold text-launch-primary md:text-base">
            {selectedGroup.topic}
          </p>
          <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-launch-muted">
            Read
          </p>
          <PassageBulletList passages={selectedGroup.passages} />
        </div>
      ) : (
        <p className="text-xs leading-relaxed text-launch-muted">
          Choose your group&apos;s theme to load the passage list for your breakout. The full
          study library is below if you want to browse other categories later.
        </p>
      )}

      <p className="text-sm leading-relaxed text-launch-muted">
        Read the passages above, then capture your insights below.
      </p>
    </section>
  );
}

function LibraryAccordion({ categories }: { categories: BibleStudyLibraryCategory[] }) {
  return (
    <div className="rounded-xl border border-launch-neutral/30 bg-black/20">
      <div className="px-3 py-2 md:px-4 md:py-3">
        {categories.map((cat) => (
          <details
            key={cat.id}
            className="group border-b border-launch-neutral/20 last:border-b-0"
          >
            <summary className="flex cursor-pointer list-none items-start gap-2 py-3 pr-1 text-left marker:content-none [&::-webkit-details-marker]:hidden">
              <span
                className="mt-0.5 shrink-0 text-launch-gold transition-transform duration-200 group-open:rotate-90"
                aria-hidden
              >
                ▶
              </span>
              <span className="text-sm font-semibold leading-snug text-launch-primary">
                {cat.title}
              </span>
            </summary>
            <div className="pb-4 pl-7">
              <PassageBulletList passages={cat.passages} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export function BibleStudyBlock({ slide }: { slide: AudienceLaunchSlide }) {
  const { participantAnswers, setParticipantAnswer } = useLaunchSession();
  const slideKey = participantSlideKey(slide);
  const answers = participantAnswers[slideKey] ?? {};
  const groups = slide.bibleStudyGroups;

  const parsed = Number.parseInt(answers[ROW_COUNT_KEY] ?? "1", 10);
  const rowCount = Number.isFinite(parsed)
    ? Math.min(MAX_ROWS, Math.max(1, parsed))
    : 1;

  const selectedGroupId = answers[SELECTED_GROUP_KEY] ?? "";
  const selectedGroup = useMemo(
    () => groups?.find((g) => g.id === selectedGroupId),
    [groups, selectedGroupId],
  );

  const setRowCount = useCallback(
    (n: number) => {
      const next = Math.min(MAX_ROWS, Math.max(1, n));
      setParticipantAnswer(slideKey, ROW_COUNT_KEY, String(next));
    },
    [setParticipantAnswer, slideKey],
  );

  const onSelectGroup = useCallback(
    (id: string) => {
      setParticipantAnswer(slideKey, SELECTED_GROUP_KEY, id);
      const g = groups?.find((x) => x.id === id);
      if (g) {
        setParticipantAnswer(slideKey, fieldId(0, "topic"), g.topic);
      }
    },
    [groups, setParticipantAnswer, slideKey],
  );

  return (
    <div className="space-y-10 text-left md:space-y-12">
      {groups && groups.length > 0 ? (
        <AssignmentSection
          groups={groups}
          selectedGroupId={selectedGroupId}
          selectedGroup={selectedGroup}
          onSelectGroup={onSelectGroup}
        />
      ) : (
        <p className="rounded-xl border border-launch-neutral/40 bg-black/20 px-4 py-3 text-sm text-launch-muted">
          Passage assignments aren&apos;t loaded for this slide. Ask your facilitator for your
          room&apos;s references, then use the notes below. You can still use the optional study
          library for related passages.
        </p>
      )}

      <section className="space-y-6" aria-labelledby="bible-study-notes-heading">
        <div>
          <h3
            id="bible-study-notes-heading"
            className="text-lg font-bold tracking-tight text-launch-primary md:text-xl"
          >
            Your study notes
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-launch-muted md:text-base">
            Capture what you discussed in your group. Add another block if you track more than one
            theme.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-launch-neutral/50 bg-launch-navy/50 px-3 py-2 text-xs font-semibold text-launch-secondary transition hover:border-launch-gold/40 hover:text-launch-primary"
            onClick={() => setRowCount(rowCount + 1)}
            disabled={rowCount >= MAX_ROWS}
          >
            Add another entry
          </button>
          {rowCount > 1 ? (
            <button
              type="button"
              className="rounded-lg border border-launch-neutral/40 px-3 py-2 text-xs font-medium text-launch-muted transition hover:border-launch-steel/50 hover:text-launch-secondary"
              onClick={() => setRowCount(rowCount - 1)}
            >
              Remove last entry
            </button>
          ) : null}
        </div>

        {Array.from({ length: rowCount }, (_, row) => (
          <div
            key={row}
            className="rounded-2xl border border-launch-neutral/35 bg-black/25 p-5 md:p-7"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-launch-gold/90">
              {rowCount > 1 ? `Study block ${row + 1}` : "Notes"}
            </p>
            <div className="mt-6 space-y-7">
              {noteLabels.map(({ suffix, label, placeholder, rows: r }) => {
                const id = fieldId(row, suffix);
                return (
                  <label key={id} className="block">
                    <span className="text-base font-semibold text-launch-secondary">{label}</span>
                    <textarea
                      className={`${workbookFieldClassName} resize-y`}
                      style={{ minHeight: `${r * 1.5}rem` }}
                      placeholder={placeholder}
                      rows={r}
                      value={answers[id] ?? ""}
                      onChange={(e) => setParticipantAnswer(slideKey, id, e.target.value)}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section
        className="space-y-4 rounded-2xl border border-launch-neutral/30 bg-launch-navy/25 p-5 md:p-7"
        aria-labelledby="bible-study-library-heading"
      >
        <h3
          id="bible-study-library-heading"
          className="text-lg font-bold tracking-tight text-launch-steel/95 md:text-xl"
        >
          Explore More (Optional)
        </h3>
        <p className="text-sm leading-relaxed text-launch-muted md:text-base">
          This section is optional for further study beyond your assigned group.
        </p>
        <LibraryAccordion categories={BIBLICAL_FOUNDATIONS_LIBRARY} />
      </section>
    </div>
  );
}
