import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const part1Path = path.join(root, "data/sessions/trainer-layers-session-1.part1.json");
const part2Path = path.join(root, "data/sessions/trainer-layers-session-1.part2.json");
const sessionPath = path.join(root, "data/sessions/session-1.json");
const authoringPath = path.join(root, "data/sessions/session-1.authoring.json");

const layers = {
  ...JSON.parse(fs.readFileSync(part1Path, "utf8")),
  ...JSON.parse(fs.readFileSync(part2Path, "utf8")),
};

function applyLayersToSlides(slides) {
  for (const slide of slides) {
    const L =
      layers[slide.id] ??
      (slide.continuationGroup ? layers[slide.continuationGroup] : undefined);
    if (!L) {
      throw new Error(`trainer-layers-session-1.json missing entry for slide id: ${slide.id}`);
    }
    delete slide.trainerNotes;
    slide.trainerCadence = L.trainerCadence;
    slide.trainerTransition = L.trainerTransition;
    slide.trainerScriptNotes = L.trainerScriptNotes;
  }
}

const session = JSON.parse(fs.readFileSync(sessionPath, "utf8"));
applyLayersToSlides(session.slides);
fs.writeFileSync(sessionPath, `${JSON.stringify(session, null, 2)}\n`, "utf8");

const authoring = JSON.parse(fs.readFileSync(authoringPath, "utf8"));
for (const slide of authoring.slides) {
  const L = layers[slide.id];
  if (!L) {
    throw new Error(`trainer-layers-session-1.json missing entry for authoring slide id: ${slide.id}`);
  }
  delete slide.trainerNotes;
  slide.trainerCadence = L.trainerCadence;
  slide.trainerTransition = L.trainerTransition;
  slide.trainerScriptNotes = L.trainerScriptNotes;
}
fs.writeFileSync(authoringPath, `${JSON.stringify(authoring, null, 2)}\n`, "utf8");

console.log("Merged trainer layers into session-1.json and session-1.authoring.json");
