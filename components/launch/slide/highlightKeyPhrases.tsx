import type { ReactNode } from "react";

/** Gold accent + soft glow; reads clearly on both white titles and cream bullets */
const goldClass = "launch-key-phrase font-semibold text-launch-gold";

/**
 * Wraps occurrences of `phrases` (longest first) in gold. Case-insensitive match.
 */
export function highlightKeyPhrases(
  text: string,
  phrases: string[] | undefined,
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
      <span key={`h-${chunk}-${match.index}`} className={goldClass}>
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
