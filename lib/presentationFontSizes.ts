import type { CSSProperties } from "react";
import type { PresentationFontSizes } from "@/types/launch";

/** Preset rem values for admin font-size control (matches deck typography options). */
export const PRESENTATION_FONT_PRESET_REMS = [
  0.75, 0.875, 1, 1.125, 1.25, 1.375, 1.5, 1.75, 2, 2.25, 2.5,
] as const;

/** ~px at 16px root, for labels */
export function presentationRemApproxPx(rem: number): number {
  return Math.round(rem * 16);
}

export type PresentationFontSizeField = keyof PresentationFontSizes;

/**
 * Viewport width used to resolve `vw` in theme clamps — typical deck / preview width.
 * Matches locked-presentation rules in `app/globals.css`.
 */
export const PRESENTATION_THEME_REM_REFERENCE_WIDTH_PX = 1200;

function vwToRem(vw: number, widthPx: number): number {
  return (vw / 100) * (widthPx / 16);
}

function clampRem(min: number, preferred: number, max: number): number {
  return Math.min(Math.max(min, preferred), max);
}

/**
 * Resolved `rem` for slide typography when no `presentationFontSizes` override is set
 * (same clamp formulas as locked presentation in `app/globals.css`).
 */
export function getPresentationFieldThemeRem(
  field: PresentationFontSizeField,
  widthPx: number = PRESENTATION_THEME_REM_REFERENCE_WIDTH_PX,
): number {
  const w = (v: number) => vwToRem(v, widthPx);
  switch (field) {
    case "titleRem":
      return clampRem(2.125, w(4.8) + 0.85, 4.1);
    case "sectionRem":
      return 0.65;
    case "emphasisRem":
      return clampRem(1.06, w(1.46) + 0.56, 1.58);
    case "scriptureRem":
      return clampRem(0.94, w(0.72) + 0.74, 1.08);
    case "bulletsRem":
    case "promptsRem":
      return clampRem(1.05, w(0.9) + 0.85, 1.3);
    case "interactionRem":
      return clampRem(0.94, w(0.72) + 0.74, 1.1);
    default:
      return 1;
  }
}

export function formatRemForLabel(rem: number): string {
  const r = Math.round(rem * 1000) / 1000;
  return String(r);
}

/** Stable string for <select> value; matches a preset when close enough. */
export function canonicalPresentationRemOptionValue(
  rem: number | undefined,
): string {
  if (rem == null || !Number.isFinite(rem)) return "";
  for (const p of PRESENTATION_FONT_PRESET_REMS) {
    if (Math.abs(rem - p) < 0.0005) return String(p);
  }
  const rounded = Math.round(rem * 10000) / 10000;
  return String(rounded);
}

export function presentationFontSizeStyle(
  rem: number | undefined,
): CSSProperties | undefined {
  if (rem == null || !Number.isFinite(rem)) return undefined;
  return { fontSize: `${rem}rem` };
}

export function mergePresentationFontSizes(
  current: PresentationFontSizes | undefined,
  key: keyof PresentationFontSizes,
  rem: number | undefined,
): PresentationFontSizes | undefined {
  const next: Record<string, number> = {};
  if (current) {
    for (const [k, v] of Object.entries(current)) {
      if (typeof v === "number" && Number.isFinite(v)) {
        next[k] = v;
      }
    }
  }
  if (rem != null && Number.isFinite(rem)) {
    next[key] = rem;
  } else {
    delete next[key];
  }
  if (Object.keys(next).length === 0) return undefined;
  return next as PresentationFontSizes;
}
