"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { LaunchSessionProvider } from "@/contexts/LaunchSessionContext";
import { Slide } from "@/components/launch/slide/Slide";
import { authoringSlideToLaunchSlide } from "@/lib/admin/authoringSlideToLaunchSlide";
import { mergeDeckPlacement } from "@/lib/deckPlacement";
import { toAudienceSlide } from "@/lib/audienceSlide";
import type { EditableSessionId } from "@/lib/admin/sessionFiles";
import type { DeckPlacement, DeckPlacementBox } from "@/types/launch";
import type { LaunchSession, LaunchSlide } from "@/types/launch";
import {
  PRESENTATION_GRID_WRAPPER_CLASS,
  PRESENTATION_STAGE_CLASS,
  PRESENTATION_STAGE_SHELL_CLASS,
} from "@/components/launch/slide/presentationSlideLayout";

type DragKind = "title" | "emphasis" | "bullets";

type Props = {
  sessionId: EditableSessionId;
  slide: Record<string, unknown>;
  /** When set, preview shows this normalized deck step (read-only). */
  builtSlidePreview?: LaunchSlide | null;
  builtStackStepIndex?: number;
  builtStackStepCount?: number;
  layoutEditMode: boolean;
  onDeckPlacementChange: (next: DeckPlacement) => void;
  onSlidePatch: (patch: Record<string, unknown>) => void;
};

