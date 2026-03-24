"use client";

import { useLaunchSession } from "@/contexts/LaunchSessionContext";

type DeckNavigationProps = {
  variant?: "default" | "ghost";
};

export function DeckNavigation({ variant = "default" }: DeckNavigationProps) {
  const { slideIndex, totalSlides, goNext, goPrev } = useLaunchSession();
  const last = slideIndex >= totalSlides - 1;
  const first = slideIndex <= 0;
  const ghost = variant === "ghost";

  return (
    <div
      className={`flex items-center justify-center gap-2 md:gap-3 ${ghost ? "py-2" : "py-4"}`}
    >
      <button
        type="button"
        onClick={goPrev}
        disabled={first}
        className={
          ghost
            ? "rounded-full border border-launch-neutral/80 px-3 py-1.5 text-xs font-semibold text-launch-secondary transition-all duration-200 ease-out hover:border-launch-steel/60 hover:text-launch-primary disabled:cursor-not-allowed disabled:opacity-25"
            : "min-w-[6.5rem] rounded-full border border-launch-neutral px-4 py-2 text-sm font-semibold text-launch-secondary transition-all duration-200 ease-out hover:border-launch-steel/50 hover:text-launch-primary disabled:cursor-not-allowed disabled:opacity-30"
        }
      >
        Prev
      </button>
      <span
        className={`font-mono text-launch-muted ${ghost ? "text-[0.65rem]" : "text-xs"}`}
      >
        {slideIndex + 1} / {totalSlides}
      </span>
      <button
        type="button"
        onClick={goNext}
        disabled={last}
        className={
          ghost
            ? "rounded-full bg-launch-gold px-3 py-1.5 text-xs font-semibold text-launch-navy transition-all duration-200 ease-out hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-25"
            : "min-w-[6.5rem] rounded-full bg-launch-gold px-4 py-2 text-sm font-semibold text-launch-navy transition-all duration-200 ease-out hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30"
        }
      >
        Next
      </button>
    </div>
  );
}
