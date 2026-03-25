import type { DeckPlacement, DeckPlacementBox } from "@/types/launch";

export const DEFAULT_DECK_PLACEMENT: {
  title: DeckPlacementBox;
  emphasis: DeckPlacementBox;
  bullets: DeckPlacementBox & { widthPct: number };
} = {
  title: { xPct: 50, yPct: 16 },
  emphasis: { xPct: 50, yPct: 28 },
  bullets: { xPct: 50, yPct: 52, widthPct: 88 },
};

export function hasCustomDeckPlacement(slide: {
  deckPlacement?: DeckPlacement;
}): boolean {
  const d = slide.deckPlacement;
  if (!d) return false;
  return Boolean(d.title ?? d.emphasis ?? d.bullets);
}

/** Resolved boxes (defaults + saved overrides) for rendering and admin drag sync. */
export type ResolvedDeckPlacement = ReturnType<typeof mergeDeckPlacement>;

export function mergeDeckPlacement(dp: DeckPlacement | undefined): {
  title: DeckPlacementBox;
  emphasis: DeckPlacementBox;
  bullets: DeckPlacementBox & { widthPct: number };
} {
  const b = DEFAULT_DECK_PLACEMENT.bullets;
  return {
    title: { ...DEFAULT_DECK_PLACEMENT.title, ...dp?.title },
    emphasis: { ...DEFAULT_DECK_PLACEMENT.emphasis, ...dp?.emphasis },
    bullets: {
      xPct: dp?.bullets?.xPct ?? b.xPct,
      yPct: dp?.bullets?.yPct ?? b.yPct,
      widthPct: dp?.bullets?.widthPct ?? b.widthPct,
    },
  };
}
