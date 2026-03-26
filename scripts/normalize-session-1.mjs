import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildNormalizedSessionFromAuthoring } from "./normalize-session-core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const authoringPath =
  process.env.LAUNCH_NORMALIZE_AUTHORING_PATH ||
  path.join(root, "data/sessions/session-1.authoring.json");
const outPath =
  process.env.LAUNCH_NORMALIZE_OUT_PATH ||
  path.join(root, "data/sessions/session-1.json");

const authoring = JSON.parse(fs.readFileSync(authoringPath, "utf8"));
const session = buildNormalizedSessionFromAuthoring(authoring, "session-1");

fs.writeFileSync(outPath, `${JSON.stringify(session, null, 2)}\n`);
console.log("Wrote", outPath, "slides:", session.slides.length);
