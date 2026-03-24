"use client";

import { ModeToggle } from "@/components/launch/ModeToggle";

/**
 * @deprecated Was used only by the legacy `LaunchShell` to switch modes in one
 * window — unsafe for Teams screen share. `LaunchShell` no longer renders this
 * component. Kept only if a future dev tool needs an isolated mode toggle.
 */
export function PresentationChrome() {
  return (
    <div className="pointer-events-none fixed right-0 top-0 z-50 flex justify-end p-4 md:p-5">
      <div className="pointer-events-auto opacity-[0.22] transition-opacity duration-200 hover:opacity-100 focus-within:opacity-100 md:opacity-35">
        <ModeToggle />
      </div>
    </div>
  );
}
