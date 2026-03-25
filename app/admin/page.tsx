import Link from "next/link";
import { AdminTokenGate } from "@/components/admin/AdminTokenGate";
import { EDITABLE_SESSION_IDS } from "@/lib/admin/sessionFiles";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-launch-primary">
        Content admin
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-launch-muted">
        Edit slides, presenter notes, and workbook definitions. Set{" "}
        <code className="text-launch-soft">LAUNCH_ADMIN_SECRET</code> in the
        environment before using the API or this UI.
      </p>
      <AdminTokenGate />
      <h2 className="mb-2 text-lg font-semibold text-launch-secondary">
        Sessions
      </h2>
      <ul className="space-y-2">
        {EDITABLE_SESSION_IDS.map((id) => (
          <li key={id}>
            <Link
              href={`/admin/${id}`}
              className="text-launch-gold underline hover:no-underline"
            >
              {id}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-xs text-launch-muted">
        In development, normalized decks reload from disk automatically. For
        production builds, set{" "}
        <code className="text-launch-soft">LAUNCH_LOAD_SESSIONS_FROM_DISK=1</code>{" "}
        or rebuild after editing files on the server.
      </p>
    </div>
  );
}
