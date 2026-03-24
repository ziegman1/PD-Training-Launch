import type { LaunchSession } from "@/types/launch";
import {
  getLaunchSession,
  isRegisteredSessionId,
} from "@/data/sessions";

export { isRegisteredSessionId };

export function resolveSession(id: string): LaunchSession | null {
  if (!isRegisteredSessionId(id)) return null;
  return getLaunchSession(id);
}
