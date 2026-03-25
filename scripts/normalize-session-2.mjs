import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expandProgressiveBulletSlides } from "./expand-progressive-bullet-slides.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const authoringPath = path.join(root, "data/sessions/session-2.authoring.json");
const outPath = path.join(root, "data/sessions/session-2.json");

function scriptureToString(s) {
  if (s == null) return undefined;
  if (typeof s === "string") return s;
  if (typeof s === "object" && s.reference) return String(s.reference);
  return undefined;
}

function clampPct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  return Math.max(0, Math.min(100, x));
}

function normalizeDeckPlacementBox(raw) {
  if (!raw || typeof raw !== "object") return null;
  const x = clampPct(raw.xPct);
  const y = clampPct(raw.yPct);
  if (x === null || y === null) return null;
  const out = { xPct: x, yPct: y };
  if (raw.widthPct != null) {
    const w = clampPct(raw.widthPct);
    if (w !== null) out.widthPct = Math.max(20, Math.min(100, w));
  }
  return out;
}

function normalizeDeckPlacement(raw) {
  if (!raw || typeof raw !== "object") return null;
  const title = normalizeDeckPlacementBox(raw.title);
  const emphasis = normalizeDeckPlacementBox(raw.emphasis);
  const bullets = normalizeDeckPlacementBox(raw.bullets);
  if (!title && !emphasis && !bullets) return null;
  const out = {};
  if (title) out.title = title;
  if (emphasis) out.emphasis = emphasis;
  if (bullets) out.bullets = bullets;
  return out;
}

function normalizePresentationFontSizes(raw) {
  if (!raw || typeof raw !== "object") return null;
  const keys = [
    "sectionRem",
    "titleRem",
    "emphasisRem",
    "scriptureRem",
    "bulletsRem",
    "promptsRem",
    "interactionRem",
  ];
  const out = {};
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0.5 && v <= 4) {
      out[k] = v;
    }
  }
  return Object.keys(out).length ? out : null;
}

function normalizeSlide(raw) {
  const bullets = Array.isArray(raw.bullets) ? [...raw.bullets] : [];

  const interaction = raw.interaction ?? raw.interactionPrompt;

  const slide = {
    id: raw.id,
    title: raw.title,
    bullets,
    trainerCadence: raw.trainerCadence ?? "",
    trainerTransition: raw.trainerTransition ?? "",
    trainerScriptNotes: raw.trainerScriptNotes ?? "",
  };

  if (raw.emphasis) slide.emphasis = raw.emphasis;
  if (raw.continuationGroup) slide.continuationGroup = String(raw.continuationGroup);
  if (raw.section) slide.section = String(raw.section);
  if (raw.timing) slide.timing = raw.timing;
  if (raw.pauseCue) slide.pauseCue = String(raw.pauseCue);
  const mergedPrompts = [
    ...(Array.isArray(raw.prompts) ? raw.prompts : []),
  ];
  if (
    mergedPrompts.length === 0 &&
    Array.isArray(raw.promptQuestions) &&
    raw.promptQuestions.length > 0
  ) {
    mergedPrompts.push(...raw.promptQuestions);
  }
  if (mergedPrompts.length > 0) {
    slide.prompts = mergedPrompts.map(String);
  }
  if (raw.discussionHandoff) slide.discussionHandoff = String(raw.discussionHandoff);
  if (raw.transitionCue) slide.transitionCue = raw.transitionCue;
  if (interaction) slide.interaction = interaction;
  if (raw.interactionType) slide.interactionType = raw.interactionType;

  if (Array.isArray(raw.fillInFields) && raw.fillInFields.length > 0) {
    slide.fillInFields = raw.fillInFields.map((f) => ({
      id: String(f.id),
      label: String(f.label),
      ...(f.placeholder != null ? { placeholder: String(f.placeholder) } : {}),
    }));
  }

  if (raw.interactionData && typeof raw.interactionData === "object") {
    const d = raw.interactionData;
    if (d.prompt != null && String(d.prompt).trim()) {
      slide.interactionData = {
        prompt: String(d.prompt),
        ...(Array.isArray(d.answers)
          ? { answers: d.answers.map((a) => String(a)) }
          : {}),
        ...(d.helperText != null ? { helperText: String(d.helperText) } : {}),
        ...(typeof d.optional === "boolean" ? { optional: d.optional } : {}),
      };
    }
  }

  const scr = scriptureToString(raw.scripture);
  if (scr) slide.scripture = scr;

  if (raw.breakout && typeof raw.breakout === "object") {
    slide.breakout = {
      enabled: Boolean(raw.breakout.enabled),
      ...(raw.breakout.groupSize != null
        ? { groupSize: Number(raw.breakout.groupSize) }
        : {}),
      ...(raw.breakout.duration ? { duration: String(raw.breakout.duration) } : {}),
      ...(Array.isArray(raw.breakout.instructions)
        ? { instructions: [...raw.breakout.instructions] }
        : {}),
      ...(Array.isArray(raw.breakout.debrief)
        ? { debrief: [...raw.breakout.debrief] }
        : {}),
    };
  }

  if (Array.isArray(raw.bibleStudyGroups) && raw.bibleStudyGroups.length > 0) {
    slide.bibleStudyGroups = raw.bibleStudyGroups.map((g) => ({
      id: String(g.id),
      topic: String(g.topic),
      passages: Array.isArray(g.passages) ? g.passages.map(String) : [],
      ...(g.facilitatorNote
        ? { facilitatorNote: String(g.facilitatorNote) }
        : {}),
    }));
  }

  if (
    raw.bulletRevealVisibleCount != null &&
    Number.isFinite(Number(raw.bulletRevealVisibleCount))
  ) {
    const v = Math.round(Number(raw.bulletRevealVisibleCount));
    slide.bulletRevealVisibleCount = Math.max(
      0,
      Math.min(bullets.length, v),
    );
  }

  if (
    raw.promptRevealVisibleCount != null &&
    Number.isFinite(Number(raw.promptRevealVisibleCount)) &&
    slide.prompts?.length
  ) {
    const pv = Math.round(Number(raw.promptRevealVisibleCount));
    slide.promptRevealVisibleCount = Math.max(
      0,
      Math.min(slide.prompts.length, pv),
    );
  }

  const ndp = normalizeDeckPlacement(raw.deckPlacement);
  if (ndp) slide.deckPlacement = ndp;

  const nfs = normalizePresentationFontSizes(raw.presentationFontSizes);
  if (nfs) slide.presentationFontSizes = nfs;

  return slide;
}

