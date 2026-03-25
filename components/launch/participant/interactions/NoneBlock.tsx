"use client";

import type { AudienceLaunchSlide } from "@/types/launch";

export function NoneBlock({}: { slide: AudienceLaunchSlide }) {
  return (
    <p className="text-base leading-relaxed text-launch-muted">
      No written activity for this slide—follow along with your facilitator in the meeting.
    </p>
  );
}
