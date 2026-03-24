import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const authoringPath = path.join(root, "data/sessions/session-1.authoring.json");
const outPath = path.join(root, "data/sessions/session-1.json");

function scriptureToString(s) {
  if (s == null) return undefined;
  if (typeof s === "string") return s;
  if (typeof s === "object" && s.reference) return String(s.reference);
  return undefined;
}

function normalizeSlide(raw) {
  const bullets = Array.isArray(raw.bullets) ? [...raw.bullets] : [];

  const interaction = raw.interaction ?? raw.interactionPrompt;

  const slide = {
    id: raw.id,
    title: raw.title,
    bullets,
    trainerNotes: raw.trainerNotes ?? "",
  };

  if (raw.emphasis) slide.emphasis = raw.emphasis;
  if (raw.continuationGroup) slide.continuationGroup = String(raw.continuationGroup);
  if (raw.section) slide.section = String(raw.section);
  if (raw.timing) slide.timing = raw.timing;
  if (raw.pauseCue) slide.pauseCue = String(raw.pauseCue);
  if (raw.prompts?.length) slide.prompts = raw.prompts;
  if (raw.discussionHandoff) slide.discussionHandoff = String(raw.discussionHandoff);
  if (raw.transitionCue) slide.transitionCue = raw.transitionCue;
  if (interaction) slide.interaction = interaction;
  if (raw.interactionType) slide.interactionType = raw.interactionType;

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

  return slide;
}

const authoring = JSON.parse(fs.readFileSync(authoringPath, "utf8"));

const session = {
  sessionId: authoring.id ?? authoring.sessionId ?? "session-1",
  programName: "Launch",
  title: authoring.title,
  subtitle: authoring.shortTitle
    ? `${authoring.shortTitle} · ${authoring.theme ?? ""}`.replace(/\s·\s$/, "")
    : authoring.theme,
  shortTitle: authoring.shortTitle,
  theme: authoring.theme,
  objective: authoring.objective,
  slides: authoring.slides.map(normalizeSlide),
};

fs.writeFileSync(outPath, `${JSON.stringify(session, null, 2)}\n`);
console.log("Wrote", outPath, "slides:", session.slides.length);
