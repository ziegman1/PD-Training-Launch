"use client";

import { useCallback, useEffect, useRef } from "react";
import { sanitizeSlideTableHtml } from "@/lib/sanitizeSlideTableHtml";

function escapeCell(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build a minimal HTML table from TSV / newline plain text (e.g. Excel copy). */
function plainToTableHtml(plain: string): string {
  const lines = plain.replace(/\r\n/g, "\n").trimEnd().split("\n");
  if (lines.length === 0) return "";
  const rows = lines.map((line) => line.split("\t"));
  const body = rows
    .map(
      (cells) =>
        "<tr>" +
        cells.map((c) => `<td>${escapeCell(c)}</td>`).join("") +
        "</tr>",
    )
    .join("");
  return `<table><tbody>${body}</tbody></table>`;
}

type Props = {
  value: string;
  onChange: (next: string | undefined) => void;
};

/**
 * contentEditable region that accepts pasted HTML tables (or TSV plain text)
 * and stores sanitized HTML in authoring.
 */
export function SlideTablePasteField({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useRef(false);
  const hasTable = Boolean(sanitizeSlideTableHtml(value).trim());

  useEffect(() => {
    const el = ref.current;
    if (!el || focused.current) return;
    const safe = sanitizeSlideTableHtml(value);
    if (el.innerHTML !== safe) el.innerHTML = safe;
  }, [value]);

  const commit = useCallback(() => {
    const el = ref.current;
    const raw = el ? el.innerHTML : "";
    const safe = sanitizeSlideTableHtml(raw);
    if (el && el.innerHTML !== safe) el.innerHTML = safe;
    onChange(safe.trim() ? safe : undefined);
  }, [onChange]);

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const html = e.clipboardData.getData("text/html");
      const plain = e.clipboardData.getData("text/plain");
      let inserted = "";
      if (html && html.trim()) {
        inserted = sanitizeSlideTableHtml(html);
      } else if (plain && plain.trim()) {
        inserted = sanitizeSlideTableHtml(plainToTableHtml(plain));
      }
      if (!inserted || !ref.current) return;
      ref.current.focus();
      const sel = window.getSelection();
      if (!sel) return;
      let range: Range;
      if (sel.rangeCount > 0) {
        range = sel.getRangeAt(0);
        range.deleteContents();
      } else {
        range = document.createRange();
        range.selectNodeContents(ref.current);
        range.collapse(false);
      }
      const frag = range.createContextualFragment(inserted);
      range.insertNode(frag);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      commit();
    },
    [commit],
  );

  const clearTable = useCallback(() => {
    focused.current = false;
    if (ref.current) ref.current.innerHTML = "";
    onChange(undefined);
  }, [onChange]);

  return (
    <div className="space-y-1.5">
      {hasTable ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearTable}
            className="rounded border border-red-400/40 bg-red-950/40 px-2 py-0.5 text-[11px] font-medium text-red-200/95 ring-1 ring-red-400/25 hover:bg-red-900/50 hover:text-red-50"
          >
            Remove table
          </button>
        </div>
      ) : null}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onPaste={onPaste}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
          commit();
        }}
        className="min-h-[5rem] w-full rounded border border-launch-steel/30 bg-black/30 p-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-launch-gold/40 [&_table]:max-w-none"
      />
    </div>
  );
}
