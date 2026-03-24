"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AudienceLaunchSlide,
  LaunchMode,
  LaunchSession,
  LaunchSlide,
} from "@/types/launch";
import { toAudienceSlide } from "@/lib/audienceSlide";
import {
  deckChannelName,
  readStoredDeckIndex,
  writeStoredDeckIndex,
  type DeckBroadcastPayload,
} from "@/lib/deckBroadcast";

type ParticipantAnswers = Record<string, string>;

type LaunchSessionContextValue = {
  mode: LaunchMode;
  setMode: (m: LaunchMode) => void;
  /** True on `/present` — mode cannot leave presentation; trainer UI must not render. */
  presentationLock: boolean;
  session: LaunchSession;
  slideIndex: number;
  /** Full slide (trainer console / authoring only). */
  slide: LaunchSlide | undefined;
  /** Same index as `slide` with trainer-only fields removed — use for `Slide` / `SlideContent`. */
  audienceSlide: AudienceLaunchSlide | undefined;
  totalSlides: number;
  slideTransitionSign: 1 | -1;
  goNext: () => void;
  goPrev: () => void;
  setSlideIndex: (i: number) => void;
  participantAnswers: Record<string, ParticipantAnswers>;
  setParticipantAnswer: (
    slideId: string,
    fieldId: string,
    value: string,
  ) => void;
};

const LaunchSessionContext = createContext<LaunchSessionContextValue | null>(
  null,
);

type ProviderProps = {
  session: LaunchSession;
  children: ReactNode;
  /** Sync slide index across tabs/windows (Teams: present tab + private trainer tab) */
  syncDeck?: boolean;
  /** Starting UI mode for this surface */
  initialMode?: LaunchMode;
  /**
   * Set on `/present` routes: forces presentation mode, blocks switching away,
   * and guarantees `audienceSlide` is the only deck data safe for screen share.
   */
  presentationLock?: boolean;
};

export function LaunchSessionProvider({
  session,
  children,
  syncDeck = false,
  initialMode = "presentation",
  presentationLock = false,
}: ProviderProps) {
  const [mode, setModeInternal] = useState<LaunchMode>(() =>
    presentationLock ? "presentation" : initialMode,
  );
  const [slideIndex, setSlideIndexState] = useState(0);
  const [slideTransitionSign, setSlideTransitionSign] = useState<1 | -1>(1);
  const [participantAnswers, setParticipantAnswers] = useState<
    Record<string, ParticipantAnswers>
  >({});

  const channelRef = useRef<BroadcastChannel | null>(null);
  const totalSlides = session.slides.length;
  const slide = session.slides[slideIndex];
  const audienceSlide = slide ? toAudienceSlide(slide) : undefined;

  const setMode = useCallback(
    (m: LaunchMode) => {
      if (presentationLock && m !== "presentation") return;
      setModeInternal(m);
    },
    [presentationLock],
  );

  useEffect(() => {
    if (presentationLock && mode !== "presentation") {
      setModeInternal("presentation");
    }
  }, [presentationLock, mode]);

  useLayoutEffect(() => {
    if (!syncDeck || typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(deckChannelName(session.sessionId));
    channelRef.current = ch;
    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, [syncDeck, session.sessionId]);

  useEffect(() => {
    if (!syncDeck) return;
    const stored = readStoredDeckIndex(session.sessionId);
    if (stored !== null && stored >= 0 && stored < totalSlides) {
      setSlideIndexState(stored);
    }
  }, [syncDeck, session.sessionId, totalSlides]);

  useEffect(() => {
    if (!syncDeck || !channelRef.current) return;
    const ch = channelRef.current;
    const onMessage = (ev: MessageEvent<DeckBroadcastPayload>) => {
      const d = ev.data;
      if (!d || d.type !== "slide") return;
      if (d.index < 0 || d.index >= totalSlides) return;
      setSlideIndexState(d.index);
      setSlideTransitionSign(d.sign);
    };
    ch.addEventListener("message", onMessage);
    return () => ch.removeEventListener("message", onMessage);
  }, [syncDeck, totalSlides, session.sessionId]);

  const publishSlide = useCallback(
    (index: number, sign: 1 | -1) => {
      if (!syncDeck) return;
      writeStoredDeckIndex(session.sessionId, index, sign);
      channelRef.current?.postMessage({
        type: "slide",
        index,
        sign,
      } satisfies DeckBroadcastPayload);
    },
    [syncDeck, session.sessionId],
  );

  const setSlideIndex = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(i, totalSlides - 1));
      setSlideTransitionSign(1);
      setSlideIndexState(clamped);
      publishSlide(clamped, 1);
    },
    [totalSlides, publishSlide],
  );

  const goNext = useCallback(() => {
    setSlideTransitionSign(1);
    setSlideIndexState((i) => {
      const next = Math.min(i + 1, totalSlides - 1);
      publishSlide(next, 1);
      return next;
    });
  }, [totalSlides, publishSlide]);

  const goPrev = useCallback(() => {
    setSlideTransitionSign(-1);
    setSlideIndexState((i) => {
      const next = Math.max(i - 1, 0);
      publishSlide(next, -1);
      return next;
    });
  }, [totalSlides, publishSlide]);

  const setParticipantAnswer = useCallback(
    (slideId: string, fieldId: string, value: string) => {
      setParticipantAnswers((prev) => ({
        ...prev,
        [slideId]: { ...prev[slideId], [fieldId]: value },
      }));
    },
    [],
  );

  const value = useMemo(
    () => ({
      mode: presentationLock ? ("presentation" as const) : mode,
      setMode,
      presentationLock,
      session,
      slideIndex,
      slide,
      audienceSlide,
      totalSlides,
      slideTransitionSign,
      goNext,
      goPrev,
      setSlideIndex,
      participantAnswers,
      setParticipantAnswer,
    }),
    [
      mode,
      presentationLock,
      session,
      slideIndex,
      slide,
      audienceSlide,
      totalSlides,
      slideTransitionSign,
      goNext,
      goPrev,
      setSlideIndex,
      participantAnswers,
      setParticipantAnswer,
      setMode,
    ],
  );

  return (
    <LaunchSessionContext.Provider value={value}>
      {children}
    </LaunchSessionContext.Provider>
  );
}

export function useLaunchSession() {
  const ctx = useContext(LaunchSessionContext);
  if (!ctx) {
    throw new Error("useLaunchSession must be used within LaunchSessionProvider");
  }
  return ctx;
}
