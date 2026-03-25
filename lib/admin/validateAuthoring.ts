import type { EditableSessionId } from "@/lib/admin/sessionFiles";

export function validateAuthoringBody(
  data: unknown,
  sessionId: EditableSessionId,
): string | null {
  if (data == null || typeof data !== "object") {
    return "Body must be a JSON object.";
  }
  const o = data as Record<string, unknown>;
  if (typeof o.id !== "string" || o.id !== sessionId) {
    return `authoring root "id" must be "${sessionId}" (matches this session).`;
  }
  if (!Array.isArray(o.slides)) {
    return "authoring must include a slides array.";
  }
  const seenIds = new Set<string>();
  for (let i = 0; i < o.slides.length; i++) {
    const s = o.slides[i];
    if (!s || typeof s !== "object") {
      return `slides[${i}] must be an object.`;
    }
    const slide = s as Record<string, unknown>;
    if (typeof slide.id !== "string" || !slide.id.trim()) {
      return `slides[${i}].id must be a non-empty string.`;
    }
    if (seenIds.has(slide.id)) {
      return `Duplicate slide id "${slide.id}" — each slides[].id must be unique.`;
    }
    seenIds.add(slide.id);
    if (typeof slide.title !== "string") {
      return `slides[${i}].title must be a string.`;
    }
  }
  return null;
}
