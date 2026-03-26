import type { AudienceLaunchSlide } from "@/types/launch";
import {
  hasCustomDeckPlacement,
  mergeDeckPlacement,
} from "@/lib/deckPlacement";
import {
  getSlideInteraction,
  getSlideInteractionLines,
  getSlideMomentType,
  getSlidePromptLines,
  momentParticipantPromptVisible,
  promptsFullyRevealed,
} from "@/lib/slideContent";
import { EmphasisText } from "@/components/launch/slide/EmphasisText";
import { SlideDeckTableHtml } from "@/components/launch/slide/SlideDeckTableHtml";
import { renderSlideRichText } from "@/components/launch/slide/highlightKeyPhrases";
import { presentationFontSizeStyle } from "@/lib/presentationFontSizes";
import {
  PresentationBulletList,
  PresentationPromptList,
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
const MAX_INTERACTION_LINES = 8;

type StandardSlideContentProps = {
  slide: AudienceLaunchSlide;
  viewportLocked?: boolean;
  /** Presentation: fixed bullet row count within a continuation group */
  continuationBulletSlotCount?: number;
  continuationPromptSlotCount?: number;
  continuationInteractionSlotCount?: number;
  /** Admin deck preview: allow tall content to extend for outer scroll. */
  presentationScrollable?: boolean;
};

/**
 * Default slide: title, emphasis, scripture, bullets, prompts, optional “Together” when not a dedicated moment layout.
 */
export function StandardSlideContent({
  slide,
  viewportLocked = false,
  continuationBulletSlotCount,
  continuationPromptSlotCount,
  continuationInteractionSlotCount,
  presentationScrollable = false,
}: StandardSlideContentProps) {
  const bullets = slide.bullets.slice(0, MAX_BULLETS);
  const promptLines = getSlidePromptLines(slide).slice(0, MAX_PROMPTS);
  const interactionLines = getSlideInteractionLines(slide).slice(
    0,
    MAX_INTERACTION_LINES,
  );
  /** Always mount the list when bullets exist so layout stays fixed (opacity hides unrevealed rows). */
  const hasBulletList = bullets.length > 0;
  const hasPromptList = promptLines.length > 0;
  const revealLimitTrainer =
    typeof slide.bulletRevealVisibleCount === "number"
      ? Math.min(
          bullets.length,
          Math.max(0, Math.floor(slide.bulletRevealVisibleCount)),
        )
      : bullets.length;
  const revealPromptTrainer =
    typeof slide.promptRevealVisibleCount === "number"
      ? Math.min(
          promptLines.length,
          Math.max(0, Math.floor(slide.promptRevealVisibleCount)),
        )
      : promptLines.length;
  const phrases = slide.keyPhrases;
  const pfs = slide.presentationFontSizes;
  const interaction = getSlideInteraction(slide);
  const togetherBodyLines =
    interactionLines.length > 0
      ? interactionLines
      : interaction
        ? [interaction]
        : [];
  const revealInteractionTrainer =
    typeof slide.interactionRevealVisibleCount === "number"
      ? Math.min(
          togetherBodyLines.length,
          Math.max(0, Math.floor(slide.interactionRevealVisibleCount)),
        )
      : togetherBodyLines.length;
  const showTogetherBox = Boolean(
    interaction && getSlideMomentType(slide) === "standard",
  );
  const promptsDone = promptsFullyRevealed(slide);
  const togetherParticipantVisible = momentParticipantPromptVisible(slide);
  const hasSlideTable = Boolean(slide.slideTableHtml?.trim());

  if (viewportLocked) {
    const hasEmphasis = Boolean(slide.emphasis?.trim());
    const hasScripture = Boolean(slide.scripture?.trim());

    const hasBelowTitle =
      typeof slide.stackStableBelowTitle === "boolean"
        ? slide.stackStableBelowTitle
        : hasEmphasis ||
          hasSlideTable ||
          hasScripture ||
          hasBulletList ||
          hasPromptList ||
          showTogetherBox;
    const hasBelowEmphasis =
      typeof slide.stackStableBelowEmphasis === "boolean"
        ? slide.stackStableBelowEmphasis
        : hasSlideTable ||
          hasScripture ||
          hasBulletList ||
          hasPromptList ||
          showTogetherBox;
    const hasBelowScripture =
      typeof slide.stackStableBelowScripture === "boolean"
        ? slide.stackStableBelowScripture
        : hasBulletList || hasPromptList || showTogetherBox;
    const hasContentBelowSlideTable =
      typeof slide.stackStableBelowSlideTable === "boolean"
        ? slide.stackStableBelowSlideTable
        : hasScripture ||
          hasBulletList ||
          hasPromptList ||
          showTogetherBox;
    const hasTeamsLowerBody =
      hasSlideTable ||
      hasScripture ||
      hasBulletList ||
      hasPromptList ||
      showTogetherBox;

    const continuationLock =
      Boolean(slide.continuationGroup) &&
      ((continuationBulletSlotCount ?? 0) > 0 ||
        (continuationPromptSlotCount ?? 0) > 0 ||
        (continuationInteractionSlotCount ?? 0) > 0);

    const deckCustom = hasCustomDeckPlacement(slide);
    const listRailFree = deckCustom ? "!mx-0 !max-w-none" : "";

    const mkLowerBody = () =>
      hasTeamsLowerBody ? (
        <div className={PRESENTATION_TEAMS_LOWER_SAFE_CLASS}>
          {hasSlideTable && slide.slideTableHtml ? (
            <SlideDeckTableHtml
              html={slide.slideTableHtml}
              scriptureRem={pfs?.scriptureRem}
              hasContentBelow={hasContentBelowSlideTable}
            />
          ) : null}
          {slide.scripture && (
            <div className={presentationScriptureWrapClass(hasBelowScripture)}>
              <p
                className="slide-scripture-body font-medium leading-snug text-launch-soft/95"
                style={presentationFontSizeStyle(pfs?.scriptureRem)}
              >
                {renderSlideRichText(slide.scripture, phrases, "sc-")}
              </p>
            </div>
          )}

          {hasBulletList && (
            <PresentationBulletList
              bullets={bullets}
              phrases={phrases}
              fontSizeRem={pfs?.bulletsRem}
              lockedVisualRowTarget={
                continuationBulletSlotCount != null &&
                continuationBulletSlotCount > 0
                  ? continuationBulletSlotCount
                  : undefined
              }
              visibleBulletCount={
                slide.bulletRevealVisibleCount ?? bullets.length
              }
              className={[
                "min-h-0 shrink-0",
                listRailFree,
                hasPromptList || showTogetherBox
                  ? PRESENTATION_AFTER_BULLETS_MB
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          )}

          {hasPromptList && (
            <PresentationPromptList
              prompts={promptLines}
              phrases={phrases}
              fontSizeRem={pfs?.promptsRem}
              lockedVisualRowTarget={
                continuationPromptSlotCount != null &&
                continuationPromptSlotCount > 0
                  ? continuationPromptSlotCount
                  : undefined
              }
              visiblePromptCount={
                slide.promptRevealVisibleCount ?? promptLines.length
              }
              className={[
                "min-h-0 shrink-0",
                listRailFree,
                showTogetherBox ? PRESENTATION_AFTER_BULLETS_MB : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          )}

          {showTogetherBox && (
            <div
              className={`${PRESENTATION_TOGETHER_BOX_CLASS} shrink-0 ${listRailFree} ${
                !togetherParticipantVisible
                  ? "pointer-events-none opacity-0 [contain:layout]"
                  : ""
              }`.trim()}
              aria-hidden={!togetherParticipantVisible}
            >
              <p className="launch-eyebrow text-launch-steel/90">Together</p>
              <PresentationPromptList
                prompts={togetherBodyLines}
                phrases={phrases}
                lineKeyPrefix="it-"
                fontSizeRem={pfs?.interactionRem}
                lockedVisualRowTarget={
                  continuationInteractionSlotCount != null &&
                  continuationInteractionSlotCount > 0
                    ? continuationInteractionSlotCount
                    : undefined
                }
                visiblePromptCount={
                  slide.interactionRevealVisibleCount ??
                  togetherBodyLines.length
                }
                className="slide-supporting-block-text mt-1.5 text-launch-secondary [&_li]:font-medium [&_li]:leading-snug"
              />
            </div>
          )}
        </div>
      ) : null;

    const lowerBody = mkLowerBody();

    const clipClass = presentationScrollable
      ? "min-h-min max-h-full shrink-0 overflow-y-auto overflow-x-visible"
      : "min-h-0 max-h-full shrink-0 overflow-y-auto overflow-x-hidden";

    if (hasCustomDeckPlacement(slide)) {
      const pos = mergeDeckPlacement(slide.deckPlacement);
      return (
        <div
          className={`flex w-full max-w-full flex-col items-center justify-start ${clipClass}`}
          data-presentation-continuation-lock={
            continuationLock ? "true" : undefined
          }
        >
          <PresentationSlideColumn>
            {slide.section && (
              <header className={PRESENTATION_SECTION_HEADER_CLASS}>
                <span
                  className="launch-eyebrow text-launch-soft/95"
                  style={presentationFontSizeStyle(pfs?.sectionRem)}
                >
                  {slide.section}
                </span>
                <span
                  className="block h-px w-14 bg-gradient-to-r from-transparent via-launch-gold/55 to-transparent"
                  aria-hidden
                />
              </header>
            )}

            <div className="relative mt-1 min-h-0 w-full shrink-0 overflow-visible">
              <h2
                className={`${presentationTitleClass(false)} pointer-events-none`}
                style={{
                  position: "absolute",
                  left: `${pos.title.xPct}%`,
                  top: `${pos.title.yPct}%`,
                  transform: "translate(-50%, -50%)",
                  width: "min(92%, 42rem)",
                  ...presentationFontSizeStyle(pfs?.titleRem),
                }}
              >
                {renderSlideRichText(slide.title, phrases, "t-")}
              </h2>

              {slide.emphasis && (
                <div
                  className={`${presentationEmphasisWrapClass(false)} pointer-events-none`}
                  style={{
                    position: "absolute",
                    left: `${pos.emphasis.xPct}%`,
                    top: `${pos.emphasis.yPct}%`,
                    transform: "translate(-50%, -50%)",
                    width: "min(92%, 40rem)",
                  }}
                >
                  <EmphasisText
                    spacious={false}
                    disableMotionEntrance={viewportLocked}
                    style={presentationFontSizeStyle(pfs?.emphasisRem)}
                    className="!my-0 max-w-[40ch] text-balance !text-center sm:max-w-[44ch]"
                  >
                    {renderSlideRichText(slide.emphasis, phrases, "e-")}
                  </EmphasisText>
                </div>
              )}

              {lowerBody && (
                <div
                  className="pointer-events-none"
                  style={{
                    position: "absolute",
                    left: `${pos.bullets.xPct}%`,
                    top: `${pos.bullets.yPct}%`,
                    transform: "translate(-50%, 0)",
                    width: `${pos.bullets.widthPct}%`,
                  }}
                >
                  {lowerBody}
                </div>
              )}
            </div>
          </PresentationSlideColumn>
        </div>
      );
    }

    return (
      <div
        className={`flex w-full max-w-full flex-col items-center justify-start ${clipClass}`}
        data-presentation-continuation-lock={continuationLock ? "true" : undefined}
      >
        <PresentationSlideColumn>
          {slide.section && (
            <header className={PRESENTATION_SECTION_HEADER_CLASS}>
              <span
                className="launch-eyebrow text-launch-soft/95"
                style={presentationFontSizeStyle(pfs?.sectionRem)}
              >
                {slide.section}
              </span>
              <span
                className="block h-px w-14 bg-gradient-to-r from-transparent via-launch-gold/55 to-transparent"
                aria-hidden
              />
            </header>
          )}

          <h2
            className={presentationTitleClass(hasBelowTitle)}
            style={presentationFontSizeStyle(pfs?.titleRem)}
          >
            {renderSlideRichText(slide.title, phrases, "t-")}
          </h2>

          {slide.emphasis && (
            <div className={presentationEmphasisWrapClass(hasBelowEmphasis)}>
              <EmphasisText
                spacious={false}
                disableMotionEntrance={viewportLocked}
                style={presentationFontSizeStyle(pfs?.emphasisRem)}
                className="!my-0 max-w-[40ch] text-balance !text-center sm:max-w-[44ch]"
              >
                {renderSlideRichText(slide.emphasis, phrases, "e-")}
              </EmphasisText>
            </div>
          )}

          {lowerBody}
        </PresentationSlideColumn>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center text-center">
      {slide.section && (
        <header className="mb-12 flex w-full max-w-3xl flex-col items-center gap-5 md:mb-14">
          <span
            className="launch-eyebrow text-launch-soft/95"
            style={presentationFontSizeStyle(pfs?.sectionRem)}
          >
            {slide.section}
          </span>
          <span
            className="block h-px w-14 bg-gradient-to-r from-transparent via-launch-gold/55 to-transparent"
            aria-hidden
          />
        </header>
      )}

      <h2
        className="max-w-[22ch] text-balance text-slide-title font-bold leading-[1.06] tracking-[-0.03em] text-launch-primary md:max-w-[28ch]"
        style={presentationFontSizeStyle(pfs?.titleRem)}
      >
        {renderSlideRichText(slide.title, phrases, "t-")}
      </h2>

      {slide.emphasis && (
        <EmphasisText
          className="mt-4 md:mt-6"
          style={presentationFontSizeStyle(pfs?.emphasisRem)}
        >
          {renderSlideRichText(slide.emphasis, phrases, "e-")}
        </EmphasisText>
      )}

      {hasSlideTable && slide.slideTableHtml ? (
        <div className="mx-auto mt-10 w-full max-w-2xl md:mt-12">
          <SlideDeckTableHtml
            html={slide.slideTableHtml}
            scriptureRem={pfs?.scriptureRem}
            hasContentBelow={Boolean(
              slide.scripture?.trim() ||
                hasBulletList ||
                hasPromptList ||
                showTogetherBox,
            )}
          />
        </div>
      ) : null}

      {slide.scripture && (
        <div className="mx-auto mt-10 max-w-2xl text-left md:mt-12">
          <p
            className="slide-scripture-body font-medium text-launch-soft/95"
            style={presentationFontSizeStyle(pfs?.scriptureRem)}
          >
            {renderSlideRichText(slide.scripture, phrases, "sc-")}
          </p>
        </div>
      )}

      {hasBulletList && (
        <ul
          style={presentationFontSizeStyle(pfs?.bulletsRem)}
          className={`mx-auto w-full max-w-2xl space-y-8 text-left text-slide-bullet font-medium leading-[1.55] md:space-y-10 ${
            slide.scripture || hasSlideTable
              ? "mt-10 md:mt-12"
              : slide.emphasis
                ? "mt-6 md:mt-8"
                : slide.section
                  ? "mt-14 md:mt-16"
                  : "mt-16 md:mt-20"
          }`}
        >
          {bullets.map((b, i) => {
            const revealed = i < revealLimitTrainer;
            return (
              <li
                key={b}
                className={[
                  "flex gap-5 md:gap-6",
                  revealed ? "" : "pointer-events-none opacity-0",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden={!revealed}
              >
                <span
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-launch-gold"
                  aria-hidden
                />
                <span className="text-launch-secondary/95">
                  {renderSlideRichText(b, phrases, `bl-${i}-`)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {hasPromptList && (
        <ul
          style={presentationFontSizeStyle(pfs?.promptsRem)}
          className={`mx-auto w-full max-w-2xl space-y-6 text-left text-slide-bullet font-medium leading-[1.55] md:space-y-8 ${
            hasBulletList
              ? "mt-10 md:mt-12"
              : slide.scripture || hasSlideTable
                ? "mt-10 md:mt-12"
                : slide.emphasis
                  ? "mt-6 md:mt-8"
                  : slide.section
                    ? "mt-14 md:mt-16"
                    : "mt-16 md:mt-20"
          }`}
        >
          {promptLines.map((line, i) => {
            const revealed = i < revealPromptTrainer;
            return (
              <li
                key={`${i}-${line}`}
                className={[
                  "flex gap-4 md:gap-5",
                  revealed ? "" : "pointer-events-none opacity-0",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden={!revealed}
              >
                <span
                  className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-launch-gold/50 text-xs font-bold text-launch-gold"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className="text-launch-secondary/95">
                  {renderSlideRichText(line, phrases, `pl-${i}-`)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {showTogetherBox && (
        <div
          className={`mx-auto mt-12 max-w-2xl rounded-lg border border-launch-neutral/35 bg-launch-navy/50 px-6 py-5 text-left md:mt-14 md:px-8 md:py-6 ${
            !togetherParticipantVisible ? "pointer-events-none opacity-0" : ""
          }`.trim()}
          aria-hidden={!togetherParticipantVisible}
        >
          <p className="launch-eyebrow text-launch-steel/90">Together</p>
          <ul
            style={presentationFontSizeStyle(pfs?.interactionRem)}
            className="slide-supporting-block-text mt-3 space-y-5 text-left font-medium leading-[1.55] text-launch-secondary md:space-y-6"
          >
            {togetherBodyLines.map((line, i) => {
              const revealed = i < revealInteractionTrainer;
              return (
                <li
                  key={`${i}-${line}`}
                  className={[
                    "flex gap-4 md:gap-5",
                    revealed ? "" : "pointer-events-none opacity-0",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden={!revealed}
                >
                  <span
                    className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-launch-gold/50 text-xs font-bold text-launch-gold"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    {renderSlideRichText(line, phrases, `it-${i}-`)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
