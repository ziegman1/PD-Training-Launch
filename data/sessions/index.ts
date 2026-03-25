import type { EditableSessionId } from "@/lib/admin/sessionFiles";
import { loadNormalizedSessionFromDisk } from "@/lib/admin/sessionFiles";
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

/**
 * When true, `session-1` / `session-2` are read from `data/sessions/*.json` on each request
 * so admin save + normalize is visible without rebuilding. Enable in development by default, or
 * set `LAUNCH_LOAD_SESSIONS_FROM_DISK=1` in production (self-hosted with writable deploy dir).
 */
function loadSessionsFromDisk(): boolean {
  if (
    process.env.LAUNCH_LOAD_SESSIONS_FROM_DISK === "0" ||
    process.env.LAUNCH_LOAD_SESSIONS_FROM_DISK === "false"
  ) {
    return false;
  }
  return (
    process.env.NODE_ENV === "development" ||
    process.env.LAUNCH_LOAD_SESSIONS_FROM_DISK === "1" ||
    process.env.LAUNCH_LOAD_SESSIONS_FROM_DISK === "true"
  );
}

export function getLaunchSession(id: RegisteredSessionId): LaunchSession {
  if (
    loadSessionsFromDisk() &&
    (id === "session-1" || id === "session-2")
  ) {
    return loadNormalizedSessionFromDisk(id as EditableSessionId) as LaunchSession;
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
