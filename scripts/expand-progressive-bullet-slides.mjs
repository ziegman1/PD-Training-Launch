/**
 Expands slides with bullets and/or participant prompts (`prompts` / `promptQuestions`)
 into cumulative deck steps (duplicate slides).

 - Authoring: `progressiveReveal: false` → no expansion **unless** multiple bullets, prompts, or interaction lines,
   in which case stepping is still built so each line can appear in order.
 - `continuationGroup`: disables **automatic bullet** stepping only; prompts can still expand.
 - Default lead-in: title-only beat before first bullet and before first prompt (prompt-only slides).
   Set `progressiveRevealLeadIn: false` to skip those title-only beats.
 - **Subtitle (`emphasis`)** and **scripture** step in before bullets/prompts: title only → subtitle (if any)
   → scripture (if any), then bullets accumulate (each new bullet = later step at end of stack).
 - `emphasisWithTitle: true`: subtitle on first beat with title (no title-only step before it).
 - `bulletRevealWithSubtitle` / `promptRevealWithSubtitle` / `interactionRevealWithSubtitle`: first batch with subtitle.
 - `progressiveBulletBatchSize` / `progressivePromptBatchSize` / `progressiveInteractionBatchSize` (1–20): per-advance counts.
 - **Bullets / prompts / interaction:** progressive counts (`*RevealVisibleCount`) after lead-in beats.
   Interaction uses non-empty lines from `interaction` (Together box), after bullets and room prompts.
 - Clones share one `continuationGroup` (authoring `id`, or explicit `continuationGroup` when set) for
   the whole stack—including interaction lines—so presentation mode does not run slide motion between
   the last room prompt beat and the participation prompt beat.
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

/** Together / participant prompt: one progressive step per non-empty line (trimmed). */
function getInteractionLines(raw) {
  const t = raw.interaction ?? raw.interactionPrompt;
  if (typeof t !== "string") return [];
  return t
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Mirrors `getSlideMomentType` in `lib/slideContent.ts` for expand-time metadata.
 * @param {Record<string, unknown>} raw
 * @returns {"standard" | "discussion" | "reflection" | "pairShare"}
 */
function getRawSlideMomentSlideType(raw) {
  const explicit = raw.interactionType;
  if (
    explicit === "fillIn" ||
    explicit === "exercise" ||
    explicit === "bibleStudy"
  ) {
    return "standard";
  }
  if (explicit === "reflection") return "reflection";
  if (explicit === "pairShare") return "pairShare";
  if (explicit === "discussion" || explicit === "prayer") return "discussion";
  const t = raw.interaction ?? raw.interactionPrompt;
  if (typeof t === "string" && t.trim()) return "discussion";
  return "standard";
}

/** Standard-slide “Together” box: interaction text + moment type standard. */
function rawShowTogetherBox(raw) {
  const t = raw.interaction ?? raw.interactionPrompt;
  if (typeof t !== "string" || !t.trim()) return false;
  return getRawSlideMomentSlideType(raw) === "standard";
}

function stripAuthoringFlags(raw) {
  const {
    progressiveReveal: _pr,
    progressiveRevealLeadIn: _pl,
    emphasisWithTitle: _ewt,
    progressiveBulletBatchSize: _pbb,
    progressivePromptBatchSize: _ppb,
    bulletRevealWithSubtitle: _brws,
    promptRevealWithSubtitle: _prws,
    progressiveInteractionBatchSize: _pib,
    interactionRevealWithSubtitle: _irws,
    ...rest
  } = raw;
  void _pr;
  void _pl;
  void _ewt;
  void _pbb;
  void _ppb;
  void _brws;
  void _prws;
  void _pib;
  void _irws;
  return rest;
}

function dedupeProgressivePhases(phases) {
  /** @type {{ bv: number; pv: number; iv: number; revealE: boolean; revealS: boolean }[]} */
  const out = [];
  for (const ph of phases) {
    const prev = out[out.length - 1];
    if (
      prev &&
      prev.bv === ph.bv &&
      prev.pv === ph.pv &&
      prev.iv === ph.iv &&
      prev.revealE === ph.revealE &&
      prev.revealS === ph.revealS
    ) {
      continue;
    }
    out.push(ph);
  }
  return out;
}

/**
 * Merge first bullet / prompt batches onto the first phase that shows subtitle (`revealE`).
 */
function applyRevealListsWithSubtitle(
  phases,
  {
    hasE,
    B,
    P,
    I,
    bulletBatch,
    promptBatch,
    interactionBatch,
    expandBullets,
    promptExpand,
    expandInteraction,
    bulletWithSub,
    promptWithSub,
    interactionWithSub,
  },
) {
  if (!hasE || phases.length === 0) return phases;
  if (!bulletWithSub && !promptWithSub && !interactionWithSub) return phases;

  const idx = phases.findIndex((p) => p.revealE);
  if (idx < 0) return phases;

  const mb =
    bulletWithSub && expandBullets && B >= 1
      ? Math.min(bulletBatch, B)
      : 0;
  const mp =
    promptWithSub && promptExpand && P >= 1
      ? Math.min(promptBatch, P)
      : 0;
  const mi =
    interactionWithSub && expandInteraction && I >= 1
      ? Math.min(interactionBatch, I)
      : 0;

  if (mb <= 0 && mp <= 0 && mi <= 0) return phases;

  for (let i = idx; i < phases.length; i++) {
    if (mb > 0) phases[i].bv = Math.max(phases[i].bv, mb);
    if (mp > 0) phases[i].pv = Math.max(phases[i].pv, mp);
    if (mi > 0) phases[i].iv = Math.max(phases[i].iv ?? 0, mi);
  }

  return dedupeProgressivePhases(phases);
}

/**
 * After bullets/prompts phases, append interaction (Together / discussion card) line stepping.
 * @param {number} P room prompt line count (0 if none)
 */
function appendInteractionTail(
  phases,
  I,
  interactionBatch,
  lead,
  expandInteraction,
  P,
) {
  if (I < 1 || phases.length === 0) return phases;
  for (const ph of phases) {
    ph.iv = ph.iv ?? 0;
  }

  if (!expandInteraction) {
    for (const ph of phases) {
      if (P > 0 && ph.pv < P) ph.iv = 0;
      else if (P === 0) ph.iv = I;
    }
    return dedupeProgressivePhases(phases);
  }

  const last = phases[phases.length - 1];
  const tpl = {
    bv: last.bv,
    pv: last.pv,
    revealE: last.revealE,
    revealS: last.revealS,
    iv: last.iv ?? 0,
  };

  if (lead) {
    phases.push({ ...tpl, iv: 0 });
  }
  for (let x = interactionBatch; x < I + interactionBatch; x += interactionBatch) {
    phases.push({
      ...tpl,
      iv: Math.min(x, I),
    });
  }
  return dedupeProgressivePhases(phases);
}

/**
 * When room prompts exist, keep interaction (`iv`) at 0 until the first "all prompts visible" beat,
 * then require a later step for iv > 0 so discussion / Together copy is its own subslide.
 */
function enforceInteractionAfterRoomPrompts(
  phases,
  { P, I, expandInteraction, interactionBatch },
) {
  if (I < 1 || phases.length === 0 || P < 1) return phases;

  for (const ph of phases) {
    if (ph.pv < P) ph.iv = 0;
  }

  const idxFirstFullPv = phases.findIndex((ph) => ph.pv === P);
  if (idxFirstFullPv < 0) return phases;

  phases[idxFirstFullPv].iv = 0;

  const hasLaterIx = phases
    .slice(idxFirstFullPv + 1)
    .some((ph) => (ph.iv ?? 0) > 0);
  if (!hasLaterIx) {
    const ref = phases[idxFirstFullPv];
    phases.splice(idxFirstFullPv + 1, 0, {
      bv: ref.bv,
      pv: ref.pv,
      iv: expandInteraction ? Math.min(interactionBatch, I) : I,
      revealE: ref.revealE,
      revealS: ref.revealS,
    });
  }

  return dedupeProgressivePhases(phases);
}

/**
 * @param {boolean} hasE
 * @param {boolean} hasS
 * @param {boolean} emphasisWithTitle show subtitle on first beat with title (skip title-only step)
 */
function buildEmphasisScripturePrefix(hasE, hasS, emphasisWithTitle) {
  /** @type {{ bv: number; pv: number; iv: number; revealE: boolean; revealS: boolean }[]} */
  const out = [];
  if (!hasE && !hasS) return out;
  if (emphasisWithTitle && hasE) {
    out.push({ bv: 0, pv: 0, iv: 0, revealE: true, revealS: false });
    if (hasS) {
      out.push({ bv: 0, pv: 0, iv: 0, revealE: true, revealS: true });
    }
    return out;
  }
  out.push({ bv: 0, pv: 0, iv: 0, revealE: false, revealS: false });
  if (hasE) out.push({ bv: 0, pv: 0, iv: 0, revealE: true, revealS: false });
  if (hasS) {
    out.push({ bv: 0, pv: 0, iv: 0, revealE: hasE, revealS: true });
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
    const interactionLines = getInteractionLines(raw);
    const B = bullets.length;
    const P = promptLines.length;
    const I = interactionLines.length;
    const hasContinuation = Boolean(raw.continuationGroup);
    const progressiveRevealOff = raw.progressiveReveal === false;
    const hasMultiBullet = B > 1;
    const hasMultiPrompt = P > 1;
    const hasMultiInteraction = I > 1;
    const skipExpand =
      progressiveRevealOff &&
      !hasMultiBullet &&
      !hasMultiPrompt &&
      !hasMultiInteraction;
    const lead = raw.progressiveRevealLeadIn !== false;

    const emphasisStr = String(raw.emphasis ?? "").trim();
    const scriptureStr = String(raw.scripture ?? "").trim();
    const hasE = Boolean(emphasisStr);
    const hasS = Boolean(scriptureStr);
    const emphasisWithTitle =
      raw.emphasisWithTitle === true ||
      raw.emphasisWithTitle === "true" ||
      raw.emphasisWithTitle === 1;
    const bulletRevealWithSubtitle = raw.bulletRevealWithSubtitle === true;
    const promptRevealWithSubtitle = raw.promptRevealWithSubtitle === true;
    const interactionRevealWithSubtitle = raw.interactionRevealWithSubtitle === true;
    const batchRaw = Number(raw.progressiveBulletBatchSize);
    const bulletBatch = Math.max(
      1,
      Math.min(20, Math.round(Number.isFinite(batchRaw) ? batchRaw : 1)),
    );
    const promptBatchRaw = Number(raw.progressivePromptBatchSize);
    const promptBatch = Math.max(
      1,
      Math.min(20, Math.round(Number.isFinite(promptBatchRaw) ? promptBatchRaw : 1)),
    );
    const interactionBatchRaw = Number(raw.progressiveInteractionBatchSize);
    const interactionBatch = Math.max(
      1,
      Math.min(
        20,
        Math.round(
          Number.isFinite(interactionBatchRaw) ? interactionBatchRaw : 1,
        ),
      ),
    );
    const expandInteraction = I >= 1 && (lead || I > 1);

    if (skipExpand) {
      const one = stripAuthoringFlags({ ...raw, bullets });
      out.push(one);
      continue;
    }

    if (B < 1 && P < 1 && I < 1 && !hasE && !hasS) {
      const one = stripAuthoringFlags({ ...raw, bullets });
      out.push(one);
      continue;
    }

    const espPrefix = buildEmphasisScripturePrefix(hasE, hasS, emphasisWithTitle);
    const hadEsprefix = espPrefix.length > 0;

    const expandBullets =
      !hasContinuation && B >= 1 && (lead || B > 1);

    /** @type {{ bv: number; pv: number; iv: number; revealE: boolean; revealS: boolean }[]} */
    let phases = [];

    if (expandBullets) {
      phases.push(...espPrefix);
      const needBulletTitleOnly = lead && !hadEsprefix;
      if (needBulletTitleOnly) {
        phases.push({
          bv: 0,
          pv: 0,
          iv: 0,
          revealE: false,
          revealS: false,
        });
      }
      for (let s = bulletBatch; s < B + bulletBatch; s += bulletBatch) {
        phases.push({
          bv: Math.min(s, B),
          pv: 0,
          iv: 0,
          revealE: hasE,
          revealS: hasS,
        });
      }
    } else if (B >= 1) {
      phases.push({
        bv: B,
        pv: 0,
        iv: 0,
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
            iv: 0,
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
            for (let p = promptBatch; p < P + promptBatch; p += promptBatch) {
              phases.push({
                bv: 0,
                pv: Math.min(p, P),
                iv: 0,
                revealE: hasE,
                revealS: hasS,
              });
            }
          } else {
            phases.push({
              bv: 0,
              pv: 0,
              iv: 0,
              revealE: false,
              revealS: false,
            });
            for (let p = promptBatch; p < P + promptBatch; p += promptBatch) {
              phases.push({
                bv: 0,
                pv: Math.min(p, P),
                iv: 0,
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
          if (pStart === 0) {
            phases.push({
              bv: bvFull,
              pv: 0,
              iv: 0,
              revealE: hasE,
              revealS: hasS,
            });
            for (let p = promptBatch; p < P + promptBatch; p += promptBatch) {
              phases.push({
                bv: bvFull,
                pv: Math.min(p, P),
                iv: 0,
                revealE: hasE,
                revealS: hasS,
              });
            }
          } else {
            for (let p = promptBatch; p < P + promptBatch; p += promptBatch) {
              phases.push({
                bv: bvFull,
                pv: Math.min(p, P),
                iv: 0,
                revealE: hasE,
                revealS: hasS,
              });
            }
          }
        }
      }
    }

    for (const ph of phases) {
      if (ph.iv == null) ph.iv = 0;
    }
    const hadBpPhases = phases.length > 0;

    if (I >= 1 && phases.length === 0) {
      if (!expandInteraction) {
        phases.push({
          bv: 0,
          pv: 0,
          iv: I,
          revealE: hasE,
          revealS: hasS,
        });
      } else {
        const needsIxOnlyLeadIn = B === 0 && P === 0 && lead;
        if (needsIxOnlyLeadIn) {
          if (hadEsprefix) {
            phases.push(...espPrefix);
            for (
              let x = interactionBatch;
              x < I + interactionBatch;
              x += interactionBatch
            ) {
              phases.push({
                bv: 0,
                pv: 0,
                iv: Math.min(x, I),
                revealE: hasE,
                revealS: hasS,
              });
            }
          } else {
            phases.push({
              bv: 0,
              pv: 0,
              iv: 0,
              revealE: false,
              revealS: false,
            });
            for (
              let x = interactionBatch;
              x < I + interactionBatch;
              x += interactionBatch
            ) {
              phases.push({
                bv: 0,
                pv: 0,
                iv: Math.min(x, I),
                revealE: false,
                revealS: false,
              });
            }
          }
        } else {
          if (B === 0 && P === 0 && hadEsprefix) {
            phases.push(...espPrefix);
          }
          const iStart = B >= 1 || P >= 1 ? 1 : lead ? 0 : 1;
          if (iStart === 0) {
            phases.push({
              bv: 0,
              pv: 0,
              iv: 0,
              revealE: hasE,
              revealS: hasS,
            });
            for (
              let x = interactionBatch;
              x < I + interactionBatch;
              x += interactionBatch
            ) {
              phases.push({
                bv: 0,
                pv: 0,
                iv: Math.min(x, I),
                revealE: hasE,
                revealS: hasS,
              });
            }
          } else {
            for (
              let x = interactionBatch;
              x < I + interactionBatch;
              x += interactionBatch
            ) {
              phases.push({
                bv: 0,
                pv: 0,
                iv: Math.min(x, I),
                revealE: hasE,
                revealS: hasS,
              });
            }
          }
        }
      }
    }

    if (phases.length > 0) {
      phases = applyRevealListsWithSubtitle(phases, {
        hasE,
        B,
        P,
        I,
        bulletBatch,
        promptBatch,
        interactionBatch,
        expandBullets,
        promptExpand,
        expandInteraction,
        bulletWithSub: bulletRevealWithSubtitle,
        promptWithSub: promptRevealWithSubtitle,
        interactionWithSub: interactionRevealWithSubtitle,
      });
    }

    if (I >= 1 && hadBpPhases) {
      phases = appendInteractionTail(
        phases,
        I,
        interactionBatch,
        lead,
        expandInteraction,
        P,
      );
    }

    if (I >= 1 && phases.length > 0) {
      phases = enforceInteractionAfterRoomPrompts(phases, {
        P,
        I,
        expandInteraction,
        interactionBatch,
      });
    }

    if (phases.length === 0) {
      const one = stripAuthoringFlags({ ...raw, bullets });
      out.push(one);
      continue;
    }

    const ph0 = phases[0];
    const fullBullets = B === 0 || ph0.bv === B;
    const fullPrompts = P === 0 || ph0.pv === P;
    const fullInteraction = I === 0 || ph0.iv === I;
    const metaFullyRevealed =
      (!hasE || ph0.revealE) && (!hasS || ph0.revealS);
    if (
      phases.length === 1 &&
      fullBullets &&
      fullPrompts &&
      fullInteraction &&
      metaFullyRevealed &&
      !(B >= 1 && expandBullets) &&
      !(P >= 1 && promptExpand) &&
      !(I >= 1 && expandInteraction)
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

    const tableStr =
      typeof raw.slideTableHtml === "string" ? raw.slideTableHtml.trim() : "";
    const hasTable = tableStr.length > 0;
    const showTogether = rawShowTogetherBox(raw);
    const stackStableBelowTitle =
      hasE || hasTable || hasS || B >= 1 || P >= 1 || showTogether;
    const stackStableBelowEmphasis =
      hasTable || hasS || B >= 1 || P >= 1 || showTogether;
    const stackStableBelowScripture = B >= 1 || P >= 1 || showTogether;
    const stackStableBelowSlideTable =
      hasS || B >= 1 || P >= 1 || showTogether;
    const multiPhaseStack = phases.length > 1;

    for (const ph of phases) {
      const {
        progressiveReveal: _pr,
        progressiveRevealLeadIn: _pl,
        emphasisWithTitle: _ewt,
        progressiveBulletBatchSize: _pbb,
        progressivePromptBatchSize: _ppb,
        progressiveInteractionBatchSize: _pib,
        bulletRevealWithSubtitle: _brws,
        promptRevealWithSubtitle: _prws,
        interactionRevealWithSubtitle: _irws,
        ...base
      } = raw;
      void _pr;
      void _pl;
      void _ewt;
      void _pbb;
      void _ppb;
      void _pib;
      void _brws;
      void _prws;
      void _irws;
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
      clone.continuationGroup = raw.continuationGroup
        ? String(raw.continuationGroup)
        : baseId;

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

      if (I >= 1) {
        clone.interactionRevealVisibleCount = ph.iv;
      } else {
        delete clone.interactionRevealVisibleCount;
      }

      if (multiPhaseStack) {
        clone.stackStableBelowTitle = stackStableBelowTitle;
        clone.stackStableBelowEmphasis = stackStableBelowEmphasis;
        clone.stackStableBelowScripture = stackStableBelowScripture;
        clone.stackStableBelowSlideTable = stackStableBelowSlideTable;
      }

      out.push(clone);
      stepIdx += 1;
    }
  }
  return out;
}
