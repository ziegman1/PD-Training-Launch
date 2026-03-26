import { BlobNotFoundError, head, put } from "@vercel/blob";
import type { LaunchSession } from "@/types/launch";

/** Vercel sets this in serverless builds/runtimes. */
export function isVercelServerless(): boolean {
  return process.env.VERCEL === "1";
}

/**
 * Persist admin authoring + normalized session JSON to Vercel Blob on serverless.
 * Requires a Blob store on the Vercel project and `BLOB_READ_WRITE_TOKEN`.
 * Set `LAUNCH_USE_BLOB=1` locally to exercise the same code path.
 */
export function isBlobSessionStoreEnabled(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return false;
  return isVercelServerless() || process.env.LAUNCH_USE_BLOB === "1";
}

function storePrefix(): string {
  const raw = process.env.LAUNCH_BLOB_PREFIX ?? "pd-training-launch";
  return raw.replace(/\/+$/, "");
}

export function authoringBlobPathname(sessionId: string): string {
  return `${storePrefix()}/authoring/${sessionId}.authoring.json`;
}

export function normalizedBlobPathname(sessionId: string): string {
  return `${storePrefix()}/normalized/${sessionId}.json`;
}

async function readJsonFromBlobUrl(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Blob read failed: HTTP ${res.status}`);
  }
  return res.json() as Promise<unknown>;
}

export async function readAuthoringFromBlob(
  sessionId: string,
): Promise<unknown | null> {
  if (!isBlobSessionStoreEnabled()) return null;
  try {
    const meta = await head(authoringBlobPathname(sessionId));
    return readJsonFromBlobUrl(meta.url);
  } catch (e) {
    if (e instanceof BlobNotFoundError) return null;
    throw e;
  }
}

export async function readNormalizedFromBlob(
  sessionId: string,
): Promise<LaunchSession | null> {
  if (!isBlobSessionStoreEnabled()) return null;
  try {
    const meta = await head(normalizedBlobPathname(sessionId));
    const data = await readJsonFromBlobUrl(meta.url);
    return data as LaunchSession;
  } catch (e) {
    if (e instanceof BlobNotFoundError) return null;
    throw e;
  }
}

export async function writeAuthoringToBlob(
  sessionId: string,
  data: unknown,
): Promise<void> {
  const body = `${JSON.stringify(data, null, 2)}\n`;
  await put(authoringBlobPathname(sessionId), body, {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function writeNormalizedToBlob(
  sessionId: string,
  session: unknown,
): Promise<void> {
  const body = `${JSON.stringify(session, null, 2)}\n`;
  await put(normalizedBlobPathname(sessionId), body, {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}
