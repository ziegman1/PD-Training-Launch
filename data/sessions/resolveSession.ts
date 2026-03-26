import type { LaunchSession } from "@/types/launch";
import {
  getLaunchSession,
  isRegisteredSessionId,
} from "@/data/sessions";

export { isRegisteredSessionId };

export async function resolveSession(
  id: string,
): Promise<LaunchSession | null> {
  if (!isRegisteredSessionId(id)) return null;
  return getLaunchSession(id);
}
