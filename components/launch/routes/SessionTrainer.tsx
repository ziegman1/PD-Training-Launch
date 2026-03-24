"use client";

/** Only import path for `TrainerConsoleView` — keep trainer UI off `/present`. */

import type { LaunchSession } from "@/types/launch";
import { LaunchSessionProvider } from "@/contexts/LaunchSessionContext";
import { TrainerConsoleView } from "@/components/launch/views/TrainerConsoleView";

export function SessionTrainer({
  session,
  presentPath,
}: {
  session: LaunchSession;
  presentPath: string;
}) {
  return (
    <LaunchSessionProvider session={session} syncDeck initialMode="trainer">
      <TrainerConsoleView presentPath={presentPath} />
    </LaunchSessionProvider>
  );
}
