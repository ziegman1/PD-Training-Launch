import Link from "next/link";
import type { RegisteredSessionId } from "@/data/sessions";
import { HubCopyLinkStrip } from "@/components/launch/home/HubCopyLinkStrip";

type SessionRow = { id: RegisteredSessionId; title: string };

const linkBase =
  "flex min-h-[2.75rem] items-center justify-center rounded-lg border px-4 py-2.5 text-center text-sm font-semibold transition sm:text-base";

const linkPresentation =
  `${linkBase} border-launch-gold/45 bg-launch-gold/[0.12] text-launch-primary hover:border-launch-gold/70 hover:bg-launch-gold/[0.18]`;
const linkTrainer =
  `${linkBase} border-launch-steel/35 bg-launch-navy/50 text-launch-secondary hover:border-launch-steel/55 hover:text-launch-primary`;
const linkWorkbook =
  `${linkBase} border-launch-neutral/45 bg-black/25 text-launch-secondary hover:border-launch-steel/40 hover:text-launch-primary`;

const linkHint =
  "mt-2 text-center text-[0.6875rem] leading-snug text-launch-muted/90 sm:text-xs";

function HubLinkCell({
  href,
  className,
  label,
  hint,
}: {
  href: string;
  className: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col">
      <Link href={href} className={className}>
        {label}
      </Link>
      <p className={linkHint}>{hint}</p>
    </div>
  );
}

export function LaunchHomeHub({
  sessions,
  siteOrigin,
}: {
  sessions: SessionRow[];
  /** Absolute origin (e.g. https://your-deployment.vercel.app) for clipboard URLs */
  siteOrigin: string;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-12 pb-16 sm:px-8 sm:py-16">
      <header className="text-center">
        <p className="launch-eyebrow text-launch-gold/90">Team Expansion · Launch</p>
        <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-launch-primary sm:text-4xl">
          Training hub
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-launch-muted">
          Pick a session, then open the view you need. For live training, share only the{" "}
          <span className="text-launch-soft/95">presentation</span> link in Teams.
        </p>
      </header>

      <ul className="mt-12 flex flex-col gap-8" role="list">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="rounded-2xl border border-launch-steel/[0.12] bg-launch-navy/35 p-6 shadow-[inset_0_1px_0_0_rgba(175,201,217,0.06)] sm:p-7"
          >
            <h2 className="text-lg font-semibold text-launch-primary sm:text-xl">
              {s.title}
            </h2>
            <p className="mt-1 font-mono text-xs text-launch-muted/90">/{s.id}</p>

            <nav
              className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-3"
              aria-label={`Links for ${s.title}`}
            >
              <HubLinkCell
                href={`/present/${s.id}`}
                className={linkPresentation}
                label="Presentation"
                hint="Share this in Teams"
              />
              <HubLinkCell
                href={`/trainer/${s.id}`}
                className={linkTrainer}
                label="Trainer"
                hint="Private facilitator view"
              />
              <HubLinkCell
                href={`/workbook/${s.id}`}
                className={linkWorkbook}
                label="Workbook"
                hint="Send to participants"
              />
            </nav>
            <HubCopyLinkStrip siteOrigin={siteOrigin} sessionId={s.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
