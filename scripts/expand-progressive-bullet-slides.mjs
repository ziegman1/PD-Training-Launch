/**
 Expands slides with bullets and/or participant prompts (`prompts` / `promptQuestions`)
 into cumulative deck steps (duplicate slides).

 - Authoring: `progressiveReveal: false` → no expansion **unless** there are multiple bullets (`B > 1`)
   or multiple prompts (`P > 1`), in which case stepping is still built so each line can appear in order.
 - `continuationGroup`: disables **automatic bullet** stepping only; prompts can still expand.
 - Default lead-in: title-only beat before first bullet and before first prompt (prompt-only slides).
   Set `progressiveRevealLeadIn: false` to skip those title-only beats.
 - **Subtitle (`emphasis`)** and **scripture** step in before bullets/prompts: title only → subtitle (if any)
   → scripture (if any), then bullets accumulate (each new bullet = later step at end of stack).
 - **Bullets:** `bullets` is an array of lines (or a legacy string with newlines). Whitespace-only lines
   are dropped. With **two or more** non-empty lines (and default flags), the deck stacks steps with
   `bulletRevealVisibleCount` going 1…N so bullets appear one at a time after any lead-in beats.
 - Clones share `continuationGroup` (= authoring `id`) for seamless presentation motion.
 */

/**
 * One progressive bullet per non-empty line in the bullets field (trimmed per line).
 * @param {Record<string, unknown>} raw
 * @returns {string[]}
 */
