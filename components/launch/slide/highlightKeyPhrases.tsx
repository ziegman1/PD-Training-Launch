import type { ReactNode } from "react";

/** Gold accent + soft glow; reads clearly on both white titles and cream bullets */
const goldClass = "launch-key-phrase font-semibold text-launch-gold";

/** Two or more underscores → rendered as a thin fill-in line (not individual glyph gaps). */
const UNDERSCORE_BLANK = /_{2,}/g;

/** Optional hint directly after a blank: whitespace + `( … )` (e.g. `(name/title)`). Shown under the line. */
const PAREN_HINT_AFTER_BLANK = /^\s*(\([^)]+\))/;

function appendHighlighted(
  parts: ReactNode[],
  segment: string,
  phrases: string[] | undefined,
  keyPrefix: string,
) {
  if (!segment) return;
  const h = highlightKeyPhrases(segment, phrases, keyPrefix);
  if (h == null || h === "") return;
  if (Array.isArray(h)) parts.push(...h);
  else parts.push(h);
}

/**
 * Titles, bullets, prompts: key-phrase gold + thin underline rules for `____` style blanks.
 * A parenthetical hint immediately after underscores (e.g. `(name/title)`) is shown beneath the line.
 */
export function renderSlideRichText(
  text: string,
  phrases: string[] | undefined,
  keyPrefix = "",
): ReactNode {
  const parts: ReactNode[] = [];
  let i = 0;
  let blankIdx = 0;
  const copy = text;

  while (i < copy.length) {
    UNDERSCORE_BLANK.lastIndex = i;
    const m = UNDERSCORE_BLANK.exec(copy);
    if (!m) {
      appendHighlighted(parts, copy.slice(i), phrases, `${keyPrefix}tail${i}-`);
      break;
    }
    if (m.index > i) {
      appendHighlighted(
        parts,
        copy.slice(i, m.index),
        phrases,
        `${keyPrefix}s${m.index}-`,
      );
    }
    const n = m[0].length;
    blankIdx += 1;
    const minCh = Math.max(2.25, n * 0.48);
    let after = m.index + n;
    const rest = copy.slice(after);
    const hm = rest.match(PAREN_HINT_AFTER_BLANK);
    let hint: string | undefined;
    if (hm) {
      hint = hm[1];
      after += hm[0].length;
    }
    parts.push(
      <span
        key={`${keyPrefix}blank-${blankIdx}-${m.index}`}
        className="presentation-fill-in-blank mx-[0.12em] inline-grid max-w-[min(18ch,100%)] shrink-0 justify-items-center gap-[0.14em] align-baseline [vertical-align:baseline]"
        style={{ minWidth: `${minCh.toFixed(2)}ch` }}
        aria-label={hint ? `Fill-in ${hint}` : "Fill-in blank"}
      >
        <span
          className="box-border block w-full min-w-full shrink-0 opacity-90"
          style={{
            paddingBottom: "0.03em",
            borderBottom: "max(1px, 0.055em) solid currentColor",
          }}
          aria-hidden
        />
        {hint ? (
          <span className="w-full max-w-full text-center text-[0.62em] font-normal leading-snug text-launch-muted">
            {hint}
          </span>
        ) : null}
      </span>,
    );
    i = after;
  }

  if (parts.length === 0) return copy;
  if (parts.length === 1) return parts[0];
  return parts;
}

/**
 * Wraps occurrences of `phrases` (longest first) in gold. Case-insensitive match.
 * @param keyPrefix Optional prefix for React keys when this runs multiple times per line.
 */
export function highlightKeyPhrases(
  text: string,
  phrases: string[] | undefined,
  keyPrefix = "",
): ReactNode {
  if (!phrases?.length) return text;

  const sorted = [...new Set(phrases.map((p) => p.trim()).filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );
  if (!sorted.length) return text;

  const pattern = sorted
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const re = new RegExp(`(${pattern})`, "gi");

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let chunk = 0;
  const copy = text;
  re.lastIndex = 0;
  while ((match = re.exec(copy)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(copy.slice(lastIndex, match.index));
    }
    chunk += 1;
    nodes.push(
      <span key={`${keyPrefix}h-${chunk}-${match.index}`} className={goldClass}>
        {match[0]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
    if (match.index === re.lastIndex) re.lastIndex++;
  }
  if (lastIndex < copy.length) {
    nodes.push(copy.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : text;
}
