import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EDITABLE_SESSION_IDS,
  isEditableSessionId,
} from "@/lib/admin/sessionFiles";

export const dynamic = "force-dynamic";

export default async function AdminSessionLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ sessionId: string }>;
}>) {
  const { sessionId } = await params;
  if (!isEditableSessionId(sessionId)) notFound();

  return (
    <div>
      <nav
        className="mb-6 flex flex-wrap items-center gap-2 border-b border-launch-steel/20 pb-4"
        aria-label="Switch session"
      >
        <span className="mr-1 text-sm text-launch-muted">Session</span>
        {EDITABLE_SESSION_IDS.map((id) => (
          <Link
            key={id}
            href={`/admin/${id}`}
            prefetch
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              id === sessionId
                ? "bg-launch-gold/25 text-launch-gold ring-1 ring-launch-gold/40"
                : "text-launch-secondary hover:bg-launch-steel/20 hover:text-launch-primary"
            }`}
          >
            {id}
          </Link>
        ))}
        <span className="mx-2 hidden text-launch-muted sm:inline">·</span>
        <Link
          href="/admin"
          className="text-sm text-launch-muted underline-offset-2 hover:text-launch-soft hover:underline"
        >
          Admin home
        </Link>
      </nav>
      {children}
    </div>
  );
}
