import type { Metadata } from "next";
import { headers } from "next/headers";
import { LaunchHomeHub } from "@/components/launch/home/LaunchHomeHub";
import { listLaunchSessions } from "@/data/sessions";
import { getSiteOriginFromHeaders } from "@/lib/siteOrigin";

export const metadata: Metadata = {
  title: "Launch · Hub",
  description:
    "Open presentation, trainer console, or participant workbook for each Launch session.",
};

const PRIMARY_SESSION_ORDER = ["session-1", "session-2"] as const;

function orderedSessions() {
  const list = listLaunchSessions();
  const primary = PRIMARY_SESSION_ORDER.map((id) => list.find((s) => s.id === id)).filter(
    Boolean,
  ) as typeof list;
  const rest = list
    .filter((s) => !PRIMARY_SESSION_ORDER.includes(s.id as (typeof PRIMARY_SESSION_ORDER)[number]))
    .sort((a, b) => a.title.localeCompare(b.title));
  return [...primary, ...rest];
}

export default async function Home() {
  const h = await headers();
  const siteOrigin = getSiteOriginFromHeaders(h);
  return <LaunchHomeHub sessions={orderedSessions()} siteOrigin={siteOrigin} />;
}
