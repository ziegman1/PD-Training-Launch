"use client";

import { useMemo } from "react";
import type { AudienceLaunchSlide } from "@/types/launch";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import {
  getContinuationMaxBulletCount,
  getContinuationMaxPromptCount,
} from "@/lib/continuationLayout";
import type { ResolvedDeckPlacement } from "@/lib/deckPlacement";
import { getSlideMomentType } from "@/lib/slideContent";
import { InteractiveMoment } from "@/components/launch/slide/InteractiveMoment";
import { StandardSlideContent } from "@/components/launch/slide/StandardSlideContent";
import { StandardSlideContentInline } from "@/components/launch/slide/StandardSlideContentInline";

type SlideContentProps = {
  slide: AudienceLaunchSlide;
  /** Presentation Mode: fit slide to viewport without page scroll */
  viewportLocked?: boolean;
  presentationInlineEdit?: {
    onPatch: (patch: Record<string, unknown>) => void;
    deckPlacementLive?: ResolvedDeckPlacement;
  };
  presentationScrollable?: boolean;
};

export function SlideContent({
  slide,
  viewportLocked = false,
  presentationInlineEdit,
  presentationScrollable = false,
}: SlideContentProps) {
  const { session } = useLaunchSession();
  const moment = getSlideMomentType(slide);

  const continuationBulletSlotCount = useMemo(
    () =>
      viewportLocked
        ? getContinuationMaxBulletCount(session, slide)
        : undefined,
    [viewportLocked, session, slide],
  );

  const continuationPromptSlotCount = useMemo(
    () =>
      viewportLocked
        ? getContinuationMaxPromptCount(session, slide)
        : undefined,
    [viewportLocked, session, slide],
  );

  if (moment !== "standard") {
    return (
      <InteractiveMoment
        moment={moment}
        slide={slide}
        viewportLocked={viewportLocked}
        continuationBulletSlotCount={continuationBulletSlotCount}
        continuationPromptSlotCount={continuationPromptSlotCount}
        presentationScrollable={presentationScrollable}
      />
    );
  }

  if (presentationInlineEdit && viewportLocked) {
    return (
      <StandardSlideContentInline
        slide={slide}
        continuationBulletSlotCount={continuationBulletSlotCount}
        continuationPromptSlotCount={continuationPromptSlotCount}
        deckPlacementLive={presentationInlineEdit.deckPlacementLive}
        presentationScrollable={presentationScrollable}
        onPatch={presentationInlineEdit.onPatch}
      />
    );
  }

  return (
    <StandardSlideContent
      slide={slide}
      viewportLocked={viewportLocked}
      continuationBulletSlotCount={continuationBulletSlotCount}
      continuationPromptSlotCount={continuationPromptSlotCount}
      presentationScrollable={presentationScrollable}
    />
  );
}
