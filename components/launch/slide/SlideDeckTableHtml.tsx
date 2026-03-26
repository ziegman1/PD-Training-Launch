import { sanitizeSlideTableHtml } from "@/lib/sanitizeSlideTableHtml";
import { presentationFontSizeStyle } from "@/lib/presentationFontSizes";
import { presentationScriptureWrapClass } from "@/components/launch/slide/presentationSlideLayout";

const TABLE_SHELL =
  "slide-deck-table-html w-full max-w-full overflow-x-auto text-left [&_table]:my-0 [&_table]:w-full [&_table]:min-w-0 [&_table]:border-collapse [&_table]:text-inherit [&_caption]:mb-2 [&_caption]:text-center [&_caption]:text-sm [&_caption]:text-launch-muted " +
  "[&_th]:border [&_th]:border-launch-steel/45 [&_th]:bg-black/15 [&_th]:px-2.5 [&_th]:py-2 [&_th]:align-top [&_th]:font-medium [&_th]:text-launch-soft/95 " +
  "[&_td]:border [&_td]:border-launch-steel/35 [&_td]:px-2.5 [&_td]:py-2 [&_td]:align-top [&_td]:font-normal [&_td]:text-launch-secondary/95 " +
  "[&_tbody_tr:first-child_td]:font-medium [&_tbody_tr:first-child_td]:text-launch-soft/95 " +
  "[&_tbody_tr:first-child_th]:font-medium [&_tbody_tr:first-child_th]:text-launch-soft/95";

type Props = {
  html: string;
  /** Matches scripture / first-row typography (rem). */
  scriptureRem?: number;
  hasContentBelow: boolean;
};

export function SlideDeckTableHtml({ html, scriptureRem, hasContentBelow }: Props) {
  const clean = sanitizeSlideTableHtml(html);
  if (!clean) return null;
  return (
    <div className={presentationScriptureWrapClass(hasContentBelow)}>
      <div
        className={TABLE_SHELL}
        style={presentationFontSizeStyle(scriptureRem)}
        // sanitized server- and client-side
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </div>
  );
}
