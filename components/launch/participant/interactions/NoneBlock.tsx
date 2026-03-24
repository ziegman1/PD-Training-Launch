"use client";

import type { AudienceLaunchSlide } from "@/types/launch";

export function NoneBlock({}: { slide: AudienceLaunchSlide }) {
  return (
    <p className="text-sm text-launch-muted">
      No written activity on this slide — follow the main content.
    </p>
  );
}
