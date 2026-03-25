"use client";

/** `/workbook/[sessionId]` — companion workbook only (no presentation/trainer UI). */

import type { LaunchSession } from "@/types/launch";
import { LaunchSessionProvider } from "@/contexts/LaunchSessionContext";
import { WorkbookView } from "@/components/launch/views/WorkbookView";

export function SessionWorkbook({ session }: { session: LaunchSession }) {
  const guided = Boolean(session.workbook?.sections?.length);
  return (
    <LaunchSessionProvider
      session={session}
      syncDeck={!guided}
      initialMode="participant"
    >
      <WorkbookView />
    </LaunchSessionProvider>
  );
}
