import type { ReactNode } from "react";

type SlideContainerProps = {
  children: ReactNode;
  className?: string;
  /**
   * When true (Presentation Mode / Teams share): constrain to the viewport height,
   * no outer scroll — content uses compact spacing and flex sizing inside the frame.
   */
  viewportLocked?: boolean;
};

/**
 * Centered stage with soft vignette — reads as spotlight, not a web card.
 */
export function SlideContainer({
  children,
  className = "",
  viewportLocked = false,
}: SlideContainerProps) {
  /* Asymmetric vertical pad: more top than bottom so justify-centered deck sits slightly
     lower — optical center follows title + emphasis + bullets as a group (less top-heavy). */
  /* Locked: horizontal padding lives in `PRESENTATION_GRID_WRAPPER_CLASS` (logo + slide share one column). */
  const pad = viewportLocked
    ? "px-0 pt-0 pb-[clamp(0.5rem,1.45vh,1.45rem)]"
    : "px-6 py-16 md:px-16 md:py-24";

  return (
    <div
      data-slide-stage
      data-presentation-viewport={viewportLocked ? "locked" : undefined}
      className={`flex min-h-0 flex-1 flex-col justify-center ${pad} ${
        viewportLocked ? "h-full max-h-full overflow-hidden" : ""
      } ${className}`}
    >
      <div
        className={`relative mx-auto w-full ${
          viewportLocked
            ? "flex min-h-0 h-full max-h-full flex-1 flex-col"
            : "max-w-[52rem]"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_68%_52%_at_50%_42%,transparent_38%,rgba(0,0,0,0.38)_100%)]"
          aria-hidden
        />
        <div
          className={`relative ${
            viewportLocked
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : ""
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
