/**
 * Do NOT use this for live training. Use /present and /trainer routes.
 *
 * @deprecated Thin alias over `LaunchShell`. Production builds disable the
 * combined shell unless NEXT_PUBLIC_LAUNCH_ALLOW_LEGACY_SHELL=true.
 * Prefer `SessionPresentation` / `SessionTrainer` / `SessionWorkbook` routes.
 */

import type { LaunchSession } from "@/types/launch";
import { LaunchShell } from "@/components/launch/LaunchShell";

export function TrainingDeck({ session }: { session: LaunchSession }) {
  return <LaunchShell session={session} />;
}
