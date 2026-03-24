"use client";

import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { AudienceLaunchSlide } from "@/types/launch";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import { getContinuationMaxBulletCount } from "@/lib/continuationLayout";
import { SlideContainer } from "@/components/launch/slide/SlideContainer";
import { SlideContent } from "@/components/launch/slide/SlideContent";

type SlideProps = {
  slide: AudienceLaunchSlide;
  containerClassName?: string;
};

const easePremium = [0.22, 1, 0.36, 1] as const;

export function Slide({ slide, containerClassName = "" }: SlideProps) {
  const { slideTransitionSign, presentationLock, session } = useLaunchSession();
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

  const continuationBulletSlotCount = useMemo(
    () =>
      presentationLock
        ? getContinuationMaxBulletCount(session, slide)
        : undefined,
    [presentationLock, session, slide],
  );

  return (
    <SlideContainer
      className={containerClassName}
      viewportLocked={presentationLock}
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
              ? "flex h-full min-h-0 flex-1 flex-col overflow-hidden"
              : ""
          }`}
        >
          <SlideContent
            slide={slide}
            viewportLocked={presentationLock}
            continuationBulletSlotCount={continuationBulletSlotCount}
          />
        </motion.div>
      </AnimatePresence>
    </SlideContainer>
  );
}
