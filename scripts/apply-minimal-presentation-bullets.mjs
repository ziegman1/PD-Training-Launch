/**
 * Optional pass: applies `OVERRIDES` per slide id; slides without an override get a
 * three-word fallback from existing bullets. Prefer editing authoring JSON directly;
 * keep OVERRIDES in sync when you run this script.
 * Run: node scripts/apply-minimal-presentation-bullets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const NO_PUNCT = /[.,;:!?'"“”‘’—–\-]/g;

function words(s) {
  return s
    .replace(NO_PUNCT, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");
}

/** Curated: slide id -> 2–3 concise bullets (must match authoring intent) */
const OVERRIDES = {
  // Session 2
  "s2-001": [
    "Mission, vision, and why tell your calling story",
    "Budget and timeline make the ask concrete",
    "Five pieces—one coherent invitation",
  ],
  "s2-002": [
    "Clarity now saves confusion later",
    "Strong partnership follows clear vision",
  ],
  "s2-003": ["What you do", "Who you serve", "How you serve", "Where you serve"],
  "s2-003b": ["I am __________", "Serving __________", "So that __________"],
  "s2-003c": [
    "Future you long to see God bless",
    "Orients plans and partnerships",
    "Not the same as a funding goal",
  ],
  "s2-004": [
    "Why: trust, not just logic",
    "Budget: a real monthly number you can defend",
    "Timeline: this season and the next ninety days",
  ],
  "s2-005": [
    "Groups of two to four; about five minutes",
    "Use the prompts on screen",
    "Say your draft out loud—honesty over polish",
  ],
  "s2-006": [
    "Name storming",
    "Following 3–5 missionaries",
    "Interview them",
  ],
  "s2-007": [
    "List real names by warm categories",
    "Find and schedule conversations ethically",
    "Let a ninety-day rhythm replace panic",
  ],
  "s2-008": [
    "Learn posture from people ahead of you",
    "Watch patterns—transfer principles, not personality",
    "Short interviews; gratitude on the way out",
  ],
  "s2-009": [
    "Keep tools simple—retrieval beats sophistication",
    "Plateaus are normal; check fear dressed as wisdom",
    "Prayer names who God highlights next",
  ],
  "s2-010": [
    "Small groups; about five minutes",
    "Name one person you will pray for this week",
    "One research step you will actually take",
  ],
  "s2-011": [
    "Prayer partners first—then monthly partners",
    "Advocates and connectors multiply the mission",
    "Clear language before you ask for money",
  ],
  "s2-012": [
    "Needing help is normal—not failure",
    "Partnership language is discipleship language",
    "People give to mission they respect and understand",
  ],
  "s2-013": [
    "Prayer partners get specifics and gratitude",
    "Financial partners need clarity and fruit stories",
    "Special roles carry advocacy beyond the check",
  ],
  "s2-014": [
    "Healthy partnership is mutual—not one-way extraction",
    "Monthly math turns panic into a plan",
    "Let numbers inform prayer—not shame",
  ],
  "s2-015": [
    "Discern warm relationships before you chase",
    "Lead with mission; invite with dignity",
    "Rehearse short—clarity is kindness",
  ],
  "s2-016": [
    "Small groups; about five minutes",
    "Who gets your first prayer invitation—and when",
    "Rehearse one ask out loud",
  ],
  "s2-017": [
    "Aligned brand helps partners repeat your story",
    "Team and message belong in the same sentence",
    "Carry names and next steps into the next session",
  ],

  // Sample
  "slide-intro": ["Three modes", "Shared body", "Switch anytime"],
  "slide-reflection": ["Local input", "Per device", "Quiet write"],
  "slide-fillin": ["Blank lines", "Same slide", "Private answers"],

  // Session 1
  "s1-001": [
    "Why partnership development matters",
    "The biblical foundation underneath it",
    "The philosophy that will shape how you show up",
  ],
  "s1-001b": ["Limiting beliefs—coming later today", "The FREEDOM pathway ahead"],
  "s1-002": ["Not fundraising", "Not begging", "Not selling"],
  "s1-002b": ["Inviting partnership", "Gods mission"],
  "s1-003": [
    "We start with Scripture—not opinion",
    "Then we examine our resistance in the light of truth",
  ],
  "s1-003a": [
    "Read and discuss the passages you are assigned",
    "Name principles and what they show about God's design",
    "Leave with one honest takeaway",
  ],
  "s1-003d": [
    "What stood out or challenged you",
    "What became clearer",
    "What surprised you",
  ],
  "s1-004": ["God uses people", "Provide ministry", "Workers supported"],
  "s1-004b": ["Partners share fruit", "Provision mission"],
  "s1-005": [
    "Luke 8:1–3—partners joined his mission",
    "Resources fueled the work",
    "Partnership advanced what God was doing",
  ],
  "s1-006": [
    "Paul names one consistent pattern across letters",
    "Spiritual sowing and material partnership belong together",
    "Gospel partnership—not shameful charity",
  ],
  "s1-007": ["Sometimes appropriate", "Not required", "Paul worked"],
  "s1-007b": ["Paul supported", "Mission decides"],
  "s1-008": ["Still uncomfortable", "What challenged", "Still questioning"],
  "s1-009": ["God people self", "Mindset first"],
  "s1-010": ["God owns all", "God moves hearts", "God supplies needs"],
  "s1-010b": ["Prayer dependence", "Trust not strive"],
  "s1-011": ["Not manipulation", "Not pressure", "Not guilt appeals"],
  "s1-011b": ["Not money centered", "Not self promotion"],
  "s1-012": ["Ministry", "Invitation", "Stewardship"],
  "s1-012b": ["Shared obedience", "Shared fruit"],
  "s1-013": [
    "Perspective shapes posture",
    "Posture shapes every conversation",
    "Conversations shape outcomes before people hear your words",
  ],
  "s1-013b": ["Fear weakens", "Faith strengthens"],
  "s1-014": ["The barrier is often belief—not technique", "Name the lie so truth has room"],
  "s1-015": ["I am bothering people", "People will not want to give", "I am not good at this"],
  "s1-015b": ["I do not know enough people", "Talking about money feels unspiritual"],
  "s1-016": ["Distorted view of God", "Distorted view of self", "Distorted view of people"],
  "s1-016b": ["Fear rejection", "Identity confused"],
  "s1-017": ["Name fear", "Name belief", "Name truth"],
  "s1-018": [
    "Fundraiser or missionary—only one fits",
    "Pressure or purpose—different fuel",
    "Begging or inviting—different posture",
  ],
  "s1-018b": ["Scarcity trust", "Transaction partnership"],
  "s1-019": ["Fear to faith", "Pressure invitation", "Money mission"],
  "s1-020": ["Seven moves", "Sessions ahead", "Orientation only"],
  "s1-021": ["Focus vision", "Run research", "Enlist team"],
  "s1-021b": ["Enhance brand", "Deploy team"],
  "s1-022": ["Organize ask", "Make difference"],
  "s1-022b": [
    "A practical pathway—not random hacks",
    "A reproducible rhythm you can teach",
    "A faith-filled framework for the next sessions",
  ],
  "s1-023": ["Surrender belief", "Embrace truth", "Faith step"],
  "s1-024": [
    "Boldness and faith in the invitation",
    "Freedom from fear around money",
    "Trust that God is the provider",
  ],
};

function applyToSlides(slides) {
  if (!Array.isArray(slides)) return;
  for (const slide of slides) {
    const id = slide.id;
    if (!slide.bullets?.length) continue;

    let next = OVERRIDES[id];
    if (!next) {
      next = slide.bullets.map((b) => words(String(b))).filter((b) => b.length > 0);
    }
    next = next.slice(0, 5);
    if (next.length < 3 && slide.bullets.length >= 3) {
      const extra = slide.bullets
        .map((b) => words(String(b)))
        .filter((b) => b && !next.includes(b));
      for (const e of extra) {
        if (next.length >= 5) break;
        next.push(e);
      }
    }
    slide.bullets = next.slice(0, 5);
  }
}

function run(fileRel) {
  const filePath = path.join(root, fileRel);
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  if (data.slides) applyToSlides(data.slides);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  console.log("Updated", fileRel, "slides:", data.slides?.length ?? 0);
}

run("data/sessions/session-2.authoring.json");
run("data/sessions/session-1.authoring.json");
run("data/sessions/sample-session.json");
