import type { AudienceLaunchSlide } from "@/types/launch";
import { getSlideInteraction, getSlideMomentType } from "@/lib/slideContent";
import { EmphasisText } from "@/components/launch/slide/EmphasisText";
import { highlightKeyPhrases } from "@/components/launch/slide/highlightKeyPhrases";
import {
  PresentationBulletList,
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

type StandardSlideContentProps = {
  slide: AudienceLaunchSlide;
  viewportLocked?: boolean;
  /** Presentation: fixed bullet row count within a continuation group */
  continuationBulletSlotCount?: number;
};

/**
 * Default slide: title, emphasis, scripture, bullets, optional “Together” when not a dedicated moment layout.
 */
export function StandardSlideContent({
  slide,
  viewportLocked = false,
  continuationBulletSlotCount,
}: StandardSlideContentProps) {
  const bullets = slide.bullets.slice(0, MAX_BULLETS);
  const phrases = slide.keyPhrases;
  const interaction = getSlideInteraction(slide);
  const showTogetherBox = Boolean(
    interaction && getSlideMomentType(slide) === "standard",
  );

  if (viewportLocked) {
    const hasEmphasis = Boolean(slide.emphasis?.trim());
    const hasScripture = Boolean(slide.scripture?.trim());
    const hasBullets = bullets.length > 0;

    const hasBelowTitle =
      hasEmphasis || hasScripture || hasBullets || showTogetherBox;
    const hasBelowEmphasis =
      hasScripture || hasBullets || showTogetherBox;
    const hasBelowScripture = hasBullets || showTogetherBox;
    const hasTeamsLowerBody =
      hasScripture || hasBullets || showTogetherBox;

    const continuationLock =
      Boolean(slide.continuationGroup) &&
      continuationBulletSlotCount != null &&
      continuationBulletSlotCount > 0;

    return (
      <div
        className="flex min-h-0 w-full max-w-full flex-1 flex-col items-center justify-center overflow-hidden"
        data-presentation-continuation-lock={continuationLock ? "true" : undefined}
      >
        <PresentationSlideColumn>
          {slide.section && (
            <header className={PRESENTATION_SECTION_HEADER_CLASS}>
              <span className="launch-eyebrow text-launch-soft/95">
                {slide.section}
              </span>
              <span
                className="block h-px w-14 bg-gradient-to-r from-transparent via-launch-gold/55 to-transparent"
                aria-hidden
              />
            </header>
          )}

          <h2 className={presentationTitleClass(hasBelowTitle)}>
            {highlightKeyPhrases(slide.title, phrases)}
          </h2>

          {slide.emphasis && (
            <div className={presentationEmphasisWrapClass(hasBelowEmphasis)}>
              <EmphasisText
                spacious={false}
                className="!my-0 max-w-[40ch] text-balance !text-center sm:max-w-[44ch]"
              >
                {highlightKeyPhrases(slide.emphasis, phrases)}
              </EmphasisText>
            </div>
          )}

          {hasTeamsLowerBody && (
            <div className={PRESENTATION_TEAMS_LOWER_SAFE_CLASS}>
              {slide.scripture && (
                <div
                  className={presentationScriptureWrapClass(hasBelowScripture)}
                >
                  <p className="launch-eyebrow text-launch-muted">Scripture</p>
                  <p className="slide-scripture-body mt-1 font-medium leading-snug text-launch-soft/95">
                    {slide.scripture}
                  </p>
                </div>
              )}

              {hasBullets && (
                <PresentationBulletList
                  bullets={bullets}
                  phrases={phrases}
                  lockedVisualRowTarget={
                    continuationBulletSlotCount != null &&
                    continuationBulletSlotCount > 0
                      ? continuationBulletSlotCount
                      : undefined
                  }
                  className={
                    showTogetherBox
                      ? `min-h-0 shrink-0 ${PRESENTATION_AFTER_BULLETS_MB}`
                      : "min-h-0 shrink-0"
                  }
                />
              )}

              {showTogetherBox && (
                <div className={`${PRESENTATION_TOGETHER_BOX_CLASS} shrink-0`}>
                  <p className="launch-eyebrow text-launch-steel/90">Together</p>
                  <p className="slide-supporting-block-text mt-1.5 font-medium leading-snug text-launch-secondary">
                    {interaction}
                  </p>
                </div>
              )}
            </div>
          )}
        </PresentationSlideColumn>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center text-center">
      {slide.section && (
        <header className="mb-12 flex w-full max-w-3xl flex-col items-center gap-5 md:mb-14">
          <span className="launch-eyebrow text-launch-soft/95">
            {slide.section}
          </span>
          <span
            className="block h-px w-14 bg-gradient-to-r from-transparent via-launch-gold/55 to-transparent"
            aria-hidden
          />
        </header>
      )}

      <h2 className="max-w-[22ch] text-balance text-slide-title font-bold leading-[1.06] tracking-[-0.03em] text-launch-primary md:max-w-[28ch]">
        {highlightKeyPhrases(slide.title, phrases)}
      </h2>

      {slide.emphasis && (
        <EmphasisText className="mt-4 md:mt-6">
          {highlightKeyPhrases(slide.emphasis, phrases)}
        </EmphasisText>
      )}

      {slide.scripture && (
        <div className="mx-auto mt-10 max-w-2xl text-left md:mt-12">
          <p className="launch-eyebrow text-launch-muted">Scripture</p>
          <p className="slide-scripture-body mt-3 font-medium text-launch-soft/95">
            {slide.scripture}
          </p>
        </div>
      )}

      {bullets.length > 0 && (
        <ul
          className={`mx-auto w-full max-w-2xl space-y-8 text-left text-slide-bullet font-medium leading-[1.55] md:space-y-10 ${
            slide.scripture
              ? "mt-10 md:mt-12"
              : slide.emphasis
                ? "mt-6 md:mt-8"
                : slide.section
                  ? "mt-14 md:mt-16"
                  : "mt-16 md:mt-20"
          }`}
        >
          {bullets.map((b) => (
            <li key={b} className="flex gap-5 md:gap-6">
              <span
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-launch-gold"
                aria-hidden
              />
              <span className="text-launch-secondary/95">
                {highlightKeyPhrases(b, phrases)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {showTogetherBox && (
        <div className="mx-auto mt-12 max-w-2xl rounded-lg border border-launch-neutral/35 bg-launch-navy/50 px-6 py-5 text-left md:mt-14 md:px-8 md:py-6">
          <p className="launch-eyebrow text-launch-steel/90">Together</p>
          <p className="slide-supporting-block-text mt-3 font-medium leading-[1.55] text-launch-secondary">
            {interaction}
          </p>
        </div>
      )}
    </div>
  );
}
