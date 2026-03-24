"use client";

import type { LaunchMode } from "@/types/launch";
import { useLaunchSession } from "@/contexts/LaunchSessionContext";

const MODES: { id: LaunchMode; label: string }[] = [
  { id: "presentation", label: "Presentation" },
  { id: "trainer", label: "Trainer" },
  { id: "participant", label: "Participant" },
];

export function ModeToggle() {
  const { mode, setMode, presentationLock } = useLaunchSession();

  if (presentationLock) {
    return null;
  }

  return (
    <div
      className="inline-flex rounded-full border border-launch-neutral/50 bg-launch-navy/80 p-1 backdrop-blur-sm"
      role="tablist"
      aria-label="Launch mode"
    >
      {MODES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={mode === id}
          onClick={() => setMode(id)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors md:px-4 md:text-sm ${
            mode === id
              ? "bg-launch-gold text-launch-navy"
              : "text-launch-muted hover:text-launch-secondary"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
