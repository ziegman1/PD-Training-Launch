import type { ReactNode } from "react";
import { renderSlideRichText } from "@/components/launch/slide/highlightKeyPhrases";

/**
 * Presentation content strategy (Launch / Teams):
 * - Prefer **2–4 bullets** per slide for balance and presenter-safe clear space (narrow centered rail).
 * - **Do not** cram five dense bullets onto one slide when it hurts layout—split into additional
 *   slides with the **same title and emphasis** as the first beat; link them with matching
 *   `continuationGroup` (canonical id = first slide’s `id`) so `/present` advances without deck motion.
 * - Slides tied to a **single participant activity** (e.g. one `interactionType` + workbook state per id)
 *   may stay slightly denser when splitting would fragment inputs—prefer short lines when possible.
 * - Avoid shifting the whole column asymmetrically for PiP; control density and rail width instead.
 * - **Interactive** cards (discussion / pair / reflection / prayer) use `PRESENTATION_INTERACTIVE_RAIL_WRAPPER_CLASS`
 *   so prompt copy matches bullet rail width—same BR clear space without left-shifting the column.
 *
 * Presentation Mode: wide cinematic stage (`max-w` ~90vw, capped) with a readable inner rail
 * (`PRESENTATION_RAIL_MAX_CLASS` on bullets/scripture/cards). Horizontal gutter leaves ambient
 * `launch-gradient-bg` visible; locked `SlideContainer` uses `px-0` inside the rail.
 */
export const PRESENTATION_GRID_WRAPPER_CLASS =
  "mx-auto flex min-h-0 w-full max-w-[min(90vw,82rem)] flex-1 flex-col px-2.5 py-2 sm:px-3 sm:py-2.5 md:px-4";

/**
 * Rounded “lighter blue” stage panel inside the grid — sits on the deep navy viewport canvas.
 */
export const PRESENTATION_STAGE_SHELL_CLASS =
  "relative isolate flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-launch-steel/[0.11] bg-gradient-to-b from-[#283542]/[0.97] via-[#222c38]/[0.98] to-[#1a222c]/[0.99] shadow-[inset_0_1px_0_0_rgba(175,201,217,0.08),0_0_0_1px_rgba(0,0,0,0.22),0_28px_64px_-18px_rgba(0,0,0,0.42)]";

/**
 * Fills the shell: relative positioning context for depth texture, brand overlay + slide stack.
 */
export const PRESENTATION_STAGE_CLASS =
  "relative z-[1] flex min-h-0 w-full flex-1 flex-col overflow-hidden";

/**
 * Lower stack wrapper (scripture / bullets / together): full column width; horizontal inset
 * comes from the shared centered rail (`PRESENTATION_RAIL_MAX_CLASS`), not asymmetric padding.
 */
export const PRESENTATION_TEAMS_LOWER_SAFE_CLASS = "w-full shrink-0";

/** Slide body stack — full width of the stage (text rail capped separately via `PRESENTATION_RAIL_MAX_CLASS`). */
export const PRESENTATION_COLUMN_CLASS =
  "flex w-full min-h-0 flex-col items-center";

/**
 * Bullet + scripture + together rail — max ~620px (min ~520px on short viewports), centered.
 * Keeps lower copy from reaching the bottom-right presenter overlay without shifting the column.
 */
export const PRESENTATION_RAIL_MAX_CLASS =
  "max-w-[min(38.75rem,100%)] [@media(max-height:720px)]:max-w-[min(32.5rem,100%)]";

export const PRESENTATION_SECTION_HEADER_CLASS =
  "mb-3 flex w-full flex-col items-center gap-2 text-center sm:mb-3.5";

/** Moment label (Discussion / Reflection / …) above title */
export const PRESENTATION_MOMENT_LABEL_CLASS =
  "mb-3 shrink-0 text-center sm:mb-3.5";

/**
 * Title: large, bold, centered. Large space below when more content follows (48–72px band).
 */
