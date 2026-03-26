import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { verifyAdminRequest } from "@/lib/admin/verifyAdminRequest";
import {
  isBlobSessionStoreEnabled,
  isVercelServerless,
  readAuthoringFromBlob,
  writeAuthoringToBlob,
  writeNormalizedToBlob,
} from "@/lib/admin/blobSessionStore";
import {
  isEditableSessionId,
  readAuthoringJson,
  runNormalizeScript,
  writeAuthoringJson,
  type EditableSessionId,
} from "@/lib/admin/sessionFiles";
import { validateAuthoringBody } from "@/lib/admin/validateAuthoring";

type RouteCtx = { params: Promise<{ sessionId: string }> };

const adminJsonNoStore = {
  headers: { "Cache-Control": "private, no-store, must-revalidate" },
} as const;

export async function GET(request: Request, ctx: RouteCtx) {
  const denied = verifyAdminRequest(request);
  if (denied) return denied;
  const { sessionId } = await ctx.params;
  if (!isEditableSessionId(sessionId)) {
    return new Response(JSON.stringify({ error: "Unknown session" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    if (isBlobSessionStoreEnabled()) {
      const fromBlob = await readAuthoringFromBlob(sessionId);
      if (fromBlob != null) return Response.json(fromBlob, adminJsonNoStore);
    }
    const data = readAuthoringJson(sessionId);
    return Response.json(data, adminJsonNoStore);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Read failed";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(request: Request, ctx: RouteCtx) {
  const denied = verifyAdminRequest(request);
  if (denied) return denied;
  const { sessionId } = await ctx.params;
  if (!isEditableSessionId(sessionId)) {
    return new Response(JSON.stringify({ error: "Unknown session" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const err = validateAuthoringBody(body, sessionId as EditableSessionId);
  if (err) {
    return new Response(JSON.stringify({ error: err }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const sid = sessionId as EditableSessionId;
    if (isBlobSessionStoreEnabled()) {
      const tmpBase = fs.mkdtempSync(
        path.join(os.tmpdir(), `launch-normalize-${sid}-`),
      );
      const tmpAuthoring = path.join(tmpBase, `${sid}.authoring.json`);
      const tmpOut = path.join(tmpBase, `${sid}.json`);
      try {
        fs.writeFileSync(
          tmpAuthoring,
          `${JSON.stringify(body, null, 2)}\n`,
          "utf8",
        );
        runNormalizeScript(sid, {
          authoringPath: tmpAuthoring,
          outPath: tmpOut,
        });
        const normalized = JSON.parse(fs.readFileSync(tmpOut, "utf8")) as unknown;
        await writeAuthoringToBlob(sessionId, body);
        await writeNormalizedToBlob(sessionId, normalized);
      } finally {
        fs.rmSync(tmpBase, { recursive: true, force: true });
      }
    } else if (isVercelServerless()) {
      return new Response(
        JSON.stringify({
          error:
            "Saving is not available on Vercel without blob storage. Create a Blob store in this Vercel project, add BLOB_READ_WRITE_TOKEN to Environment Variables, redeploy, then try again. Optional: set LAUNCH_BLOB_PREFIX to namespace blobs.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    } else {
      writeAuthoringJson(sid, body);
      runNormalizeScript(sid);
    }
    return Response.json({
      ok: true,
      message: "Saved authoring and regenerated session JSON.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Write or normalize failed";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
