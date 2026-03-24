"use client";

import { useEffect } from "react";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";
import { BaseLayout } from "@/components/launch/layout/BaseLayout";
import { PresentationBrandLogo } from "@/components/launch/presentation/PresentationBrandLogo";
import { PresentationNavDock } from "@/components/launch/presentation/PresentationNavDock";
import { Slide } from "@/components/launch/slide/Slide";
import {
  PRESENTATION_GRID_WRAPPER_CLASS,
  PRESENTATION_STAGE_CLASS,
} from "@/components/launch/slide/presentationSlideLayout";

/**
 * Teams screen-share surface: slide only, subtle nav, no trainer/participant chrome.
 */
export function PresentationView() {
  const { audienceSlide, presentationLock, goNext, goPrev } = useLaunchSession();

  if (process.env.NODE_ENV !== "production" && !presentationLock) {
    console.error(
      "[Launch] PresentationView must be used with LaunchSessionProvider presentationLock (Teams safety).",
    );
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  if (!audienceSlide) {
    return (
      <BaseLayout className="flex items-center justify-center">
        <p className="text-launch-body text-launch-muted">No slides.</p>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout className="relative">
      <p className="sr-only">
        Screen share view. Use arrow keys or space to change slides. Run the trainer
        console in a separate browser window on your second monitor — not this tab.
      </p>

      <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden">
        <main
          data-launch-mode="presentation"
          aria-label="Presentation"
          className="present-share-boost relative flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className={PRESENTATION_GRID_WRAPPER_CLASS}>
            <div className={PRESENTATION_STAGE_CLASS}>
              {/*
                Grid-aligned overlay: `left-0` is the padded content edge of the 900px column,
                not the viewport. Does not consume flex space — slide centering unchanged.
              */}
              <div
                className="pointer-events-none absolute left-0 top-[calc(clamp(1.5rem,3vh,2.25rem)+0.625rem)] z-[35]"
                aria-hidden
              >
                <PresentationBrandLogo />
              </div>
              <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">
                <Slide slide={audienceSlide} containerClassName="min-h-0 flex-1" />
              </div>
            </div>
          </div>
        </main>
        <PresentationNavDock />
      </div>
    </BaseLayout>
  );
}
