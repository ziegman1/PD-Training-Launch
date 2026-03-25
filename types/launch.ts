/**
 * Core content model for Launch training sessions.
 * Minimal slide shape: id, title, bullets, trainer layers + optional interaction, scripture, emphasis.
 * Extended fields support trainer polish and participant UI.
 */

/**
 * UI mode for in-app toggling (legacy `LaunchShell`). Split routes are the Teams default:
 * presentation → `/present/:id`, trainer support → `/trainer/:id`, participant → `/workbook/:id`.
 */
export type LaunchMode = "presentation" | "trainer" | "participant";

export type InteractionType =
  | "none"
  | "reflection"
  | "fillIn"
  | "exercise"
  | "discussion"
  | "pairShare"
  /** Closing / corporate prayer prompt — uses discussion-style slide layout; workbook column stays light. */
  | "prayer"
  /** Scripture breakout — standard slide in presentation; structured workbook + trainer passage groups. */
  | "bibleStudy";

export type FillInField = {
  id: string;
  label: string;
  placeholder?: string;
};

/**
 * Workbook fill-in-the-blank when `interactionType` is `fillIn`.
 * Use three or more underscores in `prompt` for each blank (e.g. ________).
 */
export type FillInInteractionData = {
  prompt: string;
  /** Optional per-blank hints (e.g. suggested wording from teaching); used as placeholders */
  answers?: string[];
  helperText?: string;
  /** Reserved for future validation; inputs are always free-text for now */
  optional?: boolean;
};

/**
 * Trainer-only: Teams breakout logistics and debrief. Never shown on /present.
 * Use `enabled: false` with `instructions` / `duration` for structured main-room activities.
 */
export type SlideBreakout = {
  enabled: boolean;
  /** Typical: 2 for pairs, 3–4 for triads */
  groupSize?: number;
  /** Time in breakout rooms (may differ from full-slide `timing`) */
  duration?: string;
  /** What participants do in the room */
  instructions?: string[];
  /** Questions after closing rooms */
  debrief?: string[];
};

/** Trainer-only: assign breakout groups to passage themes (never on /present). */
export type BibleStudyGroup = {
  id: string;
  topic: string;
  passages: string[];
  /** Optional angle for the facilitator */
  facilitatorNote?: string;
};

/**
 * Percent-based position (0–100) on the presentation slide stage. Used when
 * `deckPlacement` is set so title / emphasis / lower body can be placed freely.
 */
export type DeckPlacementBox = {
  xPct: number;
  yPct: number;
  /** Lower content stack (scripture, bullets, prompts, Together) — width as % of stage */
  widthPct?: number;
};

export type DeckPlacement = {
  title?: DeckPlacementBox;
  emphasis?: DeckPlacementBox;
  bullets?: DeckPlacementBox;
};

/**
 * Optional presentation text scale per region (rem). Used on `/present` and admin deck preview.
 * Omitted keys use default slide typography.
 */
export type PresentationFontSizes = {
  sectionRem?: number;
  titleRem?: number;
  emphasisRem?: number;
  scriptureRem?: number;
  bulletsRem?: number;
  promptsRem?: number;
  interactionRem?: number;
};

