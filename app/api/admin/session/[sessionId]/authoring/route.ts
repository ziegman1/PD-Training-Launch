import { verifyAdminRequest } from "@/lib/admin/verifyAdminRequest";
import {
  isEditableSessionId,
  readAuthoringJson,
  runNormalizeScript,
  writeAuthoringJson,
  type EditableSessionId,
} from "@/lib/admin/sessionFiles";
import { validateAuthoringBody } from "@/lib/admin/validateAuthoring";

type RouteCtx = { params: Promise<{ sessionId: string }> };

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
    const data = readAuthoringJson(sessionId);
    return Response.json(data);
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
    writeAuthoringJson(sessionId as EditableSessionId, body);
    runNormalizeScript(sessionId as EditableSessionId);
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
