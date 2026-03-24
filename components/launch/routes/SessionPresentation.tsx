"use client";

/**
 * Wraps `/present/[sessionId]` with `presentationLock` so facilitator data never
 * reaches the slide tree and mode cannot leave presentation.
 */
import type { LaunchSession } from "@/types/launch";
import { LaunchSessionProvider } from "@/contexts/LaunchSessionContext";
import { PresentationView } from "@/components/launch/views/PresentationView";

export function SessionPresentation({ session }: { session: LaunchSession }) {
  return (
    <LaunchSessionProvider
      session={session}
      syncDeck
      initialMode="presentation"
      presentationLock
    >
      <PresentationView />
    </LaunchSessionProvider>
  );
}
