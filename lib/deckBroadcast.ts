/**
 * Keeps slide index aligned across browser tabs/windows (same origin).
 * Use case: Teams screen share shows `/present/...` only; facilitator runs `/trainer/...` privately.
 *
 * BroadcastChannel works across tabs; sessionStorage seeds new tabs and survives refresh.
 */

export function deckChannelName(sessionId: string): string {
  return `launch-deck-${sessionId}`;
}

export function deckStorageKey(sessionId: string): string {
  return `launch-deck-index:${sessionId}`;
}

export type DeckBroadcastPayload = {
  type: "slide";
  index: number;
  sign: 1 | -1;
};

export function readStoredDeckIndex(sessionId: string): number | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(deckStorageKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { index?: number };
    return typeof parsed.index === "number" ? parsed.index : null;
  } catch {
    return null;
  }
}

export function writeStoredDeckIndex(
  sessionId: string,
  index: number,
  sign: 1 | -1,
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      deckStorageKey(sessionId),
      JSON.stringify({ index, sign }),
    );
  } catch {
    /* quota / private mode */
  }
}
