export const LAUNCH_ADMIN_TOKEN_KEY = "launch_admin_token";

export function getStoredAdminToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(LAUNCH_ADMIN_TOKEN_KEY) ?? "";
}

export function adminAuthFetchHeaders(): HeadersInit {
  const t = getStoredAdminToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
