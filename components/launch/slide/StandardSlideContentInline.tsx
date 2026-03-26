"use client";

import type { AudienceLaunchSlide } from "@/types/launch";
import { presentationFontSizeStyle } from "@/lib/presentationFontSizes";
import {
  hasCustomDeckPlacement,
  mergeDeckPlacement,
  type ResolvedDeckPlacement,
} from "@/lib/deckPlacement";
import {
  getSlideInteraction,
  getSlideMomentType,
  getSlidePromptLines,
} from "@/lib/slideContent";
import {
  EditablePresentationBulletList,
  EditablePresentationPromptList,
  InlineEditable,
  ScriptureRichEditor,
} from "@/components/launch/slide/presentationInlineEdit";
import { SlideDeckTableHtml } from "@/components/launch/slide/SlideDeckTableHtml";
import {
  PresentationSlideColumn,
  PRESENTATION_AFTER_BULLETS_MB,
  PRESENTATION_SECTION_HEADER_CLASS,
  PRESENTATION_TEAMS_LOWER_SAFE_CLASS,
  PRESENTATION_TOGETHER_BOX_CLASS,
  presentationEmphasisWrapClass,
  presentationScriptureWrapClass,
  presentationTitleClass,
} from "@/components/launch/slide/presentationSlideLayout";

const MAX_BULLETS = 5;
const MAX_PROMPTS = 8;

const EMPHASIS_INLINE_CLASS =
  "launch-emphasis-text mx-auto w-full max-w-3xl text-balance text-center text-[clamp(1.15rem,1.9vw+0.65rem,1.75rem)] font-semibold leading-snug tracking-[-0.02em] text-launch-gold md:text-[clamp(1.25rem,2.1vw+0.45rem,1.95rem)] md:leading-snug !my-0 max-w-[40ch] sm:max-w-[44ch]";

type Props = {
  slide: AudienceLaunchSlide;
  continuationBulletSlotCount?: number;
  continuationPromptSlotCount?: number;
  continuationInteractionSlotCount?: number;
  deckPlacementLive?: ResolvedDeckPlacement;
  presentationScrollable?: boolean;
  onPatch: (patch: Record<string, unknown>) => void;
};

/**
 * Same presentation layout as `StandardSlideContent` (viewport locked), with
 * `contentEditable` regions so admins can edit copy on the real slide chrome.
 */