export function AdminSlidePreviewPanel({
  sessionId,
  slide,
  builtSlidePreview,
  builtStackStepIndex,
  builtStackStepCount,
  layoutEditMode,
  onDeckPlacementChange,
  onSlidePatch,
}: Props) {
  const [viewOnly, setViewOnly] = useState(false);
  const fromAuthoring = useMemo(
    () => authoringSlideToLaunchSlide(slide),
    [slide],
  );
  const launchSlide = builtSlidePreview ?? fromAuthoring;
  const audienceSlide = useMemo(
    () => toAudienceSlide(launchSlide),
    [launchSlide],
  );

  const miniSession: LaunchSession = useMemo(
    () => ({
      sessionId: `${sessionId}-admin-preview`,
      programName: "",
      title: "",
      slides: [launchSlide],
    }),
    [sessionId, launchSlide],
  );

  const isBuiltStep = Boolean(builtSlidePreview);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const lastPtrRef = useRef<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState<DragKind | null>(null);

  type ResolvedDeck = ReturnType<typeof mergeDeckPlacement>;
  const merged = mergeDeckPlacement(launchSlide.deckPlacement);
  const [dragPreview, setDragPreview] = useState<ResolvedDeck | null>(null);
  const live: ResolvedDeck = dragPreview ?? merged;

  useEffect(() => {
    setDragPreview(null);
  }, [launchSlide.id, launchSlide.deckPlacement]);

  useEffect(() => {
    if (isBuiltStep) setViewOnly(true);
  }, [isBuiltStep]);

  const pctFromEvent = useCallback((clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * 100;
    const y = ((clientY - r.top) / r.height) * 100;
    return {
      xPct: Math.max(4, Math.min(96, x)),
      yPct: Math.max(4, Math.min(96, y)),
    };
  }, []);

  const flushPlacement = useCallback(
    (kind: DragKind, nextLive: ReturnType<typeof mergeDeckPlacement>) => {
      const box: DeckPlacementBox =
        kind === "title"
          ? nextLive.title
          : kind === "emphasis"
            ? nextLive.emphasis
            : {
                xPct: nextLive.bullets.xPct,
                yPct: nextLive.bullets.yPct,
              };
      const cur = mergeDeckPlacement(launchSlide.deckPlacement);
      onDeckPlacementChange({
        title: kind === "title" ? { ...cur.title, ...box } : cur.title,
        emphasis:
          kind === "emphasis" ? { ...cur.emphasis, ...box } : cur.emphasis,
        bullets:
          kind === "bullets"
            ? {
                xPct: box.xPct,
                yPct: box.yPct,
                widthPct: cur.bullets.widthPct,
              }
            : cur.bullets,
      });
    },
    [launchSlide.deckPlacement, onDeckPlacementChange],
  );

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      lastPtrRef.current = { x: e.clientX, y: e.clientY };
      const p = pctFromEvent(e.clientX, e.clientY);
      if (!p) return;
      const k = drag;
      const base = mergeDeckPlacement(launchSlide.deckPlacement);
      setDragPreview({
        title: k === "title" ? { ...base.title, ...p } : base.title,
        emphasis: k === "emphasis" ? { ...base.emphasis, ...p } : base.emphasis,
        bullets:
          k === "bullets"
            ? { ...base.bullets, ...p, widthPct: base.bullets.widthPct }
            : base.bullets,
      });
    };

    const end = (e: PointerEvent) => {
      const k = drag;
      const pt = lastPtrRef.current ?? { x: e.clientX, y: e.clientY };
      const p = pctFromEvent(pt.x, pt.y);
      setDrag(null);
      setDragPreview(null);
      if (!k || !p) return;
      const base = mergeDeckPlacement(launchSlide.deckPlacement);
      const nextLive = {
        title: k === "title" ? { ...base.title, ...p } : base.title,
        emphasis: k === "emphasis" ? { ...base.emphasis, ...p } : base.emphasis,
        bullets:
          k === "bullets"
            ? { ...base.bullets, ...p, widthPct: base.bullets.widthPct }
            : base.bullets,
      };
      flushPlacement(k, nextLive);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [drag, flushPlacement, launchSlide.deckPlacement, pctFromEvent]);

  const onHandleDown =
    (kind: DragKind) => (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      lastPtrRef.current = { x: e.clientX, y: e.clientY };
      setDrag(kind);
      const p = pctFromEvent(e.clientX, e.clientY);
      if (!p) return;
      const base = mergeDeckPlacement(launchSlide.deckPlacement);
      setDragPreview({
        title: kind === "title" ? { ...base.title, ...p } : base.title,
        emphasis:
          kind === "emphasis" ? { ...base.emphasis, ...p } : base.emphasis,
        bullets:
          kind === "bullets"
            ? { ...base.bullets, ...p, widthPct: base.bullets.widthPct }
            : base.bullets,
      });
    };

  return (
    <div className="flex flex-col gap-2 lg:sticky lg:top-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs font-medium uppercase tracking-wide text-launch-muted">
            Deck preview
          </p>
          {isBuiltStep &&
            builtStackStepIndex != null &&
            builtStackStepCount != null && (
              <p className="text-[10px] font-medium text-launch-gold/95">
                Built deck step {builtStackStepIndex + 1} of{" "}
                {builtStackStepCount} (read-only)
              </p>
            )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isBuiltStep && (
            <button
              type="button"
              onClick={() => setViewOnly((v) => !v)}
              className={`rounded px-2 py-0.5 text-[10px] font-medium ring-1 ${
                viewOnly
                  ? "bg-launch-gold/20 text-launch-gold ring-launch-gold/35"
                  : "bg-launch-navy/60 text-launch-muted ring-launch-steel/30 hover:text-launch-soft"
              }`}
            >
              {viewOnly ? "Click to edit" : "View only"}
            </button>
          )}
          {layoutEditMode && !isBuiltStep && (
            <span className="text-[10px] text-amber-200/90">
              Drag handles — title · subtitle · content
            </span>
          )}
        </div>
      </div>
      <div
        className="relative overflow-hidden rounded-xl border border-launch-steel/25 bg-[#1a222c]"
        style={{ height: "min(52vh, 440px)" }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <div ref={stageRef} className="relative min-h-full">
            <div
              className={`${PRESENTATION_GRID_WRAPPER_CLASS} min-h-full !max-w-none !px-2 !py-2`}
            >
              <div
                className={`${PRESENTATION_STAGE_SHELL_CLASS} !min-h-min !overflow-visible`}
              >
                <div
                  className={`${PRESENTATION_STAGE_CLASS} !min-h-min !overflow-visible`}
                >
                  <div className="relative z-0 flex min-h-min w-full flex-1 flex-col">
                    <LaunchSessionProvider
                      session={miniSession}
                      presentationLock
                      initialMode="presentation"
                    >
                      <Slide
                        slide={audienceSlide}
                        containerClassName="min-h-min w-full flex-1"
                        presentationScrollable
                        presentationInlineEdit={
                          isBuiltStep || viewOnly
                            ? undefined
                            : {
                                onPatch: onSlidePatch,
                                deckPlacementLive: live,
                              }
                        }
                      />
                    </LaunchSessionProvider>
                  </div>
                </div>
              </div>
            </div>

            {layoutEditMode && !isBuiltStep && (
              <div
                className="pointer-events-none absolute inset-0 z-20"
                aria-hidden
              >
                <button
                  type="button"
                  style={{
                    left: `${live.title.xPct}%`,
                    top: `${live.title.yPct}%`,
                  }}
                  className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded border-2 border-amber-400/90 bg-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-50 shadow-md active:cursor-grabbing"
                  onPointerDown={onHandleDown("title")}
                >
                  Title
                </button>

                <button
                  type="button"
                  style={{
                    left: `${live.emphasis.xPct}%`,
                    top: `${live.emphasis.yPct}%`,
                  }}
                  className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded border-2 border-cyan-400/90 bg-cyan-500/25 px-1.5 py-0.5 text-[10px] font-bold text-cyan-50 shadow-md active:cursor-grabbing"
                  onPointerDown={onHandleDown("emphasis")}
                >
                  Subtitle
                </button>

                <button
                  type="button"
                  style={{
                    left: `${live.bullets.xPct}%`,
                    top: `${live.bullets.yPct}%`,
                  }}
                  className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded border-2 border-lime-400/90 bg-lime-500/25 px-1.5 py-0.5 text-[10px] font-bold text-lime-50 shadow-md active:cursor-grabbing"
                  onPointerDown={onHandleDown("bullets")}
                >
                  Content
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
