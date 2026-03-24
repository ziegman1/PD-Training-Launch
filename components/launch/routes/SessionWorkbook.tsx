"use client";

/** `/workbook/[sessionId]` — companion workbook only (no presentation/trainer UI). */

import type { LaunchSession } from "@/types/launch";
import { LaunchSessionProvider } from "@/contexts/LaunchSessionContext";
import { WorkbookView } from "@/components/launch/views/WorkbookView";

export function SessionWorkbook({ session }: { session: LaunchSession }) {
  return (
    <LaunchSessionProvider
      session={session}
      syncDeck
      initialMode="participant"
    >
      <WorkbookView />
    </LaunchSessionProvider>
  );
}
