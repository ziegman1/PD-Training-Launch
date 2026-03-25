type HeaderGet = { get(name: string): string | null };

/**
 * Best-effort absolute origin for link sharing (Vercel, reverse proxies, local dev).
 * Client components may still fall back to `window.location.origin` when this is empty.
 */
export function getSiteOriginFromHeaders(h: HeaderGet): string {
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const local = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const proto = local ? "http" : (h.get("x-forwarded-proto") ?? "https");
    return `${proto}://${host}`;
  }
  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    return `https://${vercel}`;
  }
  return "";
}
