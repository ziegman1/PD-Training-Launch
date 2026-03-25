"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CopyKind = "present" | "workbook" | "trainer";

type HubCopyLinkStripProps = {
  /** From server `headers()` / Vercel; may be empty — we fall back to `window.location.origin`. */
  siteOrigin: string;
  sessionId: string;
};

const FEEDBACK_MS = 2200;

function buildUrls(origin: string, sessionId: string) {
  const o = origin.replace(/\/$/, "");
  return {
    present: `${o}/present/${sessionId}`,
    workbook: `${o}/workbook/${sessionId}`,
    trainer: `${o}/trainer/${sessionId}`,
  };
}

export function HubCopyLinkStrip({ siteOrigin, sessionId }: HubCopyLinkStripProps) {
  const [clientOrigin, setClientOrigin] = useState("");
  const [copied, setCopied] = useState<CopyKind | null>(null);
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setClientOrigin(window.location.origin);
  }, []);

  const origin = siteOrigin || clientOrigin;

  const urls = useMemo(() => {
    if (!origin) {
      return { present: "", workbook: "", trainer: "" };
    }
    return buildUrls(origin, sessionId);
  }, [origin, sessionId]);

  useEffect(() => {
    return () => {
      if (clearRef.current) clearTimeout(clearRef.current);
    };
  }, []);

  const copy = useCallback(async (kind: CopyKind, url: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(kind);
      if (clearRef.current) clearTimeout(clearRef.current);
      clearRef.current = setTimeout(() => setCopied(null), FEEDBACK_MS);
    } catch {
      setCopied(null);
    }
  }, [origin]);

  const btnClass =
    "rounded-md border border-transparent px-2 py-1 text-left text-[0.8125rem] font-medium text-launch-steel/90 transition hover:border-launch-steel/20 hover:bg-launch-steel/[0.06] hover:text-launch-primary sm:text-sm";

  const activeClass = "border-launch-gold/35 bg-launch-gold/[0.1] text-launch-gold";

  const disabled = !origin;

  const Item = ({
    kind,
    label,
    url,
  }: {
    kind: CopyKind;
    label: string;
    url: string;
  }) => {
    const isCopied = copied === kind;
    return (
      <button
        type="button"
        disabled={disabled}
        title={`Copy ${label} URL`}
        className={`${btnClass} ${isCopied ? activeClass : ""} disabled:cursor-not-allowed disabled:opacity-40`}
        onClick={() => void copy(kind, url)}
      >
        {isCopied ? "Copied" : `Copy ${label}`}
      </button>
    );
  };

  return (
    <div className="mt-4 border-t border-launch-steel/[0.08] pt-4">
      <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-launch-muted/90">
        Quick copy
      </p>
      <p className="sr-only" aria-live="polite">
        {copied === "present" && "Presentation link copied"}
        {copied === "workbook" && "Workbook link copied"}
        {copied === "trainer" && "Trainer link copied"}
      </p>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2 sm:gap-x-2">
        <Item kind="present" label="presentation" url={urls.present} />
        <span className="hidden text-launch-neutral/40 sm:inline" aria-hidden>
          ·
        </span>
        <Item kind="workbook" label="workbook" url={urls.workbook} />
        <span className="hidden text-launch-neutral/40 sm:inline" aria-hidden>
          ·
        </span>
        <Item kind="trainer" label="trainer" url={urls.trainer} />
      </div>
    </div>
  );
}
