"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { renderSlideRichText } from "@/components/launch/slide/highlightKeyPhrases";
import { presentationFontSizeStyle } from "@/lib/presentationFontSizes";
import { PRESENTATION_RAIL_MAX_CLASS } from "@/components/launch/slide/presentationSlideLayout";

function useSyncTextContent(
  value: string,
  skipSync: () => boolean,
): React.MutableRefObject<HTMLElement | null> {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || skipSync()) return;
    const next = value;
    if ((el.textContent ?? "") !== next) {
      el.textContent = next;
    }
  }, [value, skipSync]);
  return ref;
}

type InlineEditableProps = {
  className?: string;
  style?: CSSProperties;
  value: string;
  onCommit: (next: string) => void;
  as?: "h2" | "p" | "span";
};

/**
 * Plain-text in-place editor: same typography as surrounding slide; commits on blur.
 */
export function InlineEditable({
  className = "",
  style,
  value,
  onCommit,
  as = "span",
}: InlineEditableProps) {
  const focused = useRef(false);
  const skipSync = useCallback(() => focused.current, []);
  const ref = useSyncTextContent(value, skipSync);

  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      style={style}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      className={`cursor-text outline-none caret-[var(--launch-gold)] focus-visible:ring-1 focus-visible:ring-launch-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${className}`}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={(e) => {
        focused.current = false;
        onCommit((e.currentTarget.textContent ?? "").trim());
      }}
    />
  );
}

/**
 * Scripture in admin deck preview: solid fill-in lines when idle; click for raw textarea edit.
 */
export function ScriptureRichEditor({
  value,
  keyPhrases,
  className = "",
  fontSizeRem,
  onCommit,
}: {
  value: string;
  keyPhrases?: string[];
  className?: string;
  fontSizeRem?: number;
  onCommit: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const fontStyle = useMemo(
    () => presentationFontSizeStyle(fontSizeRem),
    [fontSizeRem],
  );

  if (editing) {
    return (
      <textarea
        className={`${className} w-full resize-y bg-black/25 font-[inherit] leading-snug outline-none ring-1 ring-launch-gold/45 rounded px-2 py-1`}
        style={fontStyle}
        rows={Math.min(12, Math.max(3, draft.split(/\r?\n/).length + 1))}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onCommit(draft);
        }}
        autoFocus
      />
    );
  }

  return (
    <div
      role="textbox"
      tabIndex={0}
      className={`${className} cursor-text rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-launch-gold/35`}
      style={fontStyle}
      onClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setEditing(true);
        }
      }}
    >
      {value.trim() ? (
        renderSlideRichText(value, keyPhrases, "sc-ed-")
      ) : (
        <span className="text-launch-muted/80">Click to edit scripture…</span>
      )}
    </div>
  );
}

function BulletLine({
  value,
  phrases,
  lineKey,
  onListCommit,
}: {
  value: string;
  phrases?: string[];
  lineKey: string;
  onListCommit: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const focused = useRef(false);
  const skipSync = useCallback(() => focused.current, []);
  const ref = useSyncTextContent(value, skipSync);

  useEffect(() => {
    if (!editing) return;
    const el = ref.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    const r = document.createRange();
    if (el.childNodes.length > 0) {
      r.selectNodeContents(el);
      r.collapse(false);
    } else {
      r.setStart(el, 0);
      r.collapse(true);
    }
    sel.removeAllRanges();
    sel.addRange(r);
  }, [editing]);

  if (!editing) {
    return (
      <div
        className="min-w-0 flex-1 cursor-text rounded-sm text-left outline-none hover:ring-1 hover:ring-launch-gold/20 focus-visible:ring-1 focus-visible:ring-launch-gold/35"
        tabIndex={0}
        role="textbox"
        onClick={() => setEditing(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setEditing(true);
          }
        }}
      >
        {value ? (
          renderSlideRichText(value, phrases, lineKey)
        ) : (
          <span className="text-launch-muted/70">…</span>
        )}
      </div>
    );
  }

  return (
    <span
      ref={ref as never}
      data-editable-bullet
      contentEditable
      suppressContentEditableWarning
      spellCheck
      className="min-w-0 flex-1 cursor-text text-left outline-none caret-[var(--launch-gold)] focus-visible:ring-1 focus-visible:ring-launch-gold/35 rounded-sm"
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        setEditing(false);
        onListCommit();
      }}
    />
  );
}

type EditableBulletListProps = {
  bullets: string[];
  keyPhrases?: string[];
  lockedVisualRowTarget?: number;
  fontSizeRem?: number;
  className?: string;
  onChange: (next: string[]) => void;
};

