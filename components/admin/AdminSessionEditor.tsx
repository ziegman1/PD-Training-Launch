"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { EditableSessionId } from "@/lib/admin/sessionFiles";
import {
  adminAuthFetchHeaders,
  getStoredAdminToken,
} from "@/components/admin/adminTokenStorage";
import { AdminSlidePreviewPanel } from "@/components/admin/AdminSlidePreviewPanel";
import {
  DEFAULT_DECK_PLACEMENT,
  mergeDeckPlacement,
} from "@/lib/deckPlacement";
import type {
  DeckPlacement,
  LaunchSession,
  PresentationFontSizes,
} from "@/types/launch";
import { mergePresentationFontSizes } from "@/lib/presentationFontSizes";
import { SlideTablePasteField } from "@/components/admin/SlideTablePasteField";
import { PresentationFontSizeSelect } from "@/components/launch/slide/PresentationFontSizeSelect";
import { deckStackForAuthoringSlide } from "@/lib/admin/deckStack";

type AuthoringDoc = Record<string, unknown> & {
  slides: Record<string, unknown>[];
};

function adminCurrentSlideStorageKey(sid: string) {
  return `launch-admin-current-slide:${sid}`;
}

/** URL `slide` query first (shareable), then sessionStorage — survives refresh. */
function readPersistedAdminSlideId(sessionId: string): string {
  if (typeof window === "undefined") return "";
  try {
    const fromUrl = new URLSearchParams(window.location.search)
      .get("slide")
      ?.trim();
    if (fromUrl) return fromUrl;
    return (
      sessionStorage.getItem(adminCurrentSlideStorageKey(sessionId))?.trim() ??
      ""
    );
  } catch {
    return "";
  }
}

