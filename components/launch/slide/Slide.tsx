"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ResolvedDeckPlacement } from "@/lib/deckPlacement";
import type { AudienceLaunchSlide } from "@/types/launch";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import { SlideContainer } from "@/components/launch/slide/SlideContainer";
import { SlideContent } from "@/components/launch/slide/SlideContent";

type SlideProps = {
  slide: AudienceLaunchSlide;
  containerClassName?: string;
  /**
   * Admin / authoring: render standard slides with `contentEditable` regions
   * that mirror the live deck (commits via `onPatch` on blur).
   */
  presentationInlineEdit?: {
    onPatch: (patch: Record<string, unknown>) => void;
    /** Admin: while dragging layout handles, positions for `deckPlacement`. */
    deckPlacementLive?: ResolvedDeckPlacement;
  };
  /** Admin preview: parent provides vertical scroll; slide grows with content. */
  presentationScrollable?: boolean;
};

const easePremium = [0.22, 1, 0.36, 1] as const;

export function Slide({
  slide,
  containerClassName = "",
  presentationInlineEdit,
  presentationScrollable = false,
}: SlideProps) {
  const { slideTransitionSign, presentationLock } = useLaunchSession();
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 0.42;
  const dx = reduceMotion ? 0 : 22;

  /**
   * Presentation: same `continuationGroup` keeps a stable motion key so advancing within a
   * bullet sequence does not run exit/enter—only bullet content updates (seamless continuation).
   */
  const deckMotionKey =
    presentationLock && slide.continuationGroup
      ? slide.continuationGroup
      : slide.id;

  return (
    <SlideContainer
      className={containerClassName}
      viewportLocked={presentationLock}
      presentationScrollable={presentationScrollable}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={deckMotionKey}
          layout={false}
          initial={{
            opacity: 0,
            x: slideTransitionSign * dx,
            filter: reduceMotion ? "none" : "blur(6px)",
          }}
          animate={{
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
          }}
          exit={{
            opacity: 0,
            x: slideTransitionSign * -dx * 0.75,
            filter: reduceMotion ? "none" : "blur(4px)",
          }}
          transition={{
            duration,
            ease: easePremium,
          }}
          className={`will-change-transform ${
            presentationLock
              ? presentationScrollable
                ? "flex min-h-min w-full flex-1 flex-col"
                : "flex h-full min-h-0 flex-1 flex-col overflow-hidden"
              : ""
          }`}
        >
          <SlideContent
            slide={slide}
            viewportLocked={presentationLock}
            presentationInlineEdit={presentationInlineEdit}
            presentationScrollable={presentationScrollable}
          />
        </motion.div>
      </AnimatePresence>
    </SlideContainer>
  );
}
