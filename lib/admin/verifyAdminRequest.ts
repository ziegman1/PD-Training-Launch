/**
 * Gate admin API routes. Set `LAUNCH_ADMIN_SECRET` in the environment (e.g. `.env.local`).
 * Send matching token as `Authorization: Bearer <secret>` or `x-launch-admin-secret: <secret>`.
 */
export function adminAuthFailure(
  status: number,
  message: string,
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function verifyAdminRequest(request: Request): Response | null {
  const secret = process.env.LAUNCH_ADMIN_SECRET?.trim();
  if (!secret) {
    return adminAuthFailure(
      503,
      "Admin is disabled: set LAUNCH_ADMIN_SECRET in the environment.",
    );
  }
  const auth = request.headers.get("authorization");
  const bearer =
    auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : null;
  const header = request.headers.get("x-launch-admin-secret")?.trim();
  const token = bearer ?? header ?? "";
  if (token !== secret) {
    return adminAuthFailure(401, "Unauthorized");
  }
  return null;
}