function normalizeWorkbookReflectionPrompt(p) {
  const fieldId = String(p.fieldId);
  const label = String(p.label);
  return {
    fieldId,
    label,
    ...(p.placeholder != null ? { placeholder: String(p.placeholder) } : {}),
    ...(typeof p.rows === "number" && Number.isFinite(p.rows)
      ? { rows: Math.max(2, Math.min(24, Math.round(p.rows))) }
      : {}),
  };
}

function normalizeWorkbookFillInItem(item) {
  const prompt = String(item.prompt);
  const out = { prompt };
  if (Array.isArray(item.answers)) {
    out.answers = item.answers.map((a) => String(a));
  }
  if (item.helperText != null) out.helperText = String(item.helperText);
  return out;
}

function normalizeWorkbookSection(raw) {
  const id = String(raw.id);
  const kind = raw.kind;
  if (kind !== "reflection" && kind !== "bibleStudy" && kind !== "fillIn") {
    throw new Error(`Invalid workbook section kind for ${id}: ${kind}`);
  }
  const title = String(raw.title);
  const section = {
    id,
    kind,
    title,
    ...(raw.subtitle != null ? { subtitle: String(raw.subtitle) } : {}),
    ...(raw.attribution != null ? { attribution: String(raw.attribution) } : {}),
    ...(raw.sectionEyebrow != null
      ? { sectionEyebrow: String(raw.sectionEyebrow) }
      : {}),
    ...(raw.intro != null ? { intro: String(raw.intro) } : {}),
  };
  if (kind === "bibleStudy") {
    if (!raw.sourceSlideId) {
      throw new Error(`workbook section ${id}: bibleStudy requires sourceSlideId`);
    }
    section.sourceSlideId = String(raw.sourceSlideId);
  }
  if (kind === "reflection") {
    const prompts = Array.isArray(raw.reflectionPrompts)
      ? raw.reflectionPrompts.map(normalizeWorkbookReflectionPrompt)
      : [];
    if (prompts.length === 0) {
      throw new Error(`workbook section ${id}: reflection requires reflectionPrompts`);
    }
    section.reflectionPrompts = prompts;
  }
  if (kind === "fillIn") {
    const items = Array.isArray(raw.fillInItems)
      ? raw.fillInItems.map(normalizeWorkbookFillInItem)
      : [];
    if (items.length === 0) {
      throw new Error(`workbook section ${id}: fillIn requires fillInItems`);
    }
    section.fillInItems = items;
    if (Array.isArray(raw.reflectionPrompts) && raw.reflectionPrompts.length > 0) {
      section.reflectionPrompts = raw.reflectionPrompts.map(
        normalizeWorkbookReflectionPrompt,
      );
    }
    if (raw.fillInCompact === true) section.fillInCompact = true;
  }
  return section;
}

const authoring = JSON.parse(fs.readFileSync(authoringPath, "utf8"));

const session = {
  sessionId: authoring.id ?? authoring.sessionId ?? "session-2",
  programName: "Launch",
  title: authoring.title,
  subtitle: authoring.shortTitle
    ? `${authoring.shortTitle} · ${authoring.theme ?? ""}`.replace(/\s·\s$/, "")
    : authoring.theme,
  shortTitle: authoring.shortTitle,
  theme: authoring.theme,
  objective: authoring.objective,
  slides: expandProgressiveBulletSlides(authoring.slides).map(normalizeSlide),
};

if (authoring.workbook && Array.isArray(authoring.workbook.sections)) {
  session.workbook = {
    sections: authoring.workbook.sections.map(normalizeWorkbookSection),
  };
}

fs.writeFileSync(outPath, `${JSON.stringify(session, null, 2)}\n`);
console.log("Wrote", outPath, "slides:", session.slides.length);
