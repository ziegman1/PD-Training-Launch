/**
 * Core content model for Launch training sessions.
 * Minimal slide shape: id, title, bullets, trainerNotes + optional interaction, scripture, emphasis.
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

export type LaunchSlide = {
  id: string;
  section?: string;
  title: string;
  bullets: string[];
  trainerNotes: string;

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
  /** Alias for `promptQuestions` (authoring convenience) */
  prompts?: string[];
  /** Trainer-only: when / how to open pair, small-group, or full-room discussion */
  discussionHandoff?: string;
  /** Trainer-only: how to advance or close the beat */
  transitionCue?: string;
  fillInFields?: FillInField[];
  /** Trainer-only: Teams breakout logistics; stripped for audience slides. */
  breakout?: SlideBreakout;
  /** Passage themes for `interactionType: bibleStudy` — workbook + participant; deck UI does not render this block. */
  bibleStudyGroups?: BibleStudyGroup[];
};

/**
 * Slide data safe for audience-facing UI (/present, workbook main stage, trainer preview).
 * Omits facilitator-only fields — never pass these to shared-screen components.
 */
export type AudienceLaunchSlide = Omit<
  LaunchSlide,
  | "trainerNotes"
  | "timing"
  | "pauseCue"
  | "promptQuestions"
  | "prompts"
  | "discussionHandoff"
  | "transitionCue"
  | "breakout"
>;

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
};
