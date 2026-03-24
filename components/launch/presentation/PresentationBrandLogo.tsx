"use client";

/**
 * Presentation route only — absolutely positioned inside `PRESENTATION_STAGE_CLASS` (900px grid).
 * Asset: `public/brand/team-expansion-logo-white.png`.
 */
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";

const easePremium = [0.22, 1, 0.36, 1] as const;
/** ~0.92–0.96 — clear without competing with title / emphasis */
const LOGO_REST_OPACITY = 0.95;
const LOGO_TRANSITION_OPACITY = 0.9;

const LOGO_SRC = "/brand/team-expansion-logo-white.png";
/** Natural asset dimensions (preserves aspect ratio when scaled by width) */
const LOGO_NATURAL_W = 3248;
const LOGO_NATURAL_H = 912;

export function PresentationBrandLogo() {
  const { slideIndex } = useLaunchSession();
  const prefersReducedMotion = useReducedMotion() === true;
  const controls = useAnimationControls();
  const introDone = useRef(false);
  const prevSlideIndex = useRef(slideIndex);

  useEffect(() => {
    if (prefersReducedMotion) {
      void controls.start({
        opacity: LOGO_REST_OPACITY,
        transition: { duration: 0 },
      });
      introDone.current = true;
      prevSlideIndex.current = slideIndex;
      return;
    }

    if (!introDone.current) {
      introDone.current = true;
      prevSlideIndex.current = slideIndex;
      void controls.start({
        opacity: LOGO_REST_OPACITY,
        transition: { duration: 0.75, ease: easePremium },
      });
      return;
    }

    if (prevSlideIndex.current === slideIndex) {
      return;
    }

    prevSlideIndex.current = slideIndex;

    void (async () => {
      await controls.start({
        opacity: LOGO_TRANSITION_OPACITY,
        transition: { duration: 0.1, ease: [0.4, 0, 1, 1] },
      });
      await controls.start({
        opacity: LOGO_REST_OPACITY,
        transition: { duration: 0.35, ease: easePremium },
      });
    })();
  }, [slideIndex, controls, prefersReducedMotion]);

  return (
    <motion.div
      className="block w-[clamp(8.75rem,10vw,10rem)] max-w-[160px]"
      aria-hidden
      initial={{
        opacity: prefersReducedMotion ? LOGO_REST_OPACITY : 0,
      }}
      animate={controls}
    >
      <img
        src={LOGO_SRC}
        alt=""
        width={LOGO_NATURAL_W}
        height={LOGO_NATURAL_H}
        decoding="async"
        className="block h-auto w-full"
      />
    </motion.div>
  );
}
