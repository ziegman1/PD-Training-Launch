import type { AudienceLaunchSlide } from "@/types/launch";
import { getSlideMomentType } from "@/lib/slideContent";
import { InteractiveMoment } from "@/components/launch/slide/InteractiveMoment";
import { StandardSlideContent } from "@/components/launch/slide/StandardSlideContent";

type SlideContentProps = {
  slide: AudienceLaunchSlide;
  /** Presentation Mode: fit slide to viewport without page scroll */
  viewportLocked?: boolean;
  /** Presentation: pad bullet list to this many rows within a continuation group */
  continuationBulletSlotCount?: number;
};

export function SlideContent({
  slide,
  viewportLocked = false,
  continuationBulletSlotCount,
}: SlideContentProps) {
  const moment = getSlideMomentType(slide);

  if (moment !== "standard") {
    return (
      <InteractiveMoment
        moment={moment}
        slide={slide}
        viewportLocked={viewportLocked}
      />
    );
  }

  return (
    <StandardSlideContent
      slide={slide}
      viewportLocked={viewportLocked}
      continuationBulletSlotCount={continuationBulletSlotCount}
    />
  );
}
