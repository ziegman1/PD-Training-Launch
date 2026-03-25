import type {
  DeckPlacement,
  InteractionType,
  LaunchSlide,
  PresentationFontSizes,
} from "@/types/launch";

function parsePresentationFontSizes(
  raw: unknown,
): PresentationFontSizes | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const keys: (keyof PresentationFontSizes)[] = [
    "sectionRem",
    "titleRem",
    "emphasisRem",
    "scriptureRem",
    "bulletsRem",
    "promptsRem",
    "interactionRem",
  ];
  const out: PresentationFontSizes = {};
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0.5 && v <= 4) {
      out[k] = v;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Build a `LaunchSlide` from loose authoring JSON for admin preview and tooling.
 */
export function authoringSlideToLaunchSlide(
  s: Record<string, unknown>,
): LaunchSlide {
  const bullets = Array.isArray(s.bullets)
    ? s.bullets.map((x) => String(x))
    : [];
  const dpRaw = s.deckPlacement;
  const deckPlacement =
    dpRaw && typeof dpRaw === "object"
      ? (dpRaw as DeckPlacement)
      : undefined;
  const presentationFontSizes = parsePresentationFontSizes(
    s.presentationFontSizes,
  );

  return {
    id: String(s.id ?? "preview-slide"),
    title: String(s.title ?? ""),
    bullets,
    trainerCadence: String(s.trainerCadence ?? ""),
    trainerTransition: String(s.trainerTransition ?? ""),
    trainerScriptNotes: String(s.trainerScriptNotes ?? ""),
    ...(typeof s.emphasis === "string" && s.emphasis.trim()
      ? { emphasis: s.emphasis }
      : {}),
    ...(typeof s.section === "string" && s.section.trim()
      ? { section: s.section }
      : {}),
    ...(typeof s.scripture === "string" && s.scripture.trim()
      ? { scripture: s.scripture }
      : {}),
    ...(typeof s.continuationGroup === "string" && s.continuationGroup.trim()
      ? { continuationGroup: s.continuationGroup }
      : {}),
    ...(typeof s.bulletRevealVisibleCount === "number"
      ? { bulletRevealVisibleCount: s.bulletRevealVisibleCount }
      : {}),
    ...(typeof s.promptRevealVisibleCount === "number"
      ? { promptRevealVisibleCount: s.promptRevealVisibleCount }
      : {}),
    ...(Array.isArray(s.prompts) && s.prompts.length > 0
      ? { prompts: s.prompts.map((p) => String(p)) }
      : {}),
    ...(typeof s.interactionType === "string" && s.interactionType
      ? { interactionType: s.interactionType as InteractionType }
      : {}),
    ...(typeof s.interaction === "string" && s.interaction.trim()
      ? { interaction: s.interaction }
      : {}),
    ...(typeof s.timing === "string" && s.timing ? { timing: s.timing } : {}),
    ...(typeof s.pauseCue === "string" && s.pauseCue
      ? { pauseCue: s.pauseCue }
      : {}),
    ...(typeof s.discussionHandoff === "string" && s.discussionHandoff
      ? { discussionHandoff: s.discussionHandoff }
      : {}),
    ...(typeof s.transitionCue === "string" && s.transitionCue
      ? { transitionCue: s.transitionCue }
      : {}),
    ...(Array.isArray(s.keyPhrases)
      ? { keyPhrases: s.keyPhrases.map((k) => String(k)) }
      : {}),
    ...(deckPlacement ? { deckPlacement } : {}),
    ...(presentationFontSizes ? { presentationFontSizes } : {}),
  };
}