export function StandardSlideContentInline({
  slide,
  continuationBulletSlotCount,
  continuationPromptSlotCount,
  continuationInteractionSlotCount,
  deckPlacementLive,
  presentationScrollable = false,
  onPatch,
}: Props) {
  const bullets = slide.bullets.slice(0, MAX_BULLETS);
  const promptLines = getSlidePromptLines(slide).slice(0, MAX_PROMPTS);
  const hasBulletList = bullets.length > 0;
  const hasPromptList = promptLines.length > 0;
  const interaction = getSlideInteraction(slide) ?? "";
  const hasSlideTable = Boolean(slide.slideTableHtml?.trim());
  const showTogetherBox =
    Boolean(interaction.trim()) && getSlideMomentType(slide) === "standard";

  const hasBelowTitleDyn =
    Boolean(slide.emphasis?.trim()) ||
    hasSlideTable ||
    Boolean(slide.scripture?.trim()) ||
    hasBulletList ||
    hasPromptList ||
    showTogetherBox;
  const hasBelowEmphasisDyn =
    hasSlideTable ||
    Boolean(slide.scripture?.trim()) ||
    hasBulletList ||
    hasPromptList ||
    showTogetherBox;
  const hasBelowScriptureDyn =
    hasBulletList || hasPromptList || showTogetherBox;
  const hasContentBelowSlideTableDyn =
    Boolean(slide.scripture?.trim()) ||
    hasBulletList ||
    hasPromptList ||
    showTogetherBox;

  const hasBelowTitle =
    typeof slide.stackStableBelowTitle === "boolean"
      ? slide.stackStableBelowTitle
      : hasBelowTitleDyn;
  const hasBelowEmphasis =
    typeof slide.stackStableBelowEmphasis === "boolean"
      ? slide.stackStableBelowEmphasis
      : hasBelowEmphasisDyn;
  const hasBelowScripture =
    typeof slide.stackStableBelowScripture === "boolean"
      ? slide.stackStableBelowScripture
      : hasBelowScriptureDyn;
  const hasContentBelowSlideTable =
    typeof slide.stackStableBelowSlideTable === "boolean"
      ? slide.stackStableBelowSlideTable
      : hasContentBelowSlideTableDyn;

  const continuationLock =
    Boolean(slide.continuationGroup) &&
    ((continuationBulletSlotCount ?? 0) > 0 ||
      (continuationPromptSlotCount ?? 0) > 0 ||
      (continuationInteractionSlotCount ?? 0) > 0);

  const deckCustom = hasCustomDeckPlacement(slide);
  const listRailFree = deckCustom ? "!mx-0 !max-w-none" : "";
  const fs = slide.presentationFontSizes;

  const lowerInner = (
    <>
      {hasSlideTable && slide.slideTableHtml ? (
        <SlideDeckTableHtml
          html={slide.slideTableHtml}
          scriptureRem={fs?.scriptureRem}
          hasContentBelow={hasContentBelowSlideTable}
        />
      ) : null}
      <div className={presentationScriptureWrapClass(hasBelowScripture)}>
        <ScriptureRichEditor
          value={slide.scripture ?? ""}
          keyPhrases={slide.keyPhrases}
          fontSizeRem={fs?.scriptureRem}
          className="slide-scripture-body min-h-[1.25em] font-medium leading-snug text-launch-soft/95"
          onCommit={(v) =>
            onPatch({ scripture: v.trim().length ? v : undefined })
          }
        />
      </div>

      <EditablePresentationBulletList
        bullets={hasBulletList ? bullets : []}
        keyPhrases={slide.keyPhrases}
        fontSizeRem={fs?.bulletsRem}
        lockedVisualRowTarget={
          continuationBulletSlotCount != null &&
          continuationBulletSlotCount > 0
            ? continuationBulletSlotCount
            : undefined
        }
        onChange={(next) => {
          const all = slide.bullets.map(String);
          const tail =
            all.length > MAX_BULLETS ? all.slice(MAX_BULLETS) : [];
          onPatch({ bullets: [...next, ...tail] });
        }}
        className={[
          "min-h-0 shrink-0",
          listRailFree,
          hasPromptList || interaction.trim()
            ? PRESENTATION_AFTER_BULLETS_MB
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />

      <EditablePresentationPromptList
        prompts={hasPromptList ? promptLines : []}
        fontSizeRem={fs?.promptsRem}
        lockedVisualRowTarget={
          continuationPromptSlotCount != null &&
          continuationPromptSlotCount > 0
            ? continuationPromptSlotCount
            : undefined
        }
        onChange={(next) => {
          const all = getSlidePromptLines(slide);
          const tail =
            all.length > MAX_PROMPTS ? all.slice(MAX_PROMPTS) : [];
          const merged = [...next, ...tail];
          onPatch({ prompts: merged.length ? merged : undefined });
        }}
        className={[
          "min-h-0 shrink-0",
          listRailFree,
          interaction.trim() ? PRESENTATION_AFTER_BULLETS_MB : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />

      <div
        className={`${PRESENTATION_TOGETHER_BOX_CLASS} shrink-0 ${listRailFree}`.trim()}
      >
        <p className="launch-eyebrow text-launch-steel/90">Together</p>
        <InlineEditable
          as="p"
          className="slide-supporting-block-text mt-1.5 min-h-[1.25em] font-medium leading-snug text-launch-secondary"
          style={presentationFontSizeStyle(fs?.interactionRem)}
          value={interaction}
          onCommit={(v) =>
            onPatch({ interaction: v.length ? v : undefined })
          }
        />
      </div>
    </>
  );

  const lowerBody = (
    <div className={PRESENTATION_TEAMS_LOWER_SAFE_CLASS}>{lowerInner}</div>
  );

  const clipClass = presentationScrollable
    ? "min-h-min max-h-full shrink-0 overflow-y-auto overflow-x-visible"
    : "min-h-0 max-h-full shrink-0 overflow-y-auto overflow-x-hidden";

  if (deckCustom) {
    const pos =
      deckPlacementLive ?? mergeDeckPlacement(slide.deckPlacement);
    return (
      <div
        className={`flex w-full max-w-full flex-col items-center justify-start ${clipClass}`}
        data-presentation-continuation-lock={
          continuationLock ? "true" : undefined
        }
      >
        <PresentationSlideColumn>
          <header className={PRESENTATION_SECTION_HEADER_CLASS}>
            <InlineEditable
              as="span"
              className="launch-eyebrow text-launch-soft/95"
              style={presentationFontSizeStyle(fs?.sectionRem)}
              value={slide.section ?? ""}
              onCommit={(v) => onPatch({ section: v.length ? v : undefined })}
            />
            <span
              className="block h-px w-14 bg-gradient-to-r from-transparent via-launch-gold/55 to-transparent"
              aria-hidden
            />
          </header>

          <div className="relative mt-1 min-h-0 w-full shrink-0 overflow-visible">
            <InlineEditable
              as="h2"
              style={{
                position: "absolute",
                left: `${pos.title.xPct}%`,
                top: `${pos.title.yPct}%`,
                transform: "translate(-50%, -50%)",
                width: "min(92%, 42rem)",
                ...presentationFontSizeStyle(fs?.titleRem),
              }}
              className={`${presentationTitleClass(false)} z-[5]`}
              value={slide.title}
              onCommit={(v) => onPatch({ title: v })}
            />

            <div
              className={`${presentationEmphasisWrapClass(false)} absolute z-[5]`}
              style={{
                left: `${pos.emphasis.xPct}%`,
                top: `${pos.emphasis.yPct}%`,
                transform: "translate(-50%, -50%)",
                width: "min(92%, 40rem)",
              }}
            >
              <InlineEditable
                as="p"
                className={EMPHASIS_INLINE_CLASS}
                style={presentationFontSizeStyle(fs?.emphasisRem)}
                value={slide.emphasis ?? ""}
                onCommit={(v) =>
                  onPatch({ emphasis: v.length ? v : undefined })
                }
              />
            </div>

            <div
              className={`absolute z-[5] ${
                presentationScrollable
                  ? "max-h-none overflow-visible pb-4"
                  : "max-h-[min(38vh,280px)] overflow-y-auto"
              }`}
              style={{
                left: `${pos.bullets.xPct}%`,
                top: `${pos.bullets.yPct}%`,
                transform: "translate(-50%, 0)",
                width: `${pos.bullets.widthPct}%`,
              }}
            >
              {lowerBody}
            </div>
          </div>
        </PresentationSlideColumn>
      </div>
    );
  }

  return (
    <div
      className={`flex w-full max-w-full flex-col items-center justify-start ${clipClass}`}
      data-presentation-continuation-lock={
        continuationLock ? "true" : undefined
      }
    >
      <PresentationSlideColumn>
        <header className={PRESENTATION_SECTION_HEADER_CLASS}>
          <InlineEditable
            as="span"
            className="launch-eyebrow text-launch-soft/95"
            style={presentationFontSizeStyle(fs?.sectionRem)}
            value={slide.section ?? ""}
            onCommit={(v) => onPatch({ section: v.length ? v : undefined })}
          />
          <span
            className="block h-px w-14 bg-gradient-to-r from-transparent via-launch-gold/55 to-transparent"
            aria-hidden
          />
        </header>

        <InlineEditable
          as="h2"
          className={presentationTitleClass(hasBelowTitle)}
          style={presentationFontSizeStyle(fs?.titleRem)}
          value={slide.title}
          onCommit={(v) => onPatch({ title: v })}
        />

        <div className={presentationEmphasisWrapClass(hasBelowEmphasis)}>
          <InlineEditable
            as="p"
            className={EMPHASIS_INLINE_CLASS}
            style={presentationFontSizeStyle(fs?.emphasisRem)}
            value={slide.emphasis ?? ""}
            onCommit={(v) =>
              onPatch({ emphasis: v.length ? v : undefined })
            }
          />
        </div>

        {lowerBody}
      </PresentationSlideColumn>
    </div>
  );
}
