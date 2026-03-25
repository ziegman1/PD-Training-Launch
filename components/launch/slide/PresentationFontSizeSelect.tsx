"use client";

import { useMemo } from "react";
import {
  type PresentationFontSizeField,
  PRESENTATION_FONT_PRESET_REMS,
  canonicalPresentationRemOptionValue,
  formatRemForLabel,
  getPresentationFieldThemeRem,
  presentationRemApproxPx,
} from "@/lib/presentationFontSizes";

type Props = {
  /** Which slide region — used to show theme size when there is no override. */
  field: PresentationFontSizeField;
  ariaLabel: string;
  value: number | undefined;
  onChange: (rem: number | undefined) => void;
  id?: string;
};

export function PresentationFontSizeSelect({
  field,
  ariaLabel,
  value,
  onChange,
  id,
}: Props) {
  const { selectValue, options, themeRem, effectiveRem } = useMemo(() => {
    const theme = getPresentationFieldThemeRem(field);
    const themePx = presentationRemApproxPx(theme);
    const themeLabel = `${themePx}px · ${formatRemForLabel(theme)}rem`;

    const presetRows = PRESENTATION_FONT_PRESET_REMS.map((rem) => {
      const v = String(rem);
      const px = presentationRemApproxPx(rem);
      return {
        value: v,
        label: `${px}px · ${formatRemForLabel(rem)}rem`,
      };
    });

    const canonical = canonicalPresentationRemOptionValue(value);
    const presetValues = new Set(presetRows.map((r) => r.value));

    const hasOverride = value != null && Number.isFinite(value);
    const rows: { value: string; label: string }[] = [
      {
        value: "",
        label: hasOverride
          ? `Reset · ${themeLabel}`
          : `Current · ${themeLabel}`,
      },
    ];

    if (
      canonical !== "" &&
      hasOverride &&
      !presetValues.has(canonical)
    ) {
      const px = presentationRemApproxPx(value);
      rows.push({
        value: canonical,
        label: `Override · ${px}px · ${formatRemForLabel(Number(canonical))}rem`,
      });
    }

    rows.push(...presetRows);

    const effective =
      hasOverride && value != null ? value : theme;

    return {
      selectValue: canonical,
      options: rows,
      themeRem: theme,
      effectiveRem: effective,
    };
  }, [field, value]);

  const effectivePx = presentationRemApproxPx(effectiveRem);

  return (
    <select
      id={id}
      aria-label={ariaLabel}
      title={`${effectivePx}px · ${formatRemForLabel(effectiveRem)}rem${
        value != null && Number.isFinite(value)
          ? " (override)"
          : " (slide theme)"
      }`}
      className="max-w-[13.5rem] shrink-0 rounded border border-launch-steel/40 bg-launch-navy/90 px-1 py-0.5 text-[10px] font-medium leading-tight text-launch-soft shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-launch-gold/45"
      value={selectValue}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : Number(v));
      }}
    >
      {options.map((o, i) => (
        <option key={`${o.value}-${i}`} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