export function AdminSessionEditor({
  sessionId,
}: {
  sessionId: EditableSessionId;
}) {
  const [token, setToken] = useState("");
  useEffect(() => setToken(getStoredAdminToken()), []);

  const [doc, setDoc] = useState<AuthoringDoc | null>(null);
  const [normalizedSession, setNormalizedSession] =
    useState<LaunchSession | null>(null);
  const [normalizedErr, setNormalizedErr] = useState<string | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [stackPreviewIx, setStackPreviewIx] = useState<number | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"meta" | "slides" | "workbook">("slides");
  const [slideIx, setSlideIx] = useState(0);
  const [workbookJson, setWorkbookJson] = useState("");
  const [layoutEditMode, setLayoutEditMode] = useState(false);

  /** Latest authoring doc — updated in layout effect so Save reads commits from deck blur. */
  const docRef = useRef<AuthoringDoc | null>(null);
  useLayoutEffect(() => {
    docRef.current = doc;
  }, [doc]);

  /** Pointer only: KeyboardSensor used Space/Enter for drag and could fight form fields. */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const load = useCallback(
    async (opts?: { preserveSlideId?: string }) => {
      setLoadErr(null);
      setNormalizedErr(null);
      const [rAuth, rNorm] = await Promise.all([
        fetch(`/api/admin/session/${sessionId}/authoring`, {
          cache: "no-store",
          headers: adminAuthFetchHeaders(),
        }),
        fetch(`/api/admin/session/${sessionId}/normalized`, {
          cache: "no-store",
          headers: adminAuthFetchHeaders(),
        }),
      ]);
      if (!rAuth.ok) {
        setLoadErr(await rAuth.text());
        setDoc(null);
        setNormalizedSession(null);
        return;
      }
      const data = (await rAuth.json()) as AuthoringDoc;
      setDoc(data);
      setWorkbookJson(
        data.workbook != null
          ? `${JSON.stringify(data.workbook, null, 2)}\n`
          : "",
      );
      const keepId =
        opts?.preserveSlideId?.trim() ||
        readPersistedAdminSlideId(sessionId);
      if (keepId) {
        const ix = data.slides.findIndex(
          (s) => String((s as Record<string, unknown>).id) === keepId,
        );
        if (ix >= 0) {
          setSlideIx(ix);
        } else {
          setSlideIx(0);
          try {
            sessionStorage.removeItem(adminCurrentSlideStorageKey(sessionId));
            const url = new URL(window.location.href);
            url.searchParams.delete("slide");
            window.history.replaceState(
              null,
              "",
              `${url.pathname}${url.search}${url.hash}`,
            );
          } catch {
            /* ignore */
          }
        }
      } else {
        setSlideIx(0);
      }
      setStackPreviewIx(null);

      if (!rNorm.ok) {
        const j = (await rNorm.json().catch(() => ({}))) as {
          error?: string;
        };
        setNormalizedErr(j.error ?? (await rNorm.text()));
        setNormalizedSession(null);
      } else {
        const norm = (await rNorm.json()) as LaunchSession;
        setNormalizedSession(
          norm && Array.isArray(norm.slides) ? norm : null,
        );
      }
    },
    [sessionId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  /** Keep ?slide= and sessionStorage aligned so refresh stays on the same row. */
  useEffect(() => {
    if (!doc?.slides?.length) return;
    const safeIx = Math.max(
      0,
      Math.min(slideIx, doc.slides.length - 1),
    );
    const row = doc.slides[safeIx] as Record<string, unknown>;
    const id = String(row?.id ?? "");
    if (!id) return;
    try {
      sessionStorage.setItem(adminCurrentSlideStorageKey(sessionId), id);
      const url = new URL(window.location.href);
      if (url.searchParams.get("slide") !== id) {
        url.searchParams.set("slide", id);
        window.history.replaceState(
          null,
          "",
          `${url.pathname}${url.search}${url.hash}`,
        );
      }
    } catch {
      /* private mode / quota */
    }
  }, [doc, slideIx, sessionId]);

  const updateSlideAt = (index: number, patch: Record<string, unknown>) => {
    if (!doc) return;
    const slides = [...doc.slides];
    const cur = {
      ...(slides[index] as Record<string, unknown>),
      ...patch,
    };
    slides[index] = cur;
    setDoc({ ...doc, slides });
  };

  const updateSlide = (patch: Record<string, unknown>) => {
    updateSlideAt(slideIx, patch);
  };

  const slide = doc?.slides[slideIx] as Record<string, unknown> | undefined;

  const authoringSlideId = slide ? String(slide.id ?? "") : "";

  const deckStack = useMemo(
    () =>
      deckStackForAuthoringSlide(
        normalizedSession?.slides ?? [],
        authoringSlideId,
      ),
    [normalizedSession?.slides, authoringSlideId],
  );

  useEffect(() => {
    setStackPreviewIx(null);
  }, [slideIx, authoringSlideId]);

  const slideIds = useMemo(
    () =>
      doc
        ? doc.slides.map((s) => String((s as Record<string, unknown>).id))
        : [],
    [doc],
  );

  /** Unique non-empty `section` values across the session (for editor datalist). */
  const distinctSessionSections = useMemo(() => {
    if (!doc) return [];
    const seen = new Set<string>();
    for (const s of doc.slides) {
      const sec = (s as Record<string, unknown>).section;
      if (typeof sec === "string") {
        const t = sec.trim();
        if (t) seen.add(t);
      }
    }
    return [...seen].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
  }, [doc]);

  const bullets = useMemo(
    () =>
      slide && Array.isArray(slide.bullets)
        ? slide.bullets.map((x) => String(x))
        : [],
    [slide],
  );

  const bulletSortIds = useMemo(
    () => bullets.map((_, i) => `bu-${slideIx}-${i}`),
    [bullets.length, slideIx],
  );

  const roomPromptLines = useMemo(
    () =>
      slide && Array.isArray(slide.prompts)
        ? slide.prompts.map((x) => String(x))
        : [],
    [slide],
  );
  const roomPromptsNonEmpty = useMemo(
    () => roomPromptLines.filter((p) => p.trim()).length,
    [roomPromptLines],
  );

  const interactionLinesNonEmpty = useMemo(() => {
    const raw = String(slide?.interaction ?? "");
    return raw === ""
      ? 0
      : raw.split(/\r?\n/).filter((l) => l.trim().length > 0).length;
  }, [slide]);

  const deckMerged = useMemo(() => {
    if (!slide?.deckPlacement || typeof slide.deckPlacement !== "object") {
      return mergeDeckPlacement(undefined);
    }
    return mergeDeckPlacement(slide.deckPlacement as DeckPlacement);
  }, [slide]);

  const slidePresentationFontSizes = useMemo(():
    | PresentationFontSizes
    | undefined => {
    if (!slide) return undefined;
    const raw = slide.presentationFontSizes;
    if (raw == null || typeof raw !== "object") return undefined;
    return raw as PresentationFontSizes;
  }, [slide]);

  const patchSlideFont = (
    key: keyof PresentationFontSizes,
    rem: number | undefined,
  ) =>
    updateSlide({
      presentationFontSizes: mergePresentationFontSizes(
        slidePresentationFontSizes,
        key,
        rem,
      ),
    });

  const hasDeckPlacement = Boolean(
    slide &&
      slide.deckPlacement &&
      typeof slide.deckPlacement === "object" &&
      (Boolean(
        (slide.deckPlacement as DeckPlacement).title ??
          (slide.deckPlacement as DeckPlacement).emphasis ??
          (slide.deckPlacement as DeckPlacement).bullets,
      ) || Object.keys(slide.deckPlacement as object).length > 0),
  );

  const onAdminDragEnd = (event: DragEndEvent) => {
    if (!doc) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const aid = String(active.id);
    const oid = String(over.id);

    if (slideIds.includes(aid) && slideIds.includes(oid)) {
      const oldIndex = slideIds.indexOf(aid);
      const newIndex = slideIds.indexOf(oid);
      if (oldIndex < 0 || newIndex < 0) return;
      const curId = String(
        (doc.slides[slideIx] as Record<string, unknown>).id ?? "",
      );
      const nextSlides = arrayMove(doc.slides, oldIndex, newIndex);
      setDoc({ ...doc, slides: nextSlides });
      const nextIx = nextSlides.findIndex(
        (s) => String((s as Record<string, unknown>).id) === curId,
      );
      setSlideIx(nextIx >= 0 ? nextIx : 0);
      return;
    }

    if (bulletSortIds.includes(aid) && bulletSortIds.includes(oid)) {
      const oldIndex = bulletSortIds.indexOf(aid);
      const newIndex = bulletSortIds.indexOf(oid);
      if (oldIndex < 0 || newIndex < 0) return;
      updateSlide({ bullets: arrayMove(bullets, oldIndex, newIndex) });
    }
  };

  const addSlide = () => {
    if (!doc) return;
    const id = `slide-${Date.now()}`;
    const blank: Record<string, unknown> = {
      id,
      title: "New slide",
      bullets: [],
      trainerCadence: "",
      trainerTransition: "",
      trainerScriptNotes: "",
    };
    const insertAt = slideIx + 1;
    const slides = [
      ...doc.slides.slice(0, insertAt),
      blank,
      ...doc.slides.slice(insertAt),
    ];
    setDoc({ ...doc, slides });
    setSlideIx(insertAt);
  };

  const duplicateSlide = () => {
    if (!doc || !slide) return;
    const copy = JSON.parse(JSON.stringify(slide)) as Record<
      string,
      unknown
    >;
    copy.id = `${String(copy.id)}-copy-${Date.now()}`;
    delete copy.bulletRevealVisibleCount;
    delete copy.promptRevealVisibleCount;
    delete copy.interactionRevealVisibleCount;
    delete copy.progressiveReveal;
    delete copy.progressiveRevealLeadIn;
    const slides = [
      ...doc.slides.slice(0, slideIx + 1),
      copy,
      ...doc.slides.slice(slideIx + 1),
    ];
    setDoc({ ...doc, slides });
    setSlideIx(slideIx + 1);
  };

  const deleteSlide = () => {
    if (!doc || doc.slides.length < 2) {
      window.alert("Keep at least one slide in the authoring file.");
      return;
    }
    if (
      !window.confirm(
        `Delete slide "${String(slide?.id ?? "")}"? This cannot be undone until you re-save from git.`,
      )
    ) {
      return;
    }
    const slides = doc.slides.filter((_, i) => i !== slideIx);
    setDoc({ ...doc, slides });
    setSlideIx(Math.min(slideIx, slides.length - 1));
  };

  const setDeckPlacementFull = (next: DeckPlacement) => {
    updateSlide({
      deckPlacement: {
        title: next.title,
        emphasis: next.emphasis,
        bullets: next.bullets,
      },
    });
  };

  const save = async () => {
    flushSync(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    const docToSave = docRef.current;
    if (!docToSave) return;
    const ix = Math.min(
      slideIx,
      Math.max(0, docToSave.slides.length - 1),
    );
    const preserveSlideId = String(
      (docToSave.slides[ix] as Record<string, unknown> | undefined)?.id ?? "",
    );
    setSaveMsg(null);
    setSaveErr(null);
    const merged: Record<string, unknown> = { ...docToSave };
    if (workbookJson.trim()) {
      try {
        merged.workbook = JSON.parse(workbookJson) as unknown;
      } catch {
        setSaveErr("Workbook JSON is invalid.");
        return;
      }
    } else {
      delete merged.workbook;
    }
    const r = await fetch(`/api/admin/session/${sessionId}/authoring`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...adminAuthFetchHeaders(),
      },
      body: JSON.stringify(merged),
    });
    const j = (await r.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    if (!r.ok) {
      setSaveErr(j.error ?? (await r.text()));
      return;
    }
    setSaveMsg(j.message ?? "Saved.");
    await load({ preserveSlideId });
  };

  if (!token) {
    return (
      <p className="text-launch-muted">
        Set your admin token on the{" "}
        <Link href="/admin" className="text-launch-gold underline">
          admin home
        </Link>
        .
      </p>
    );
  }

  if (loadErr) {
    let loadErrMessage = loadErr;
    try {
      const j = JSON.parse(loadErr) as { error?: string };
      if (typeof j.error === "string") loadErrMessage = j.error;
    } catch {
      /* raw text */
    }
    const needsVercelSecret =
      loadErrMessage.includes("LAUNCH_ADMIN_SECRET") ||
      loadErrMessage.includes("Admin is disabled");

    return (
      <div className="max-w-xl space-y-4">
        <p className="text-red-300">{loadErrMessage}</p>
        {needsVercelSecret && (
          <div className="space-y-2 rounded-lg border border-launch-steel/30 bg-black/25 p-4 text-sm leading-relaxed text-launch-soft/95">
            <p className="font-medium text-launch-soft">Production (Vercel)</p>
            <ol className="list-decimal space-y-2 pl-5 text-launch-muted">
              <li>
                Open{" "}
                <a
                  className="text-launch-gold underline decoration-launch-gold/40 underline-offset-2"
                  href="https://vercel.com/docs/projects/environment-variables"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Environment Variables
                </a>{" "}
                for this project.
              </li>
              <li>
                Add <code className="text-launch-soft/90">LAUNCH_ADMIN_SECRET</code>{" "}
                with a long random value (e.g.{" "}
                <code className="text-launch-soft/90">openssl rand -hex 32</code>
                ).
              </li>
              <li>Apply to Production and redeploy (or wait for the next deploy).</li>
              <li>
                On{" "}
                <Link href="/admin" className="text-launch-gold underline">
                  Admin home
                </Link>
                , paste the <strong>same</strong> value as your token so API calls
                authenticate.
              </li>
            </ol>
          </div>
        )}
        <button
          type="button"
          onClick={() => void load()}
          className="rounded border border-launch-steel/40 px-3 py-1"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!doc) {
    return <p className="text-launch-muted">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-launch-steel/25 pb-4">
        {(["meta", "slides", "workbook"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded px-3 py-1.5 text-sm capitalize ${
              tab === t
                ? "bg-launch-gold/20 text-launch-gold"
                : "text-launch-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "meta" && (
        <div className="grid gap-4">
          <Field
            label="Title"
            value={String(doc.title ?? "")}
            onChange={(v) => setDoc({ ...doc, title: v })}
          />
          <Field
            label="Short title"
            value={String(doc.shortTitle ?? "")}
            onChange={(v) => setDoc({ ...doc, shortTitle: v })}
          />
          <Field
            label="Theme"
            value={String(doc.theme ?? "")}
            onChange={(v) => setDoc({ ...doc, theme: v })}
          />
          <label className="block">
            <span className="text-sm text-launch-muted">Objective</span>
            <textarea
              value={String(doc.objective ?? "")}
              onChange={(e) =>
                setDoc({ ...doc, objective: e.target.value })
              }
              className="mt-1 w-full rounded border border-launch-steel/30 bg-black/30 p-2 text-sm"
              rows={4}
            />
          </label>
        </div>
      )}

      {tab === "slides" && slide && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onAdminDragEnd}
        >
          <div className="space-y-6">
            <div className="sticky top-4 z-20 w-full self-start">
              <div className="max-h-[calc(100vh-2rem)] overflow-y-auto">
                <AdminSlidePreviewPanel
                  sessionId={sessionId}
                  slide={slide}
                  builtSlidePreview={
                    stackPreviewIx != null && deckStack[stackPreviewIx]
                      ? deckStack[stackPreviewIx]
                      : null
                  }
                  builtStackStepIndex={
                    stackPreviewIx != null ? stackPreviewIx : undefined
                  }
                  builtStackStepCount={
                    deckStack.length > 0 ? deckStack.length : undefined
                  }
                  layoutEditMode={layoutEditMode}
                  onDeckPlacementChange={setDeckPlacementFull}
                  onSlidePatch={(patch) => updateSlide(patch)}
                />
              </div>
            </div>

            <div className="w-full min-w-0 space-y-3">
                <div className="rounded border border-launch-steel/25 bg-[#151b22] p-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-launch-muted">
                      Built deck stack
                    </span>
                    {stackPreviewIx != null && (
                      <button
                        type="button"
                        onClick={() => setStackPreviewIx(null)}
                        className="text-[10px] font-medium text-launch-gold underline decoration-launch-gold/40 underline-offset-2 hover:text-launch-gold"
                      >
                        Clear step preview → authoring
                      </button>
                    )}
                  </div>
                  {normalizedErr && (
                    <p className="mt-1 text-[11px] text-amber-200/90">
                      Could not load normalized deck: {normalizedErr}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] leading-snug text-launch-muted">
                    Steps are from the saved{" "}
                    <code className="text-launch-soft/90">
                      {sessionId}.json
                    </code>{" "}
                    after normalize. Save authoring to refresh.
                  </p>
                  {deckStack.length === 0 && !normalizedErr && (
                    <p className="mt-2 text-[11px] text-launch-muted">
                      No matching rows for this slide id (new id, or normalize
                      not run yet).
                    </p>
                  )}
                  {deckStack.length > 0 && (
                    <ul className="mt-2 max-h-[min(28vh,220px)] space-y-1 overflow-y-auto rounded border border-launch-steel/15 p-1">
                      {deckStack.map((s, i) => {
                        const selected = stackPreviewIx === i;
                        const b =
                          s.bulletRevealVisibleCount === undefined
                            ? "all"
                            : String(s.bulletRevealVisibleCount);
                        const p =
                          s.promptRevealVisibleCount === undefined
                            ? "all"
                            : String(s.promptRevealVisibleCount);
                        const ix =
                          s.interactionRevealVisibleCount === undefined
                            ? "all"
                            : String(s.interactionRevealVisibleCount);
                        return (
                          <li key={`${s.id}-${i}`}>
                            <button
                              type="button"
                              onClick={() =>
                                setStackPreviewIx(selected ? null : i)
                              }
                              className={`w-full rounded px-2 py-1.5 text-left text-[11px] leading-snug ring-1 transition-colors ${
                                selected
                                  ? "bg-launch-gold/15 text-launch-soft ring-launch-gold/45"
                                  : "bg-black/25 text-launch-muted ring-launch-steel/20 hover:bg-black/40 hover:text-launch-soft"
                              }`}
                            >
                              <span className="font-mono text-[10px] text-launch-gold/90">
                                {i + 1}. {s.id}
                              </span>
                              <span className="mt-0.5 block text-launch-muted">
                                bullets visible: {b} · prompts visible: {p} ·
                                Together lines: {ix}
                                {s.emphasis ? " · subtitle on slide" : ""}
                                {s.scripture ? " · scripture on slide" : ""}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={addSlide}
                    className="rounded-lg border border-launch-steel/35 bg-launch-navy/40 px-3 py-1.5 text-sm text-launch-soft hover:bg-launch-navy/60"
                  >
                    Add slide
                  </button>
                  <button
                    type="button"
                    onClick={duplicateSlide}
                    className="rounded-lg border border-launch-steel/35 bg-launch-navy/40 px-3 py-1.5 text-sm text-launch-soft hover:bg-launch-navy/60"
                  >
                    Duplicate slide
                  </button>
                  <button
                    type="button"
                    onClick={deleteSlide}
                    className="rounded-lg border border-red-400/35 bg-red-950/30 px-3 py-1.5 text-sm text-red-200 hover:bg-red-950/50"
                  >
                    Delete slide
                  </button>
                </div>

                <div>
                  <span className="text-sm text-launch-muted">
                    Slides (drag to reorder deck)
                  </span>
                  <SortableContext
                    items={slideIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="mt-1 max-h-[min(40vh,320px)] space-y-1 overflow-y-auto rounded border border-launch-steel/20 p-1 lg:max-h-[min(52vh,400px)]">
                      {doc.slides.map((s, i) => (
                        <SortableSlideRow
                          key={String((s as Record<string, unknown>).id)}
                          id={String((s as Record<string, unknown>).id)}
                          selected={i === slideIx}
                          title={String(
                            (s as Record<string, unknown>).title ?? "",
                          )}
                          onSelect={() => setSlideIx(i)}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </div>
            </div>

            <div className="w-full min-w-0 space-y-4">
              <div className="rounded border border-launch-steel/25 bg-black/20 p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLayoutEditMode((v) => !v)}
                  className={`rounded px-3 py-1 text-xs font-medium ${
                    layoutEditMode
                      ? "bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/50"
                      : "bg-launch-navy/50 text-launch-muted ring-1 ring-launch-steel/30"
                  }`}
                >
                  {layoutEditMode
                    ? "Done moving title / subtitle / content"
                    : "Edit positions on preview (drag)"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSlide({
                      deckPlacement: {
                        title: { ...DEFAULT_DECK_PLACEMENT.title },
                        emphasis: { ...DEFAULT_DECK_PLACEMENT.emphasis },
                        bullets: { ...DEFAULT_DECK_PLACEMENT.bullets },
                      },
                    })
                  }
                  className="rounded px-2 py-1 text-xs text-launch-muted ring-1 ring-launch-steel/25 hover:text-launch-soft"
                >
                  Apply default % layout
                </button>
                <button
                  type="button"
                  onClick={() => updateSlide({ deckPlacement: undefined })}
                  className="rounded px-2 py-1 text-xs text-launch-muted ring-1 ring-launch-steel/25 hover:text-launch-soft"
                >
                  Clear custom layout
                </button>
              </div>
              {hasDeckPlacement && (
                <p className="text-[11px] leading-snug text-launch-muted">
                  Custom layout is active on this slide. Adjust content block
                  width with the field below (presentation lower stack).
                </p>
              )}
              {hasDeckPlacement && (
                <Field
                  label="Content block width % (deck)"
                  value={String(Math.round(deckMerged.bullets.widthPct))}
                  onChange={(v) => {
                    const n = Number(v);
                    if (!Number.isFinite(n)) return;
                    const w = Math.max(25, Math.min(100, Math.round(n)));
                    const cur = mergeDeckPlacement(
                      slide.deckPlacement as DeckPlacement | undefined,
                    );
                    updateSlide({
                      deckPlacement: {
                        title: cur.title,
                        emphasis: cur.emphasis,
                        bullets: { ...cur.bullets, widthPct: w },
                      },
                    });
                  }}
                />
              )}
            </div>

            <Field
              label="Slide id"
              value={String(slide.id ?? "")}
              onChange={(v) => {
                const id = v.trim();
                if (!id) return;
                updateSlide({ id });
              }}
            />
            <Field
              label="Title"
              value={String(slide.title ?? "")}
              onChange={(v) => updateSlide({ title: v })}
              labelExtra={
                <PresentationFontSizeSelect
                  field="titleRem"
                  ariaLabel="Title font size on deck"
                  value={slidePresentationFontSizes?.titleRem}
                  onChange={(r) => patchSlideFont("titleRem", r)}
                />
              }
            />
            <label className="block">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-launch-muted">Section</span>
                <PresentationFontSizeSelect
                  field="sectionRem"
                  ariaLabel="Section label font size on deck"
                  value={slidePresentationFontSizes?.sectionRem}
                  onChange={(r) => patchSlideFont("sectionRem", r)}
                />
              </span>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <input
                  type="text"
                  list="launch-session-section-picks"
                  value={String(slide.section ?? "")}
                  onChange={(e) =>
                    updateSlide({
                      section: e.target.value
                        ? e.target.value
                        : undefined,
                    })
                  }
                  placeholder={
                    distinctSessionSections.length
                      ? "Type or use list →"
                      : "Section label (optional)"
                  }
                  className="w-full min-w-0 flex-1 rounded border border-launch-steel/30 bg-black/30 p-2 text-sm"
                  autoComplete="off"
                />
                <select
                  className="w-full shrink-0 rounded border border-launch-steel/30 bg-black/30 p-2 text-sm text-launch-soft sm:w-72"
                  aria-label="Set section to one already used in this session"
                  value=""
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) {
                      updateSlide({ section: v });
                      e.currentTarget.selectedIndex = 0;
                    }
                  }}
                >
                  <option value="">
                    {distinctSessionSections.length
                      ? "All sections in session…"
                      : "No sections yet in session"}
                  </option>
                  {distinctSessionSections.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <datalist id="launch-session-section-picks">
                {distinctSessionSections.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </label>
            <Field
              label="Emphasis (subtitle on deck)"
              value={String(slide.emphasis ?? "")}
              onChange={(v) => updateSlide({ emphasis: v || undefined })}
              labelExtra={
                <PresentationFontSizeSelect
                  field="emphasisRem"
                  ariaLabel="Emphasis font size on deck"
                  value={slidePresentationFontSizes?.emphasisRem}
                  onChange={(r) => patchSlideFont("emphasisRem", r)}
                />
              }
            />
            <label
              className={`flex cursor-pointer items-start gap-2 rounded border border-launch-steel/20 px-2 py-2 ${
                String(slide.emphasis ?? "").trim()
                  ? "bg-black/20"
                  : "cursor-not-allowed bg-black/10 opacity-60"
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 shrink-0"
                checked={slide.emphasisWithTitle === true}
                disabled={!String(slide.emphasis ?? "").trim()}
                onChange={(e) =>
                  updateSlide({
                    emphasisWithTitle: e.target.checked ? true : undefined,
                  })
                }
              />
              <span className="min-w-0 text-sm leading-snug">
                <span className="font-medium text-launch-soft">
                  Show subtitle on first slide display (with title)
                </span>
                <span className="mt-0.5 block text-[11px] text-launch-muted">
                  When on, the first deck step for this slide shows title and subtitle
                  together—no separate title-only step before the subtitle. When off, the
                  deck can show title only first, then reveal subtitle (then scripture, then
                  lists). Save & regenerate to update the deck.
                  {String(slide.emphasis ?? "").trim() ? "" : " Add subtitle text to enable."}
                </span>
              </span>
            </label>
            <div
              className={`rounded border border-launch-steel/20 px-2 py-2 ${
                String(slide.emphasis ?? "").trim()
                  ? "bg-black/20"
                  : "bg-black/10 opacity-60"
              }`}
            >
              <p className="text-sm font-medium text-launch-soft">
                Reveal first list batch with subtitle
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-launch-muted">
                For progressive bullets, room prompts, or Together lines, show the first
                batch on the same advance as the subtitle (instead of only after
                subtitle/scripture lead beats). Respects per-step counts. Save & regenerate.
              </p>
              <label className="mt-2 flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 shrink-0"
                  checked={slide.bulletRevealWithSubtitle === true}
                  disabled={
                    !String(slide.emphasis ?? "").trim() ||
                    bullets.filter((b) => b.trim()).length < 1 ||
                    Boolean(
                      String(slide.continuationGroup ?? "").trim() &&
                        bullets.filter((b) => b.trim()).length >= 1,
                    )
                  }
                  onChange={(e) =>
                    updateSlide({
                      bulletRevealWithSubtitle: e.target.checked
                        ? true
                        : undefined,
                    })
                  }
                />
                <span className="min-w-0 text-sm leading-snug text-launch-soft">
                  Bullets with subtitle
                  <span className="mt-0.5 block text-[11px] font-normal text-launch-muted">
                    Not used when a continuation group shows all bullets at once.
                  </span>
                </span>
              </label>
              <label className="mt-2 flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 shrink-0"
                  checked={slide.promptRevealWithSubtitle === true}
                  disabled={
                    !String(slide.emphasis ?? "").trim() ||
                    roomPromptsNonEmpty < 1
                  }
                  onChange={(e) =>
                    updateSlide({
                      promptRevealWithSubtitle: e.target.checked
                        ? true
                        : undefined,
                    })
                  }
                />
                <span className="min-w-0 text-sm leading-snug text-launch-soft">
                  Room prompts with subtitle
                </span>
              </label>
              <label className="mt-2 flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 shrink-0"
                  checked={slide.interactionRevealWithSubtitle === true}
                  disabled={
                    !String(slide.emphasis ?? "").trim() ||
                    interactionLinesNonEmpty < 1
                  }
                  onChange={(e) =>
                    updateSlide({
                      interactionRevealWithSubtitle: e.target.checked
                        ? true
                        : undefined,
                    })
                  }
                />
                <span className="min-w-0 text-sm leading-snug text-launch-soft">
                  Interaction (Together) with subtitle
                  <span className="mt-0.5 block text-[11px] font-normal text-launch-muted">
                    Stepping runs after bullets and room prompts in the deck order.
                  </span>
                </span>
              </label>
              {!String(slide.emphasis ?? "").trim() ? (
                <p className="mt-2 text-[11px] text-launch-muted">
                  Add subtitle (emphasis) text to enable these options.
                </p>
              ) : null}
            </div>
            <label className="block">
              <span className="text-sm text-launch-muted">
                Table (optional)
              </span>
              <p className="mt-0.5 text-[11px] leading-snug text-launch-muted/90">
                Paste from Excel, Word, or Google Sheets to keep rows and columns.
                Header row and first row use the same typography as scripture. Uses
                the scripture font size control below.
              </p>
              <div className="mt-1">
                <SlideTablePasteField
                  value={String(slide.slideTableHtml ?? "")}
                  onChange={(html) =>
                    updateSlide({ slideTableHtml: html })
                  }
                />
              </div>
            </label>
            <Field
              label="Scripture"
              value={String(slide.scripture ?? "")}
              onChange={(v) => updateSlide({ scripture: v || undefined })}
              labelExtra={
                <PresentationFontSizeSelect
                  field="scriptureRem"
                  ariaLabel="Scripture font size on deck"
                  value={slidePresentationFontSizes?.scriptureRem}
                  onChange={(r) => patchSlideFont("scriptureRem", r)}
                />
              }
            />
            <label className="block">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-launch-muted">
                  Bullets (one per line)
                </span>
                <PresentationFontSizeSelect
                  field="bulletsRem"
                  ariaLabel="Bullet list font size on deck"
                  value={slidePresentationFontSizes?.bulletsRem}
                  onChange={(r) => patchSlideFont("bulletsRem", r)}
                />
              </span>
              <textarea
                value={bullets.join("\n")}
                onChange={(e) => {
                  const raw = e.target.value;
                  updateSlide({
                    bullets: raw === "" ? [] : raw.split(/\r?\n/),
                  });
                }}
                className="mt-1 w-full rounded border border-launch-steel/30 bg-black/30 p-2 font-mono text-sm"
                rows={6}
              />
              <div className="mt-3 block">
                <span className="text-sm text-launch-muted">
                  Bullets per reveal step
                </span>
                <p className="mt-0.5 text-[11px] leading-snug text-launch-muted/90">
                  For slides that expand into multiple deck steps, how many bullet lines to show at
                  each advance (default 1). Example: 2 shows two new bullets per click. Max 20. Not
                  used when this slide uses continuation grouping (all bullets show at once). Save
                  & regenerate.
                </p>
                <input
                  type="number"
                  min={1}
                  max={20}
                  step={1}
                  disabled={bullets.filter((b) => b.trim()).length < 2}
                  value={(() => {
                    const raw = slide.progressiveBulletBatchSize;
                    if (
                      typeof raw === "number" &&
                      Number.isFinite(raw) &&
                      raw > 1
                    ) {
                      return String(Math.min(20, Math.max(1, Math.round(raw))));
                    }
                    return "1";
                  })()}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (!Number.isFinite(n)) return;
                    const c = Math.min(20, Math.max(1, n));
                    updateSlide({
                      progressiveBulletBatchSize:
                        c <= 1 ? undefined : c,
                    });
                  }}
                  className="mt-1 w-24 rounded border border-launch-steel/30 bg-black/30 px-2 py-1.5 font-mono text-sm disabled:cursor-not-allowed disabled:opacity-50"
                />
                {bullets.filter((b) => b.trim()).length < 2 ? (
                  <p className="mt-1 text-[11px] text-launch-muted">
                    Add at least two non-empty bullet lines to enable.
                  </p>
                ) : null}
              </div>
            </label>
            {bullets.length > 1 && (
              <div>
                <span className="text-sm text-launch-muted">
                  Reorder bullets (drag handles)
                </span>
                <SortableContext
                  items={bulletSortIds}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="mt-1 space-y-1 rounded border border-launch-steel/20 p-1">
                    {bullets.map((line, i) => (
                      <SortableBulletRow
                        key={bulletSortIds[i]}
                        id={bulletSortIds[i]}
                        text={line}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </div>
            )}
            <label className="block">
              <span className="text-sm text-launch-muted">
                Presenter — cadence (spoken)
              </span>
              <textarea
                value={String(slide.trainerCadence ?? "")}
                onChange={(e) =>
                  updateSlide({ trainerCadence: e.target.value })
                }
                className="mt-1 w-full rounded border border-launch-steel/30 bg-black/30 p-2 text-sm"
                rows={6}
              />
            </label>
            <label className="block">
              <span className="text-sm text-launch-muted">
                Presenter — transition
              </span>
              <textarea
                value={String(slide.trainerTransition ?? "")}
                onChange={(e) =>
                  updateSlide({ trainerTransition: e.target.value })
                }
                className="mt-1 w-full rounded border border-launch-steel/30 bg-black/30 p-2 text-sm"
                rows={3}
              />
            </label>
            <label className="block">
              <span className="text-sm text-launch-muted">
                Presenter — script notes (internal)
              </span>
              <textarea
                value={String(slide.trainerScriptNotes ?? "")}
                onChange={(e) =>
                  updateSlide({ trainerScriptNotes: e.target.value })
                }
                className="mt-1 w-full rounded border border-launch-steel/30 bg-black/30 p-2 text-sm"
                rows={5}
              />
            </label>
            <label className="block">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-launch-muted">
                  Interaction / participant prompt
                </span>
                <PresentationFontSizeSelect
                  field="interactionRem"
                  ariaLabel="Interaction (Together box) font size on deck"
                  value={slidePresentationFontSizes?.interactionRem}
                  onChange={(r) => patchSlideFont("interactionRem", r)}
                />
              </span>
              <textarea
                value={String(slide.interaction ?? "")}
                onChange={(e) =>
                  updateSlide({
                    interaction: e.target.value || undefined,
                  })
                }
                className="mt-1 w-full rounded border border-launch-steel/30 bg-black/30 p-2 text-sm"
                rows={4}
              />
              <div className="mt-3 block">
                <span className="text-sm text-launch-muted">
                  Together / interaction lines per reveal step
                </span>
                <p className="mt-0.5 text-[11px] leading-snug text-launch-muted/90">
                  Non-empty lines (one per row) reveal like room prompts, after bullets and
                  room prompts in the deck. Default 1 line per advance. Set to the line count
                  to show all on the first interaction beat. Max 20. Save & regenerate.
                </p>
                <input
                  type="number"
                  min={1}
                  max={20}
                  step={1}
                  disabled={interactionLinesNonEmpty < 2}
                  value={(() => {
                    const raw = slide.progressiveInteractionBatchSize;
                    if (
                      typeof raw === "number" &&
                      Number.isFinite(raw) &&
                      raw > 1
                    ) {
                      return String(Math.min(20, Math.max(1, Math.round(raw))));
                    }
                    return "1";
                  })()}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (!Number.isFinite(n)) return;
                    const c = Math.min(20, Math.max(1, n));
                    updateSlide({
                      progressiveInteractionBatchSize:
                        c <= 1 ? undefined : c,
                    });
                  }}
                  className="mt-1 w-24 rounded border border-launch-steel/30 bg-black/30 px-2 py-1.5 font-mono text-sm disabled:cursor-not-allowed disabled:opacity-50"
                />
                {interactionLinesNonEmpty < 2 ? (
                  <p className="mt-1 text-[11px] text-launch-muted">
                    Add at least two non-empty lines in interaction to enable.
                  </p>
                ) : null}
              </div>
            </label>
            <label className="block">
              <span className="text-sm text-launch-muted">
                Interaction type
              </span>
              <select
                value={String(slide.interactionType ?? "")}
                onChange={(e) =>
                  updateSlide({
                    interactionType: e.target.value || undefined,
                  })
                }
                className="mt-1 w-full rounded border border-launch-steel/30 bg-black/30 p-2 text-sm"
              >
                <option value="">(omit)</option>
                <option value="none">none</option>
                <option value="reflection">reflection</option>
                <option value="fillIn">fillIn</option>
                <option value="exercise">exercise</option>
                <option value="discussion">discussion</option>
                <option value="pairShare">pairShare</option>
                <option value="prayer">prayer</option>
                <option value="bibleStudy">bibleStudy</option>
              </select>
            </label>
            <Field
              label="Timing"
              value={String(slide.timing ?? "")}
              onChange={(v) => updateSlide({ timing: v || undefined })}
            />
            <Field
              label="Transition cue"
              value={String(slide.transitionCue ?? "")}
              onChange={(v) =>
                updateSlide({ transitionCue: v || undefined })
              }
            />
            <Field
              label="Discussion handoff"
              value={String(slide.discussionHandoff ?? "")}
              onChange={(v) =>
                updateSlide({ discussionHandoff: v || undefined })
              }
            />
            <label className="block">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-launch-muted">
                  Room prompts (one per line)
                </span>
                <PresentationFontSizeSelect
                  field="promptsRem"
                  ariaLabel="Room prompts font size on deck"
                  value={slidePresentationFontSizes?.promptsRem}
                  onChange={(r) => patchSlideFont("promptsRem", r)}
                />
              </span>
              <textarea
                value={
                  Array.isArray(slide.prompts)
                    ? slide.prompts.map(String).join("\n")
                    : ""
                }
                onChange={(e) => {
                  const raw = e.target.value;
                  const lines = raw === "" ? [] : raw.split(/\r?\n/);
                  updateSlide({
                    prompts: lines.length ? lines : undefined,
                  });
                }}
                className="mt-1 w-full rounded border border-launch-steel/30 bg-black/30 p-2 text-sm"
                rows={4}
              />
              <div className="mt-3 block">
                <span className="text-sm text-launch-muted">
                  Room prompts per reveal step
                </span>
                <p className="mt-0.5 text-[11px] leading-snug text-launch-muted/90">
                  When this slide expands into multiple deck steps for room prompts, how many lines to
                  show per advance (default 1). Set to the number of prompts to show them all on the
                  first prompt beat after lead-in. Max 20. Save & regenerate.
                </p>
                <input
                  type="number"
                  min={1}
                  max={20}
                  step={1}
                  disabled={roomPromptsNonEmpty < 2}
                  value={(() => {
                    const raw = slide.progressivePromptBatchSize;
                    if (
                      typeof raw === "number" &&
                      Number.isFinite(raw) &&
                      raw > 1
                    ) {
                      return String(Math.min(20, Math.max(1, Math.round(raw))));
                    }
                    return "1";
                  })()}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (!Number.isFinite(n)) return;
                    const c = Math.min(20, Math.max(1, n));
                    updateSlide({
                      progressivePromptBatchSize: c <= 1 ? undefined : c,
                    });
                  }}
                  className="mt-1 w-24 rounded border border-launch-steel/30 bg-black/30 px-2 py-1.5 font-mono text-sm disabled:cursor-not-allowed disabled:opacity-50"
                />
                {roomPromptsNonEmpty < 2 ? (
                  <p className="mt-1 text-[11px] text-launch-muted">
                    Add at least two non-empty room prompt lines to enable.
                  </p>
                ) : null}
              </div>
            </label>
            <Field
              label="Continuation group (optional)"
              value={String(slide.continuationGroup ?? "")}
              onChange={(v) =>
                updateSlide({ continuationGroup: v || undefined })
              }
            />
            </div>
          </div>
        </DndContext>
      )}

      {tab === "workbook" && (
        <label className="block">
          <span className="text-sm text-launch-muted">
            Workbook JSON (sections, reflection prompts, fill-ins, etc.)
          </span>
          <textarea
            value={workbookJson}
            onChange={(e) => setWorkbookJson(e.target.value)}
            className="mt-1 w-full rounded border border-launch-steel/30 bg-black/30 p-2 font-mono text-xs leading-relaxed"
            rows={24}
            spellCheck={false}
          />
        </label>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-launch-steel/25 pt-4">
        <button
          type="button"
          onClick={() => void save()}
          className="rounded-lg bg-launch-gold/90 px-4 py-2 text-sm font-semibold text-launch-navy"
        >
          Save &amp; regenerate deck
        </button>
        {saveMsg && (
          <span className="text-sm text-launch-soft">{saveMsg}</span>
        )}
        {saveErr && (
          <span className="text-sm text-red-300">{saveErr}</span>
        )}
      </div>
    </div>
  );
}

function SortableSlideRow({
  id,
  selected,
  title,
  onSelect,
}: {
  id: string;
  selected: boolean;
  title: string;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.82 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="list-none">
      <div
        className={`flex items-center gap-1 rounded border px-1 py-1 text-sm ${
          selected
            ? "border-launch-gold/45 bg-launch-gold/12"
            : "border-launch-steel/25 bg-black/25"
        }`}
      >
        <button
          type="button"
          className="touch-none cursor-grab rounded px-1 text-launch-muted hover:text-launch-soft active:cursor-grabbing"
          aria-label="Reorder slide"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 truncate text-left"
        >
          <span className="font-mono text-xs text-launch-gold/90">{id}</span>
          <span className="text-launch-muted"> · </span>
          <span className="text-launch-soft/95">{title || "(no title)"}</span>
        </button>
      </div>
    </li>
  );
}

function SortableBulletRow({ id, text }: { id: string; text: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="list-none">
      <div className="flex items-start gap-1 rounded border border-launch-steel/20 bg-black/20 px-1 py-1">
        <button
          type="button"
          className="mt-0.5 touch-none cursor-grab text-launch-muted hover:text-launch-soft active:cursor-grabbing"
          aria-label="Reorder bullet"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <span className="min-w-0 flex-1 text-xs leading-snug text-launch-secondary">
          {text}
        </span>
      </div>
    </li>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
  labelExtra,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  labelExtra?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-launch-muted">{label}</span>
        {labelExtra}
      </span>
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded border border-launch-steel/30 bg-black/30 p-2 text-sm read-only:opacity-70"
      />
    </label>
  );
}
