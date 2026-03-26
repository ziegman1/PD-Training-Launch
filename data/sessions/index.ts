import type { LaunchSession } from "@/types/launch";
import sampleSession from "./sample-session.json";
/**
 * Primary Session 1 deck — canonical `LaunchSession` / `LaunchSlide` JSON.
 * Authoring source: `session-1.authoring.json`; regenerate with `npm run content:session-1`.
 */
import session1 from "./session-1.json";
/**
 * Session 2 — Focus Your Vision. Authoring: `session-2.authoring.json`; run `npm run content:session-2`.
 */
import session2 from "./session-2.json";

const sessions = {
  "sample-foundation": sampleSession as LaunchSession,
  "session-1": session1 as LaunchSession,
  "session-2": session2 as LaunchSession,
} as const;

export type RegisteredSessionId = keyof typeof sessions;

export async function getLaunchSession(
  id: RegisteredSessionId,
): Promise<LaunchSession> {
  if (id === "session-1" || id === "session-2") {
    const { buildLaunchSessionFromAuthoringSource } = await import(
      "@/lib/server/buildLaunchSession"
    );
    return buildLaunchSessionFromAuthoringSource(id);
  }
  return sessions[id];
}

export function listLaunchSessions(): { id: RegisteredSessionId; title: string }[] {
  return (Object.keys(sessions) as RegisteredSessionId[]).map((id) => ({
    id,
    title: sessions[id].title,
  }));
}

export function isRegisteredSessionId(id: string): id is RegisteredSessionId {
  return Object.prototype.hasOwnProperty.call(sessions, id);
}