export type LaunchSlide = {
  id: string;
  section?: string;
  title: string;
  bullets: string[];
  /** Trainer-only: say this out loud — conversational, 2–5 short paragraphs, no bullet fragments. */
  trainerCadence: string;
  /** Trainer-only: one or two spoken sentences that bridge naturally to the next slide. */
  trainerTransition: string;
  /** Trainer-only: internal coaching (pacing, tone, watch-fors); may use "- " line bullets. */
  trainerScriptNotes: string;

  /** Audience + participant prompt (pair share, poll, reflection instructions, etc.) */
  interaction?: string;
  /** Optional verse or passage reference shown on the slide */
  scripture?: string;
  emphasis?: string;
  keyPhrases?: string[];

  /**
   * Presentation (`/present`): slides with the same value advance as one visual unit—shared motion
   * key, no deck transition between them. Use the first slide’s `id` as the canonical group id.
   */
  continuationGroup?: string;

  /**
   * Progressive bullet reveal: how many bullets are visible (opacity 1). All bullets stay in the
   * DOM; unrevealed rows use opacity 0. `0` = none visible (title-only beat). Omitted = show all
   * bullets (no reveal). Populated by `normalize-session-*.mjs` when expanding multi-bullet slides.
   */
  bulletRevealVisibleCount?: number;

  /**
   * Progressive reveal for slide `prompts` (room / participant questions). Same semantics as bullets.
   * Omitted = show all prompts. Populated by expand script when a slide has multiple prompts or
   * a title-only lead-in before prompts.
   */
  promptRevealVisibleCount?: number;

  /**
   * Authoring only (stripped by normalize): set `false` to skip auto-expansion into reveal steps.
   */
  progressiveReveal?: boolean;

  /**
   * Authoring only (stripped by expand): default true — insert a first deck step with
   * `bulletRevealVisibleCount: 0` (title/subtitle only), then one step per bullet. Set `false`
   * to start with the first bullet visible (no title-only beat; multi-bullet still expands 1..N).
   */
  progressiveRevealLeadIn?: boolean;

  /**
   * Participant workbook behavior. If omitted: no `interaction` → none;
   * with `interaction` → discussion; use `fillIn` / `reflection` explicitly when needed.
   */
  interactionType?: InteractionType;
  /** @deprecated use `interaction` */
  interactionPrompt?: string;

  /** Trainer-only: suggested duration for this slide */
  timing?: string;
  /** Trainer-only: when to pause (silence, let a line land, wait for pairs) */
  pauseCue?: string;
  /** Trainer-only: questions to put to the room (timing is yours—see pauseCue) */
  promptQuestions?: string[];
  /**
   * Participant + presentation: discussion / room prompts (merged from `promptQuestions` in
   * normalize). Reveal progressively via `promptRevealVisibleCount` when expanded.
   */
  prompts?: string[];
  /** Trainer-only: when / how to open pair, small-group, or full-room discussion */
  discussionHandoff?: string;
  /** Trainer-only: how to advance or close the beat */
  transitionCue?: string;
  fillInFields?: FillInField[];
  /** Workbook: inline sentence blanks when `interactionType` is `fillIn` */
  interactionData?: FillInInteractionData;
  /** Trainer-only: Teams breakout logistics; stripped for audience slides. */
  breakout?: SlideBreakout;
  /** Passage themes for `interactionType: bibleStudy` — workbook + participant; deck UI does not render this block. */
  bibleStudyGroups?: BibleStudyGroup[];

  /**
   * When set (any of title / emphasis / bullets), `/present` uses absolute positioning
   * for those regions instead of the default centered column stack.
   */
  deckPlacement?: DeckPlacement;

  /** Per-field font size overrides (admin authoring + live deck). */
  presentationFontSizes?: PresentationFontSizes;
};

/**
 * Slide data safe for audience-facing UI (/present, workbook main stage, trainer preview).
 * Omits facilitator-only fields — never pass these to shared-screen components.
 */
export type AudienceLaunchSlide = Omit<
  LaunchSlide,
  | "trainerCadence"
  | "trainerTransition"
  | "trainerScriptNotes"
  | "timing"
  | "pauseCue"
  | "promptQuestions"
  | "discussionHandoff"
  | "transitionCue"
  | "breakout"
  | "progressiveReveal"
  | "progressiveRevealLeadIn"
>;

/** One prompt field in a guided workbook reflection section */
export type WorkbookReflectionPrompt = {
  fieldId: string;
  label: string;
  placeholder?: string;
  /** Textarea rows (approximate) */
  rows?: number;
};

/** Single sentence with `___` blanks in workbook fill-in sections */
export type WorkbookFillInItem = {
  prompt: string;
  answers?: string[];
  helperText?: string;
};

export type WorkbookSectionKind = "reflection" | "bibleStudy" | "fillIn";

/**
 * Guided workbook step — `/workbook` can render these instead of mirroring every deck slide.
 */
export type WorkbookSectionDefinition = {
  id: string;
  kind: WorkbookSectionKind;
  title: string;
  subtitle?: string;
  /** Optional credit line, shown below subtitle (e.g. adapted framework) */
  attribution?: string;
  /** Short label above the title (e.g. “Opening”) */
  sectionEyebrow?: string;
  /** Framing copy in the muted context box */
  intro?: string;
  /** For `bibleStudy`: slide id that supplies `bibleStudyGroups` */
  sourceSlideId?: string;
  reflectionPrompts?: WorkbookReflectionPrompt[];
  fillInItems?: WorkbookFillInItem[];
  /** Tighter vertical spacing between short fill-in lines (`fillIn` sections) */
  fillInCompact?: boolean;
};

export type LaunchSessionWorkbook = {
  sections: WorkbookSectionDefinition[];
};

export type LaunchSession = {
  sessionId: string;
  programName: string;
  title: string;
  subtitle?: string;
  /** Optional authoring labels (shown in chrome / future UI). */
  shortTitle?: string;
  theme?: string;
  objective?: string;
  slides: LaunchSlide[];
  /** When set, workbook route uses these sections only (not full slide list). */
  workbook?: LaunchSessionWorkbook;
};
