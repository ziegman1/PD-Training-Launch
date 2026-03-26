import { verifyAdminRequest } from "@/lib/admin/verifyAdminRequest";
import { isEditableSessionId, type EditableSessionId } from "@/lib/admin/sessionFiles";
import { buildLaunchSessionFromAuthoringSource } from "@/lib/server/buildLaunchSession";

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
    const data = await buildLaunchSessionFromAuthoringSource(
      sessionId as EditableSessionId,
    );
    return Response.json(data, adminJsonNoStore);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Read failed";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
