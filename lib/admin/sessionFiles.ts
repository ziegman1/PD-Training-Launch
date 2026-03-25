import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const EDITABLE_SESSION_IDS = ["session-1", "session-2"] as const;
export type EditableSessionId = (typeof EDITABLE_SESSION_IDS)[number];

export function isEditableSessionId(id: string): id is EditableSessionId {
  return EDITABLE_SESSION_IDS.includes(id as EditableSessionId);
}

export function authoringPath(sessionId: EditableSessionId): string {
  return path.join(
    process.cwd(),
    "data",
    "sessions",
    `${sessionId}.authoring.json`,
  );
}

export function normalizedSessionPath(sessionId: EditableSessionId): string {
  return path.join(process.cwd(), "data", "sessions", `${sessionId}.json`);
}

export function readAuthoringJson(sessionId: EditableSessionId): unknown {
  const p = authoringPath(sessionId);
  return JSON.parse(fs.readFileSync(p, "utf8")) as unknown;
}

export function writeAuthoringJson(
  sessionId: EditableSessionId,
  data: unknown,
): void {
  const p = authoringPath(sessionId);
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function runNormalizeScript(sessionId: EditableSessionId): void {
  const script =
    sessionId === "session-1"
      ? "normalize-session-1.mjs"
      : "normalize-session-2.mjs";
  execFileSync(
    process.execPath,
    [path.join(process.cwd(), "scripts", script)],
    {
      cwd: process.cwd(),
      stdio: "pipe",
      encoding: "utf8",
    },
  );
}

export function loadNormalizedSessionFromDisk(
  sessionId: EditableSessionId,
): unknown {
  const p = normalizedSessionPath(sessionId);
  return JSON.parse(fs.readFileSync(p, "utf8")) as unknown;
}
