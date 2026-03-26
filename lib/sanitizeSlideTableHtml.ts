import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML pasted into slide tables (Excel / Word / Sheets).
 * Keeps table structure and safe inline styles DOMPurify allows.
 */
export function sanitizeSlideTableHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";
  const trimmed = dirty.trim();
  if (!trimmed) return "";
  return DOMPurify.sanitize(trimmed, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["colspan", "rowspan", "style", "align", "valign", "width", "height"],
  });
}
