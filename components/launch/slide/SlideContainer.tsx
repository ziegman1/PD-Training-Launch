import type { ReactNode } from "react";

type SlideContainerProps = {
  children: ReactNode;
  className?: string;
  /**
   * When true (Presentation Mode / Teams share): constrain to the viewport height,
   * no outer scroll — content uses compact spacing and flex sizing inside the frame.
   */
  viewportLocked?: boolean;
  /** Admin preview: do not clip slide height so a parent scroll area can scroll. */
  presentationScrollable?: boolean;
};

/**
 * Centered stage with soft vignette — reads as spotlight, not a web card.
 */
export function SlideContainer({
  children,
  className = "",
  viewportLocked = false,
  presentationScrollable = false,
}: SlideContainerProps) {
  /* Presentation: light bottom-weighted pad + inner nudge so optical center sits slightly
     below geometric center (Teams screen share); no scroll — overflow stays hidden. */
  /* Locked: horizontal padding lives in `PRESENTATION_GRID_WRAPPER_CLASS` (logo + slide share one column). */
  const pad = viewportLocked
    ? "px-0 pt-[clamp(0.3rem,0.85vh,0.7rem)] pb-[clamp(0.7rem,1.9vh,1.75rem)]"
    : "px-6 py-16 md:px-16 md:py-24";

  const mainAxis = viewportLocked ? "justify-start" : "justify-center";

  const lockedClip =
    viewportLocked && !presentationScrollable
      ? "h-full max-h-full overflow-hidden"
      : "";
  const lockedScrollable =
    viewportLocked && presentationScrollable
      ? "min-h-full w-full max-w-full overflow-x-hidden overflow-y-visible"
      : "";

  const innerLocked =
    viewportLocked && !presentationScrollable
      ? "flex min-h-0 h-full max-h-full flex-1 flex-col"
      : viewportLocked && presentationScrollable
        ? "flex min-h-min w-full flex-1 flex-col"
        : "max-w-[52rem]";

  const contentLocked =
    viewportLocked && !presentationScrollable
      ? "flex min-h-0 flex-1 flex-col overflow-hidden"
      : viewportLocked && presentationScrollable
        ? "relative flex min-h-min w-full flex-1 flex-col overflow-visible"
        : "";

  return (
    <div
      data-slide-stage
      data-presentation-viewport={viewportLocked ? "locked" : undefined}
      data-admin-deck-scroll={presentationScrollable ? "true" : undefined}
      className={`flex min-h-0 flex-1 flex-col ${mainAxis} ${pad} ${lockedClip} ${lockedScrollable} ${className}`}
    >
      <div className={`relative mx-auto w-full ${innerLocked}`}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_68%_52%_at_50%_42%,transparent_38%,rgba(0,0,0,0.38)_100%)]"
          aria-hidden
        />
        <div className={contentLocked || "relative"}>{children}</div>
      </div>
    </div>
  );
}
