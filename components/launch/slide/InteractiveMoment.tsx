"use client";

import { useState } from "react";
import type { AudienceLaunchSlide } from "@/types/launch";
import type { SlideMomentType } from "@/lib/slideContent";
import { getSlideInteraction } from "@/lib/slideContent";
import { EmphasisText } from "@/components/launch/slide/EmphasisText";
import { highlightKeyPhrases } from "@/components/launch/slide/highlightKeyPhrases";
import { fieldClassName } from "@/components/launch/participant/fieldStyles";
import {
  PresentationBulletList,
  PresentationSlideColumn,
  PRESENTATION_INTERACTIVE_AFTER_STACK_MB,
  PRESENTATION_INTERACTIVE_RAIL_WRAPPER_CLASS,
  PRESENTATION_INTERACTIVE_SLOT_CLASS,
  PRESENTATION_MOMENT_LABEL_CLASS,
  PRESENTATION_SECTION_HEADER_CLASS,
  PRESENTATION_TEAMS_LOWER_SAFE_CLASS,
  presentationEmphasisWrapClass,
  presentationTitleClass,
} from "@/components/launch/slide/presentationSlideLayout";

const MAX_BULLETS = 5;

function MomentFrame({
  slide,
  label,
  labelClass = "text-launch-steel/95",
  viewportLocked,
  children,
}: {
  slide: AudienceLaunchSlide;
  label: string;
  labelClass?: string;
  viewportLocked: boolean;
  children: React.ReactNode;
}) {
  const phrases = slide.keyPhrases;
  const bullets = slide.bullets.slice(0, MAX_BULLETS);

  const bulletsAfterEmphasis = slide.emphasis;
  const bulletsMargin = bulletsAfterEmphasis
    ? "mt-6 md:mt-8"
    : slide.section
      ? "mt-12 md:mt-14"
      : "mt-14 md:mt-16";

  if (viewportLocked) {
    const hasEmphasis = Boolean(slide.emphasis?.trim());
    const hasBullets = bullets.length > 0;
    const hasBelowTitle = hasEmphasis || hasBullets || Boolean(children);
    const hasBelowEmphasis = hasBullets || Boolean(children);

    return (
      <div
        className="moment-frame flex min-h-0 w-full max-w-full flex-1 flex-col items-center overflow-hidden"
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

          <p
            className={`launch-eyebrow ${labelClass} ${PRESENTATION_MOMENT_LABEL_CLASS}`}
          >
            {label}
          </p>

          <h2 className={presentationTitleClass(hasBelowTitle)}>
            {highlightKeyPhrases(slide.title, phrases)}
          </h2>

          {slide.emphasis && (
            <div className={presentationEmphasisWrapClass(hasBelowEmphasis)}>
              <EmphasisText
                spacious={false}
                className="moment-slide-emphasis !my-0 max-w-[40ch] text-balance !text-center sm:max-w-[44ch]"
              >
                {highlightKeyPhrases(slide.emphasis, phrases)}
              </EmphasisText>
            </div>
          )}

          <div
            className={`${PRESENTATION_TEAMS_LOWER_SAFE_CLASS} flex min-h-0 w-full flex-1 flex-col`}
          >
            {hasBullets && (
              <PresentationBulletList
                bullets={bullets}
                phrases={phrases}
                className="min-h-0 shrink-0"
              />
            )}

            <div
              className={`moment-children-slot ${PRESENTATION_INTERACTIVE_SLOT_CLASS}${
                hasBullets ? ` ${PRESENTATION_INTERACTIVE_AFTER_STACK_MB}` : ""
              }`}
            >
              <div className={PRESENTATION_INTERACTIVE_RAIL_WRAPPER_CLASS}>
                {children}
              </div>
            </div>
          </div>
        </PresentationSlideColumn>
      </div>
    );
  }

  return (
    <div className="moment-frame flex w-full flex-col items-center text-center">
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

      <p className={`launch-eyebrow ${labelClass} ${slide.section ? "mt-2" : ""}`}>
        {label}
      </p>

      <h2 className="mt-6 max-w-[22ch] text-balance text-slide-title font-bold leading-[1.06] tracking-[-0.03em] text-launch-primary md:mt-8 md:max-w-[28ch]">
        {highlightKeyPhrases(slide.title, phrases)}
      </h2>

      {slide.emphasis && (
        <div className="mt-4 max-w-3xl md:mt-6">
          <EmphasisText
            spacious={false}
            className="moment-slide-emphasis !my-0 !text-center"
          >
            {highlightKeyPhrases(slide.emphasis, phrases)}
          </EmphasisText>
        </div>
      )}

      {bullets.length > 0 && (
        <ul
          className={`moment-bullet-list mx-auto w-full max-w-2xl space-y-8 text-left text-slide-bullet font-medium leading-[1.55] md:space-y-10 ${bulletsMargin} text-launch-secondary/95`}
        >
          {bullets.map((b) => (
            <li key={b} className="flex gap-5 md:gap-6">
              <span
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-launch-gold"
                aria-hidden
              />
              <span>{highlightKeyPhrases(b, phrases)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="moment-children-slot mt-14 w-full max-w-2xl md:mt-20">
        {children}
      </div>
    </div>
  );
}

function DiscussionBody({
  prompt,
  variant = "discussion",
  viewportLocked,
}: {
  prompt: string;
  variant?: "discussion" | "prayer";
  viewportLocked: boolean;
}) {
  const eyebrow = variant === "prayer" ? "Prayer" : "Prompt";
  if (viewportLocked) {
    return (
      <div className="moment-body flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-launch-neutral/30 bg-gradient-to-b from-launch-soft/[0.07] to-transparent px-5 py-3.5 text-left sm:px-6 sm:py-4">
        <p className="launch-eyebrow shrink-0 text-launch-gold/90">{eyebrow}</p>
        <p className="moment-prompt-text mt-2 min-h-0 flex-1 overflow-hidden font-medium leading-snug text-launch-primary sm:mt-2.5">
          {prompt}
        </p>
      </div>
    );
  }
  return (
    <div className="moment-body rounded-xl border border-launch-neutral/30 bg-gradient-to-b from-launch-soft/[0.07] to-transparent px-8 py-9 text-left md:px-10 md:py-10">
      <p className="launch-eyebrow text-launch-gold/90">{eyebrow}</p>
      <p className="moment-prompt-text mt-5 font-medium leading-[1.55] text-launch-primary md:mt-6">
        {prompt}
      </p>
    </div>
  );
}

function PairShareBody({
  prompt,
  viewportLocked,
}: {
  prompt: string;
  viewportLocked: boolean;
}) {
  if (viewportLocked) {
    return (
      <div className="moment-body flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-launch-soft/20 bg-launch-navy/40 px-5 py-3.5 text-left sm:px-6 sm:py-4">
        <div className="moment-pair-row mb-2 flex shrink-0 flex-wrap items-center gap-2 sm:mb-2.5 sm:gap-2.5">
          <span
            className="moment-pair-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-launch-steel/35 text-xs font-bold text-launch-steel/90 sm:h-10 sm:w-10 sm:text-sm"
            aria-hidden
          >
            A
          </span>
          <span className="text-launch-muted">↔</span>
          <span
            className="moment-pair-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-launch-steel/35 text-xs font-bold text-launch-steel/90 sm:h-10 sm:w-10 sm:text-sm"
            aria-hidden
          >
            B
          </span>
          <span className="launch-eyebrow text-launch-soft/90 md:ml-1">
            Two people · one conversation
          </span>
        </div>
        <p className="moment-prompt-text min-h-0 flex-1 overflow-hidden font-medium leading-snug text-launch-primary">
          {prompt}
        </p>
      </div>
    );
  }
  return (
    <div className="moment-body rounded-xl border border-launch-soft/20 bg-launch-navy/40 px-8 py-9 text-left md:px-10 md:py-10">
      <div className="moment-pair-row mb-6 flex flex-wrap items-center gap-3 md:mb-7">
        <span
          className="moment-pair-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-launch-steel/35 text-sm font-bold text-launch-steel/90"
          aria-hidden
        >
          A
        </span>
        <span className="text-launch-muted">↔</span>
        <span
          className="moment-pair-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-launch-steel/35 text-sm font-bold text-launch-steel/90"
          aria-hidden
        >
          B
        </span>
        <span className="launch-eyebrow text-launch-soft/90 md:ml-1">
          Two people · one conversation
        </span>
      </div>
      <p className="moment-prompt-text font-medium leading-[1.55] text-launch-primary">
        {prompt}
      </p>
    </div>
  );
}

function ReflectionBody({
  slide,
  prompt,
  viewportLocked,
}: {
  slide: AudienceLaunchSlide;
  prompt: string;
  viewportLocked: boolean;
}) {
  const [value, setValue] = useState("");

  if (viewportLocked) {
    return (
      <div className="moment-body flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-launch-neutral/35 bg-black/20 px-5 py-3.5 text-left sm:px-6 sm:py-4">
        <p className="launch-eyebrow shrink-0 text-launch-gold/90">Take a moment</p>
        <p className="moment-prompt-text mt-2 shrink-0 font-medium leading-snug text-launch-secondary sm:mt-2.5">
          {prompt}
        </p>
        <label className="mt-2 flex min-h-0 flex-1 flex-col sm:mt-2.5">
          <span className="sr-only">Your reflection</span>
          <textarea
            className={`moment-reflection-input ${fieldClassName} min-h-[4.5rem] w-full flex-1 resize-none overflow-y-auto sm:min-h-[5.5rem]`}
            placeholder="Write here — this stays on your device."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            name={`reflection-${slide.id}`}
          />
        </label>
      </div>
    );
  }

  return (
    <div className="moment-body rounded-xl border border-launch-neutral/35 bg-black/20 px-8 py-9 text-left md:px-10 md:py-10">
      <p className="launch-eyebrow text-launch-gold/90">Take a moment</p>
      <p className="moment-prompt-text mt-4 font-medium leading-[1.55] text-launch-secondary md:mt-5">
        {prompt}
      </p>
      <label className="mt-8 block md:mt-9">
        <span className="sr-only">Your reflection</span>
        <textarea
          className={`moment-reflection-input ${fieldClassName} min-h-[168px] w-full resize-y md:min-h-[200px]`}
          placeholder="Write here — this stays on your device."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={6}
          name={`reflection-${slide.id}`}
        />
      </label>
    </div>
  );
}

type InteractiveMomentProps = {
  moment: Exclude<SlideMomentType, "standard">;
  slide: AudienceLaunchSlide;
  viewportLocked?: boolean;
};

export function InteractiveMoment({
  moment,
  slide,
  viewportLocked = false,
}: InteractiveMomentProps) {
  const prompt = getSlideInteraction(slide);
  if (!prompt) {
    return null;
  }

  if (moment === "discussion") {
    const isPrayer = slide.interactionType === "prayer";
    return (
      <MomentFrame
        slide={slide}
        label={isPrayer ? "Prayer" : "Discussion"}
        viewportLocked={viewportLocked}
      >
        <DiscussionBody
          prompt={prompt}
          variant={isPrayer ? "prayer" : "discussion"}
          viewportLocked={viewportLocked}
        />
      </MomentFrame>
    );
  }

  if (moment === "pairShare") {
    return (
      <MomentFrame slide={slide} label="Pair share" viewportLocked={viewportLocked}>
        <PairShareBody prompt={prompt} viewportLocked={viewportLocked} />
      </MomentFrame>
    );
  }

  return (
    <MomentFrame slide={slide} label="Reflection" viewportLocked={viewportLocked}>
      <ReflectionBody
        slide={slide}
        prompt={prompt}
        viewportLocked={viewportLocked}
      />
    </MomentFrame>
  );
}
