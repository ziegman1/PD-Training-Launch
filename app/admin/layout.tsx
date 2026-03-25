import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh text-launch-primary">
      <header className="border-b border-launch-steel/20 px-4 py-3">
        <Link href="/admin" className="font-semibold text-launch-gold">
          Launch admin
        </Link>
        <span className="ml-4 text-sm text-launch-muted">
          Edits write{" "}
          <code className="text-launch-soft/90">*.authoring.json</code> and
          re-run normalize (
          <code className="text-launch-soft/90">session-*.json</code>).
        </span>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
