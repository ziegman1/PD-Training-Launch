import "server-only";

import type { LaunchSession } from "@/types/launch";
import {
  isBlobSessionStoreEnabled,
  readAuthoringFromBlob,
} from "@/lib/admin/blobSessionStore";
import {
  readAuthoringJson,
  type EditableSessionId,
} from "@/lib/admin/sessionFiles";
import { buildNormalizedSessionFromAuthoring } from "@/scripts/normalize-session-core.mjs";
import session1Authoring from "@/data/sessions/session-1.authoring.json";
import session2Authoring from "@/data/sessions/session-2.authoring.json";

function isAuthoringWithSlides(x: unknown): x is { slides: unknown[] } {
  return (
    typeof x === "object" &&
    x !== null &&
    Array.isArray((x as { slides?: unknown }).slides)
  );
}

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

const bundledAuthoring: Record<EditableSessionId, unknown> = {
  "session-1": session1Authoring,
  "session-2": session2Authoring,
};

/**
 * Session 1/2 decks are always derived from authoring (Vercel Blob or repo JSON) plus the current
 * expand/normalize pipeline. Stale normalized JSON in Blob no longer overrides shipped behavior.
 */
export async function buildLaunchSessionFromAuthoringSource(
  id: EditableSessionId,
): Promise<LaunchSession> {
  let authoring: unknown = bundledAuthoring[id];

  if (loadSessionsFromDisk()) {
    try {
      const fromDisk = readAuthoringJson(id);
      if (isAuthoringWithSlides(fromDisk)) authoring = fromDisk;
    } catch {
      /* bundled */
    }
  } else if (isBlobSessionStoreEnabled()) {
    const fromBlob = await readAuthoringFromBlob(id);
    if (isAuthoringWithSlides(fromBlob)) authoring = fromBlob;
  }

  if (!isAuthoringWithSlides(authoring)) {
    authoring = bundledAuthoring[id];
  }
  if (!isAuthoringWithSlides(authoring)) {
    throw new Error(`Invalid authoring for ${id}`);
  }

  return buildNormalizedSessionFromAuthoring(authoring, id) as LaunchSession;
}
