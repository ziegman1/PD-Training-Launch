const BLANK_RE = /_{3,}/g;

export type FillInSegment =
  | { kind: "text"; text: string }
  | { kind: "blank"; index: number };

/**
 * Split a prompt into text runs and blanks. Blanks are assigned indices 0..n-1 in order.
 * Each blank is written in authoring as three or more underscores (e.g. ________).
 */
export function parseFillInPrompt(prompt: string): FillInSegment[] {
  const segments: FillInSegment[] = [];
  let last = 0;
  let blankIndex = 0;
  for (const m of prompt.matchAll(BLANK_RE)) {
    const mi = m.index ?? 0;
    if (mi > last) {
      segments.push({ kind: "text", text: prompt.slice(last, mi) });
    }
    segments.push({ kind: "blank", index: blankIndex });
    blankIndex += 1;
    last = mi + m[0].length;
  }
  if (last < prompt.length) {
    segments.push({ kind: "text", text: prompt.slice(last) });
  }
  if (segments.length === 0) {
    segments.push({ kind: "text", text: prompt });
  }
  return segments;
}

export function countFillInBlanks(prompt: string): number {
  return parseFillInPrompt(prompt).filter((s) => s.kind === "blank").length;
}