export function EditablePresentationBulletList({
  bullets,
  keyPhrases,
  lockedVisualRowTarget,
  fontSizeRem,
  className = "",
  onChange,
}: EditableBulletListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const rows = bullets.length > 0 ? bullets : [""];
  const padCount =
    lockedVisualRowTarget != null
      ? Math.max(0, lockedVisualRowTarget - rows.length)
      : 0;

  const commitList = useCallback(() => {
    const els =
      listRef.current?.querySelectorAll<HTMLElement>("[data-editable-bullet]");
    if (!els) return;
    const next = [...els]
      .map((el) => (el.textContent ?? "").trim())
      .filter((t) => t.length > 0);
    onChange(next);
  }, [onChange]);

  const lockedRows = lockedVisualRowTarget ?? 0;
  const bulletRegionMinStyle =
    lockedRows > 0
      ? ({
          minHeight:
            "calc(var(--presentation-bullet-row, 2.875rem) * " +
            String(lockedRows) +
            " + var(--presentation-bullet-gap, 0.875rem) * " +
            String(Math.max(0, lockedRows - 1)) +
            ")",
        } as const)
      : undefined;
  const listStyle =
    bulletRegionMinStyle || fontSizeRem != null
      ? {
          ...bulletRegionMinStyle,
          ...(fontSizeRem != null
            ? { fontSize: `${fontSizeRem}rem` }
            : {}),
        }
      : undefined;

  return (
    <ul
      ref={listRef}
      role="list"
      style={listStyle}
      className={[
        "slide-viewport-bullet-list text-slide-bullet w-full list-none text-left font-medium leading-snug text-launch-secondary/95 [contain:layout]",
        PRESENTATION_RAIL_MAX_CLASS,
        "mx-auto min-h-0 pl-1 sm:pl-1.5",
        "space-y-3 sm:space-y-3.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {rows.map((b, i) => (
        <li
          key={i}
          className="flex items-start gap-4 sm:gap-[1.125rem]"
        >
          <span
            className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rotate-45 bg-launch-gold"
            aria-hidden
          />
          <BulletLine
            value={b}
            phrases={keyPhrases}
            lineKey={`eb-${i}-`}
            onListCommit={commitList}
          />
        </li>
      ))}
      {Array.from({ length: padCount }, (_, i) => (
        <li
          key={`_lockpad-${i}`}
          aria-hidden
          className="flex items-start gap-4 select-none sm:gap-[1.125rem]"
        >
          <span
            className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rotate-45 bg-launch-gold opacity-0"
            aria-hidden
          />
          <span className="min-h-[1.48em] min-w-0 flex-1 text-left opacity-0">
            {"\u00A0"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PromptLine({
  value,
  onListCommit,
}: {
  value: string;
  onListCommit: () => void;
}) {
  const focused = useRef(false);
  const skipSync = useCallback(() => focused.current, []);
  const ref = useSyncTextContent(value, skipSync);
  return (
    <span
      ref={ref as never}
      data-editable-prompt
      contentEditable
      suppressContentEditableWarning
      spellCheck
      className="min-w-0 flex-1 cursor-text text-left outline-none caret-[var(--launch-gold)] focus-visible:ring-1 focus-visible:ring-launch-gold/35 rounded-sm"
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        onListCommit();
      }}
    />
  );
}

type EditablePromptListProps = {
  prompts: string[];
  lockedVisualRowTarget?: number;
  fontSizeRem?: number;
  className?: string;
  onChange: (next: string[]) => void;
};

export function EditablePresentationPromptList({
  prompts,
  lockedVisualRowTarget,
  fontSizeRem,
  className = "",
  onChange,
}: EditablePromptListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const rows = prompts.length > 0 ? prompts : [""];
  const padCount =
    lockedVisualRowTarget != null
      ? Math.max(0, lockedVisualRowTarget - rows.length)
      : 0;

  const commitList = useCallback(() => {
    const els =
      listRef.current?.querySelectorAll<HTMLElement>("[data-editable-prompt]");
    if (!els) return;
    const next = [...els]
      .map((el) => (el.textContent ?? "").trim())
      .filter((t) => t.length > 0);
    onChange(next);
  }, [onChange]);

  const lockedRows = lockedVisualRowTarget ?? 0;
  const regionMinStyle =
    lockedRows > 0
      ? ({
          minHeight:
            "calc(var(--presentation-bullet-row, 2.875rem) * " +
            String(lockedRows) +
            " + var(--presentation-bullet-gap, 0.875rem) * " +
            String(Math.max(0, lockedRows - 1)) +
            ")",
        } as const)
      : undefined;
  const promptListStyle =
    regionMinStyle || fontSizeRem != null
      ? {
          ...regionMinStyle,
          ...(fontSizeRem != null
            ? { fontSize: `${fontSizeRem}rem` }
            : {}),
        }
      : undefined;

  return (
    <ul
      ref={listRef}
      role="list"
      style={promptListStyle}
      className={[
        "slide-viewport-prompt-list text-slide-bullet w-full list-none text-left font-medium leading-snug text-launch-secondary/95 [contain:layout]",
        PRESENTATION_RAIL_MAX_CLASS,
        "mx-auto min-h-0 pl-1 sm:pl-1.5",
        "space-y-3 sm:space-y-3.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {rows.map((line, i) => (
        <li
          key={i}
          className="flex items-start gap-4 sm:gap-[1.125rem]"
        >
          <span
            className="mt-[0.42em] flex h-[1.15em] w-[1.15em] shrink-0 items-center justify-center rounded-full border border-launch-gold/55 bg-launch-gold/15 text-[0.65em] font-bold text-launch-gold"
            aria-hidden
          >
            {i + 1}
          </span>
          <PromptLine value={line} onListCommit={commitList} />
        </li>
      ))}
      {Array.from({ length: padCount }, (_, i) => (
        <li
          key={`_plock-${i}`}
          aria-hidden
          className="flex items-start gap-4 select-none sm:gap-[1.125rem]"
        >
          <span
            className="mt-[0.42em] h-[1.15em] w-[1.15em] shrink-0 rounded-full border border-launch-gold/20 opacity-0"
            aria-hidden
          />
          <span className="min-h-[1.48em] min-w-0 flex-1 text-left opacity-0">
            {"\u00A0"}
          </span>
        </li>
      ))}
    </ul>
  );
}
