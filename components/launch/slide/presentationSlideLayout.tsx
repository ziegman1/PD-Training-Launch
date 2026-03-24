import type { ReactNode } from "react";
import { highlightKeyPhrases } from "@/components/launch/slide/highlightKeyPhrases";

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
 * Presentation Mode: centered ~900px column — use in `PresentationView`.
 * Horizontal padding matches slide content inset; locked `SlideContainer` uses `px-0`.
 */
export const PRESENTATION_GRID_WRAPPER_CLASS =
  "mx-auto flex min-h-0 w-full max-w-[900px] flex-1 flex-col px-4 sm:px-5 md:px-6";

/**
 * Fills the grid below padding: relative positioning context for the brand overlay + slide stack.
 */
export const PRESENTATION_STAGE_CLASS =
  "relative flex min-h-0 w-full flex-1 flex-col overflow-hidden";

/**
 * Lower stack wrapper (scripture / bullets / together): full column width; horizontal inset
 * comes from the shared centered rail (`PRESENTATION_RAIL_MAX_CLASS`), not asymmetric padding.
 */
export const PRESENTATION_TEAMS_LOWER_SAFE_CLASS = "w-full shrink-0";

/** Slide body stack inside the grid — full width of the 900px parent (no duplicate max-width / pad). */
export const PRESENTATION_COLUMN_CLASS =
  "flex w-full min-h-0 flex-col items-center";

/**
 * Bullet + scripture + together rail — max ~620px (min ~520px on short viewports), centered.
 * Keeps lower copy from reaching the bottom-right presenter overlay without shifting the column.
 */
export const PRESENTATION_RAIL_MAX_CLASS =
  "max-w-[min(38.75rem,100%)] [@media(max-height:720px)]:max-w-[min(32.5rem,100%)]";

export const PRESENTATION_SECTION_HEADER_CLASS =
  "mb-2.5 flex w-full flex-col items-center gap-2 text-center sm:mb-3";

/** Moment label (Discussion / Reflection / …) above title */
export const PRESENTATION_MOMENT_LABEL_CLASS =
  "mb-2.5 shrink-0 text-center sm:mb-3";

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
    hasContentBelow ? "mb-[clamp(2.1rem,3.75vh,3.15rem)]" : "",
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
    hasContentBelow ? "mb-[clamp(1.6rem,3vh,2.45rem)]" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Space after bullet list when a together box follows */
export const PRESENTATION_AFTER_BULLETS_MB = "mb-[clamp(1.1rem,2.15vh,1.65rem)]";

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
  "mt-[clamp(1rem,2.35vh,1.5rem)]";

type PresentationBulletListProps = {
  bullets: string[];
  phrases?: string[];
  /**
   * Presentation continuation lock: pad with invisible rows so list height matches the
   * tallest slide in the `continuationGroup` (only bullet text changes between advances).
   */
  lockedVisualRowTarget?: number;
  /** e.g. margin after list when followed by another block */
  className?: string;
};

/**
 * Global bullet treatment: left-aligned in a centered rail; optional visual break after 2nd item when ≥4 bullets.
 */
export function PresentationBulletList({
  bullets,
  phrases,
  lockedVisualRowTarget,
  className = "",
}: PresentationBulletListProps) {
  const grouped = bullets.length >= 4;
  const padCount =
    lockedVisualRowTarget != null
      ? Math.max(0, lockedVisualRowTarget - bullets.length)
      : 0;

  return (
    <ul
      role="list"
      className={[
        "slide-viewport-bullet-list text-slide-bullet w-full list-none text-left font-medium leading-snug text-launch-secondary/95",
        PRESENTATION_RAIL_MAX_CLASS,
        "mx-auto pl-1 sm:pl-1.5",
        "space-y-2.5 sm:space-y-3",
        grouped
          ? [
              /* Clearer break between first pair (“not”) and rest (“is”) */
              "[&>li:nth-child(2)]:mb-6 sm:[&>li:nth-child(2)]:mb-7 md:[&>li:nth-child(2)]:mb-8",
              /* First group slightly quieter so the shift reads conceptually */
              "[&>li:nth-child(-n+2)>span:last-child]:opacity-[0.88]",
              "[&>li:nth-child(-n+2)>span:first-of-type]:opacity-75",
            ].join(" ")
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {bullets.map((b, i) => (
        <li key={`b-${i}-${b}`} className="flex items-start gap-4 sm:gap-[1.125rem]">
          <span
            className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rotate-45 bg-launch-gold"
            aria-hidden
          />
          <span className="min-w-0 flex-1 text-left">
            {highlightKeyPhrases(b, phrases)}
          </span>
        </li>
      ))}
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
