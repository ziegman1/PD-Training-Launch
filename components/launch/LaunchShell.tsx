"use client";

/**
 * Do NOT use this for live training. Use /present and /trainer routes.
 *
 * @deprecated Dev-only legacy shell. In production this component renders a
 * blocking message unless NEXT_PUBLIC_LAUNCH_ALLOW_LEGACY_SHELL=true (escape
 * hatch for local/staging — still not for Teams screen share).
 *
 * Trainer notes and facilitator tools are never shown here; use
 * /trainer/[sessionId] in a separate window. This file previously combined
 * presentation + trainer overlay + mode toggles in one view — that pattern
 * is unsafe for Microsoft Teams delivery and has been removed.
 */

import { useEffect } from "react";
import {
  LaunchSessionProvider,
  useLaunchSession,
} from "@/contexts/LaunchSessionContext";
import type { LaunchSession } from "@/types/launch";
import { BaseLayout } from "@/components/launch/layout/BaseLayout";
import { PresentationNavDock } from "@/components/launch/presentation/PresentationNavDock";
import { Slide } from "@/components/launch/slide/Slide";
import {
  presentationPath,
  trainerSupportPath,
  participantWorkbookPath,
} from "@/lib/launchDelivery";

type LaunchShellProps = {
  session: LaunchSession;
};

function isLegacyShellRuntimeEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.NEXT_PUBLIC_LAUNCH_ALLOW_LEGACY_SHELL === "true";
}

function LegacyShellDisabled({ sessionId }: { sessionId: string }) {
  return (
    <BaseLayout className="flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <p className="max-w-md text-lg font-semibold text-launch-primary">
        Combined Launch shell is off in production
      </p>
      <p className="max-w-md text-sm leading-relaxed text-launch-muted">
        For Microsoft Teams, use separate browser windows: share only the
        presentation URL. Trainer notes stay on the trainer URL — never on the
        shared screen.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={presentationPath(sessionId)}
          className="rounded-full bg-launch-gold px-4 py-2 text-sm font-semibold text-launch-navy transition-colors hover:brightness-110"
        >
          Open presentation
        </a>
        <a
          href={trainerSupportPath(sessionId)}
          className="rounded-full border border-launch-steel/50 px-4 py-2 text-sm font-semibold text-launch-steel transition-colors hover:border-launch-steel hover:text-launch-primary"
        >
          Open trainer console
        </a>
        <a
          href={participantWorkbookPath(sessionId)}
          className="rounded-full border border-launch-neutral/50 px-4 py-2 text-sm font-semibold text-launch-muted transition-colors hover:text-launch-secondary"
        >
          Open workbook
        </a>
      </div>
    </BaseLayout>
  );
}

function LegacyShellBanner({ sessionId }: { sessionId: string }) {
  const escapeHatch = process.env.NODE_ENV === "production";
  const linkClass = escapeHatch
    ? "font-semibold text-launch-primary underline decoration-launch-steel/60 underline-offset-2"
    : "font-semibold text-amber-50 underline decoration-amber-400/80 underline-offset-2";
  return (
    <div
      className={`shrink-0 border-b px-4 py-2.5 text-center text-xs leading-snug md:text-sm ${
        escapeHatch
          ? "border-launch-red/40 bg-launch-red/[0.12] text-launch-secondary"
          : "border-amber-500/35 bg-amber-950/85 text-amber-100"
      }`}
    >
      <p>
        <strong>
          {escapeHatch ? "Legacy shell (escape hatch only)" : "DEV ONLY — legacy shell"}
        </strong>
        . Do NOT use for live training. Use{" "}
        <a href={presentationPath(sessionId)} className={linkClass}>
          {presentationPath(sessionId)}
        </a>{" "}
        and{" "}
        <a href={trainerSupportPath(sessionId)} className={linkClass}>
          {trainerSupportPath(sessionId)}
        </a>
        .
      </p>
    </div>
  );
}

function LaunchShellInner({ sessionId }: { sessionId: string }) {
  const { audienceSlide, goNext, goPrev } = useLaunchSession();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  if (!audienceSlide) {
    return (
      <BaseLayout className="flex items-center justify-center">
        <p className="text-launch-body text-launch-muted">
          This session has no slides.
        </p>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout className="relative flex min-h-dvh flex-col">
      <LegacyShellBanner sessionId={sessionId} />
      <p className="sr-only">
        Legacy dev shell: slide preview only. Use arrow keys or space to
        change slides. Open the trainer route for notes — not this window.
      </p>

      <div className="flex min-h-0 flex-1 flex-col">
        <Slide slide={audienceSlide} containerClassName="flex-1" />
        <PresentationNavDock />
      </div>
    </BaseLayout>
  );
}

export function LaunchShell({ session }: LaunchShellProps) {
  if (!isLegacyShellRuntimeEnabled()) {
    return <LegacyShellDisabled sessionId={session.sessionId} />;
  }

  return (
    <LaunchSessionProvider session={session}>
      <LaunchShellInner sessionId={session.sessionId} />
    </LaunchSessionProvider>
  );
}
