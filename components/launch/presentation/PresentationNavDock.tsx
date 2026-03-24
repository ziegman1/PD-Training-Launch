"use client";

import { DeckNavigation } from "@/components/launch/navigation/DeckNavigation";

/**
 * Hover the lower edge to reveal controls — no shadow, minimal chrome.
 */
export function PresentationNavDock() {
  return (
    <div className="group fixed inset-x-0 bottom-0 z-30 flex justify-center pb-8 pt-24">
      <div className="opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 focus-within:opacity-100">
        <div className="rounded-full border border-launch-neutral/40 bg-launch-navy/92 px-3 py-1 backdrop-blur-sm">
          <DeckNavigation variant="ghost" />
        </div>
      </div>
    </div>
  );
}