export function presentationTitleClass(hasContentBelow: boolean): string {
  return [
    "w-full max-w-[28ch] shrink-0 text-balance text-center text-slide-title font-bold leading-[1.06] tracking-[-0.03em] text-launch-primary sm:max-w-[34ch]",
    hasContentBelow ? "mb-[clamp(3rem,5.75vh,4.65rem)]" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Gold emphasis: centered; medium space below when something follows (32–48px band). */
export function presentationEmphasisWrapClass(hasContentBelow: boolean): string {
  return [
    "flex w-full shrink-0 justify-center px-1 text-center sm:px-2",
    hasContentBelow ? "mb-[clamp(2.35rem,3.95vh,3.35rem)]" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Scripture block: left-aligned inside column; rhythm below when bullets / together follow. */
export function presentationScriptureWrapClass(hasContentBelow: boolean): string {
  return [
    "w-full shrink-0 text-left",
    PRESENTATION_RAIL_MAX_CLASS,
    "mx-auto",
    hasContentBelow ? "mb-[clamp(1.85rem,3.15vh,2.6rem)]" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Space after bullet list when a together box follows */
export const PRESENTATION_AFTER_BULLETS_MB = "mb-[clamp(1.25rem,2.35vh,1.8rem)]";

export const PRESENTATION_TOGETHER_BOX_CLASS = [
  "w-full rounded-lg border border-launch-neutral/35 bg-launch-navy/50 px-4 py-3 text-left sm:px-5 sm:py-3.5",
  PRESENTATION_RAIL_MAX_CLASS,
  "mx-auto",
].join(" ");

/** Interactive prompt / reflection card: fills vertical space below hero; width capped in rail wrapper */
export const PRESENTATION_INTERACTIVE_SLOT_CLASS =
  "flex min-h-0 w-full flex-1 flex-col overflow-hidden";

/**
 * Same max-width as bullets/scripture — centers discussion / pair / reflection cards under the title
 * so Teams bottom-right presenter PiP stays clear (no full-900px body text).
 */
export const PRESENTATION_INTERACTIVE_RAIL_WRAPPER_CLASS = [
  PRESENTATION_RAIL_MAX_CLASS,
  "mx-auto flex w-full min-h-0 flex-1 flex-col",
].join(" ");

/** Space between hero stack (title / emphasis / bullets) and the interactive card */
export const PRESENTATION_INTERACTIVE_AFTER_STACK_MB =
  "mt-[clamp(1.15rem,2.5vh,1.65rem)]";

type PresentationBulletListProps = {
  bullets: string[];
  phrases?: string[];
  /**
   * Presentation continuation lock: pad with invisible rows so list height matches the
   * tallest slide in the `continuationGroup` (only bullet text changes between advances).
   */
  lockedVisualRowTarget?: number;
  /**
   * Progressive reveal: show this many bullets at full opacity; remaining rows stay in the DOM
   * with opacity 0 (layout-stable). Omit or set >= bullets.length to show all.
   */
  visibleBulletCount?: number;
  /** Override body `font-size` (rem) for list text. */
  fontSizeRem?: number;
  /** e.g. margin after list when followed by another block */
  className?: string;
};

/**
 * Global bullet treatment: left-aligned in a centered rail; even vertical rhythm between rows.
 */
export function PresentationBulletList({
  bullets,
  phrases,
  lockedVisualRowTarget,
  visibleBulletCount,
  fontSizeRem,
  className = "",
}: PresentationBulletListProps) {
  const padCount =
    lockedVisualRowTarget != null
      ? Math.max(0, lockedVisualRowTarget - bullets.length)
      : 0;
  const revealLimit =
    visibleBulletCount == null
      ? bullets.length
      : Math.min(
          bullets.length,
          Math.max(0, Math.floor(visibleBulletCount)),
        );

  /** Reserve vertical space for the max row count in a continuation group (avoids jumps between slides). */
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
      {bullets.map((b, i) => {
        const revealed = i < revealLimit;
        return (
          <li
            key={`b-${i}-${b}`}
            className={[
              "flex items-start gap-4 sm:gap-[1.125rem]",
              revealed ? "" : "pointer-events-none opacity-0",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden={!revealed}
          >
            <span
              className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rotate-45 bg-launch-gold"
              aria-hidden
            />
            <span className="min-w-0 flex-1 text-left">
              {renderSlideRichText(b, phrases, `bu-${i}-`)}
            </span>
          </li>
        );
      })}
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

type PresentationPromptListProps = {
  prompts: string[];
  phrases?: string[];
  lockedVisualRowTarget?: number;
  visiblePromptCount?: number;
  fontSizeRem?: number;
  className?: string;
};

/**
 * Room / participant questions — same layout contract as bullets (DOM-stable opacity reveal).
 */
export function PresentationPromptList({
  prompts,
  phrases,
  lockedVisualRowTarget,
  visiblePromptCount,
  fontSizeRem,
  className = "",
}: PresentationPromptListProps) {
  const padCount =
    lockedVisualRowTarget != null
      ? Math.max(0, lockedVisualRowTarget - prompts.length)
      : 0;
  const revealLimit =
    visiblePromptCount == null
      ? prompts.length
      : Math.min(
          prompts.length,
          Math.max(0, Math.floor(visiblePromptCount)),
        );

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
      {prompts.map((line, i) => {
        const revealed = i < revealLimit;
        return (
          <li
            key={`p-${i}-${line}`}
            className={[
              "flex items-start gap-4 sm:gap-[1.125rem]",
              revealed ? "" : "pointer-events-none opacity-0",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden={!revealed}
          >
            <span
              className="mt-[0.42em] flex h-[1.15em] w-[1.15em] shrink-0 items-center justify-center rounded-full border border-launch-gold/55 bg-launch-gold/15 text-[0.65em] font-bold text-launch-gold"
              aria-hidden
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 text-left">
              {renderSlideRichText(line, phrases, `pr-${i}-`)}
            </span>
          </li>
        );
      })}
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

type PresentationSlideColumnProps = {
  children: ReactNode;
  className?: string;
};

/** Wraps title, emphasis, scripture, bullets, and supporting blocks in one centered column */
export function PresentationSlideColumn({
  children,
  className = "",
}: PresentationSlideColumnProps) {
  return (
    <div className={`${PRESENTATION_COLUMN_CLASS} ${className}`.trim()}>
      {children}
    </div>
  );
}
