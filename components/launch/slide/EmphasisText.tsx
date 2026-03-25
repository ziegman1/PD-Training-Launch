"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

type EmphasisTextProps = {
  children: ReactNode;
  className?: string;
  spacious?: boolean;
  style?: CSSProperties;
};

/**
 * Key statements: gold, soft luminance, subtle entrance (respects reduced motion).
 */
export function EmphasisText({
  children,
  className = "",
  spacious = true,
  style,
}: EmphasisTextProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.p
      style={style}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`launch-emphasis-text mx-auto w-full max-w-3xl text-balance text-left text-[clamp(1.15rem,1.9vw+0.65rem,1.75rem)] font-semibold leading-snug tracking-[-0.02em] text-launch-gold md:text-[clamp(1.25rem,2.1vw+0.45rem,1.95rem)] md:leading-snug ${spacious ? "my-10 md:my-12" : "my-4"} ${className}`}
    >
      {children}
    </motion.p>
  );
}