function getNormalizedBulletLines(raw) {
  /** @type {string[]} */
  let lines;
  if (Array.isArray(raw.bullets)) {
    lines = raw.bullets.map((x) => String(x));
  } else if (typeof raw.bullets === "string") {
    lines = raw.bullets.split(/\r?\n/);
  } else {
    return [];
  }
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function getPromptLines(raw) {
  if (Array.isArray(raw.prompts) && raw.prompts.length > 0) {
    return raw.prompts.map((x) => String(x));
  }
  if (Array.isArray(raw.promptQuestions) && raw.promptQuestions.length > 0) {
    return raw.promptQuestions.map((x) => String(x));
  }
  return [];
}

function stripAuthoringFlags(raw) {
  const { progressiveReveal: _pr, progressiveRevealLeadIn: _pl, ...rest } = raw;
  void _pr;
  void _pl;
  return rest;
}

/** @param {boolean} hasE @param {boolean} hasS */
function buildEmphasisScripturePrefix(hasE, hasS) {
  /** @type {{ bv: number; pv: number; revealE: boolean; revealS: boolean }[]} */
  const out = [];
  if (!hasE && !hasS) return out;
  out.push({ bv: 0, pv: 0, revealE: false, revealS: false });
  if (hasE) out.push({ bv: 0, pv: 0, revealE: true, revealS: false });
  if (hasS) {
    out.push({ bv: 0, pv: 0, revealE: hasE, revealS: true });
  }
  return out;
}

/**
 * @param {Record<string, unknown>} clone
 * @param {{ revealE: boolean; revealS: boolean }} ph
 * @param {string} emphasisStr
 * @param {string} scriptureStr
 * @param {boolean} hasE
 * @param {boolean} hasS
 */
function applySubtitleScriptureReveal(clone, ph, emphasisStr, scriptureStr, hasE, hasS) {
  if (hasE && ph.revealE) clone.emphasis = emphasisStr;
  else delete clone.emphasis;

  if (hasS && ph.revealS) clone.scripture = scriptureStr;
  else delete clone.scripture;
}

/**
 * @param {Array<Record<string, unknown>>} slides
 */
export function expandProgressiveBulletSlides(slides) {
  const out = [];
  for (const raw of slides) {
    const bullets = getNormalizedBulletLines(raw);
    const promptLines = getPromptLines(raw);
    const B = bullets.length;
    const P = promptLines.length;
    const hasContinuation = Boolean(raw.continuationGroup);
    const progressiveRevealOff = raw.progressiveReveal === false;
    const hasMultiBullet = B > 1;
    const hasMultiPrompt = P > 1;
    const skipExpand =
      progressiveRevealOff && !hasMultiBullet && !hasMultiPrompt;
    const lead = raw.progressiveRevealLeadIn !== false;

    const emphasisStr = String(raw.emphasis ?? "").trim();
    const scriptureStr = String(raw.scripture ?? "").trim();
    const hasE = Boolean(emphasisStr);
    const hasS = Boolean(scriptureStr);

    if (skipExpand) {
      const one = stripAuthoringFlags({ ...raw, bullets });
      out.push(one);
      continue;
    }

    if (B < 1 && P < 1 && !hasE && !hasS) {
      const one = stripAuthoringFlags({ ...raw, bullets });
      out.push(one);
      continue;
    }

    const espPrefix = buildEmphasisScripturePrefix(hasE, hasS);
    const hadEsprefix = espPrefix.length > 0;

    const expandBullets =
      !hasContinuation && B >= 1 && (lead || B > 1);

    /** @type {{ bv: number; pv: number; revealE: boolean; revealS: boolean }[]} */
    let phases = [];

    if (expandBullets) {
      phases.push(...espPrefix);
      const needBulletTitleOnly = lead && !hadEsprefix;
      if (needBulletTitleOnly) {
        phases.push({ bv: 0, pv: 0, revealE: false, revealS: false });
      }
      for (let s = 1; s <= B; s++) {
        phases.push({
          bv: s,
          pv: 0,
          revealE: hasE,
          revealS: hasS,
        });
      }
    } else if (B >= 1) {
      phases.push({
        bv: B,
        pv: 0,
        revealE: hasE,
        revealS: hasS,
      });
    }

    const promptExpand = P >= 1 && (lead || P > 1);

    if (P >= 1) {
      if (!promptExpand) {
        if (phases.length === 0) {
          phases.push({
            bv: 0,
            pv: P,
            revealE: hasE,
            revealS: hasS,
          });
        } else {
          phases = phases.map((ph) => ({ ...ph, pv: P }));
        }
      } else {
        const needsPromptOnlyLeadIn = B === 0 && lead;
        if (needsPromptOnlyLeadIn && phases.length === 0) {
          if (hadEsprefix) {
            phases.push(...espPrefix);
            for (let p = 1; p <= P; p++) {
              phases.push({
                bv: 0,
                pv: p,
                revealE: hasE,
                revealS: hasS,
              });
            }
          } else {
            for (let p = 0; p <= P; p++) {
              phases.push({
                bv: 0,
                pv: p,
                revealE: false,
                revealS: false,
              });
            }
          }
        } else {
          const pStart = B >= 1 ? 1 : lead ? 0 : 1;
          const bvFull = B >= 1 ? B : 0;
          if (B === 0 && hadEsprefix && phases.length === 0) {
            phases.push(...espPrefix);
          }
          for (let p = pStart; p <= P; p++) {
            phases.push({
              bv: bvFull,
              pv: p,
              revealE: hasE,
              revealS: hasS,
            });
          }
        }
      }
    }

    if (phases.length === 0) {
      const one = stripAuthoringFlags({ ...raw, bullets });
      out.push(one);
      continue;
    }

    const ph0 = phases[0];
    const fullBullets = B === 0 || ph0.bv === B;
    const fullPrompts = P === 0 || ph0.pv === P;
    const metaFullyRevealed =
      (!hasE || ph0.revealE) && (!hasS || ph0.revealS);
    if (
      phases.length === 1 &&
      fullBullets &&
      fullPrompts &&
      metaFullyRevealed &&
      !(B >= 1 && expandBullets) &&
      !(P >= 1 && promptExpand)
    ) {
      const one = stripAuthoringFlags({
        ...raw,
        bullets,
        ...(P > 0 ? { prompts: [...promptLines] } : {}),
      });
      delete one.promptQuestions;
      out.push(one);
      continue;
    }

    const baseId = String(raw.id);
    let stepIdx = 0;

    for (const ph of phases) {
      const { progressiveReveal: _pr, progressiveRevealLeadIn: _pl, ...base } = raw;
      void _pr;
      void _pl;
      const clone = {
        ...base,
        bullets: [...bullets],
        ...(P > 0 ? { prompts: [...promptLines] } : {}),
      };
      delete clone.promptQuestions;

      applySubtitleScriptureReveal(
        clone,
        ph,
        emphasisStr,
        scriptureStr,
        hasE,
        hasS,
      );

      clone.id = phases.length === 1 ? baseId : `${baseId}__rg${stepIdx}`;
      clone.continuationGroup = baseId;

      if (B >= 1) {
        clone.bulletRevealVisibleCount = ph.bv;
      } else {
        delete clone.bulletRevealVisibleCount;
      }

      if (P >= 1) {
        clone.promptRevealVisibleCount = ph.pv;
      } else {
        delete clone.promptRevealVisibleCount;
      }

      out.push(clone);
      stepIdx += 1;
    }
  }
  return out;
}
