# UX Scoring System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an overall + per-criterion 0–100 score to the UX audit output, with a deterministic algorithm fed by per-issue `impact` (1–5) and a one-sentence `scoreNote` from the LLM.

**Architecture:** The LLM produces two new fields (`issues[].impact` and `scoreNote`); a pure `computeScores()` function in `src/lib/scoring.js` aggregates them deterministically; `normalizeAudit` in `App.jsx` attaches the result to the audit; a new `<ScoreBlock>` component renders the visual block between the audit header and the existing `<Scorecard>`.

**Tech Stack:** React 18, Vite, Tailwind v4 (utility classes, no config file), plain CSS vars in `src/index.css` for the design tokens.

**Project conventions (read before starting):**
- No automated test framework is set up. Verification is manual via `npm run dev`. Do not introduce vitest as part of this plan.
- The user reviews every commit. **Never run `git commit`.** Each task ends with a "stage changes and pause for user review" step instead.
- The audit response is a contract — keep the schema in `src/prompts/systemUxAudit.js` and the normaliser in `App.jsx` in lockstep.
- Tailwind v4 is JIT-compiled from source; arbitrary classes like `bg-[var(--good)]` work without config.

**Reference spec:** `docs/superpowers/specs/2026-06-03-ux-scoring-system-design.md`

---

## File Structure

**Created:**
- `src/lib/scoring.js` — pure scoring module. Exports `computeScores`, `bandFor`, and the constants `SEVERITY_WEIGHT`, `BANDS`, `K`, `SEVERITY_IMPACT_DEFAULT`.
- `src/components/output/results/ScoreBlock.jsx` — renders the score block (overall numeral, band, note, per-criterion rows).

**Modified:**
- `src/index.css` — add `--good` (and `--good-bg`) CSS var to light and dark themes.
- `src/prompts/systemUxAudit.js` — extend the JSON schema with `impact` and `scoreNote`; document the impact rubric.
- `src/App.jsx` — extend `normalizeAudit` to coerce `impact`, surface `scoreNote`, call `computeScores`, attach `scores` to the audit object.
- `src/components/output/results/Results.jsx` — render `<ScoreBlock>` between the header and `<Scorecard>`.
- `src/components/output/results/StrengthsSection.jsx` — bump section marker from `§ 01` to `§ 02`.
- `src/components/output/results/IssuesSection.jsx` — bump section marker from `§ 02` to `§ 03`.
- `src/components/output/results/RoadmapSection.jsx` — bump section marker from `§ 03` to `§ 04`.

---

## Task 1: Add `--good` CSS variables

**Files:**
- Modify: `src/index.css` (light theme block around lines 28–33; dark theme block around lines 66–68)

- [ ] **Step 1: Add `--good` and `--good-bg` to the light theme**

In `src/index.css`, find the light-theme severity block:

```css
  --high: #b43a2e;
  --high-bg: #f7dcd6;
  --med: #a56a1b;
  --med-bg: #f6e4c4;
  --low: #4e7b3a;
  --low-bg: #dde9cf;
```

Add two lines after `--low-bg`:

```css
  --good: #3f6f4a;
  --good-bg: #d6e6d2;
```

Rationale: `--good` is a slightly deeper green than `--low` (#4e7b3a) so the "Good/Excellent" band reads as a distinct positive accent rather than collapsing into the low-severity green.

- [ ] **Step 2: Add `--good-bg` to the dark theme**

Find the dark-theme block (around line 66):

```css
  --high-bg: #4a2118;
  --med-bg: #4a3716;
  --low-bg: #2c3e22;
```

Add after `--low-bg`:

```css
  --good-bg: #1f3a26;
```

Note: the dark theme only overrides the `*-bg` variants because the foreground colours stay readable in dark mode. Match that pattern — don't add a dark-mode `--good`.

- [ ] **Step 3: Verify CSS still parses**

Run: `npm run dev`
Expected: dev server starts without CSS errors. Open the page; the existing UI should look identical (no consumer of `--good` yet).

- [ ] **Step 4: Stage changes and pause for user review**

```bash
git add src/index.css
git status
```

Stop here. Tell the user: "Task 1 complete — `--good` CSS vars added. Please review the staged change before I continue."

---

## Task 2: Create the `computeScores` pure module

**Files:**
- Create: `src/lib/scoring.js`

- [ ] **Step 1: Create the file with constants and `bandFor`**

Create `src/lib/scoring.js`:

```js
// Pure scoring utilities. No React, no DOM, no side effects.
// Inputs: the audit's issues + strengths + selected criteria keys.
// Output: { overall, perCriterion, band, scoreNote } — see computeScores().

export const SEVERITY_WEIGHT = { HIGH: 3, MEDIUM: 2, LOW: 1 }

// Fallback impact when the model omits or returns an invalid impact field.
// Chosen so that omitted impacts roughly match what a thoughtful model would
// pick for a typical issue at that severity.
export const SEVERITY_IMPACT_DEFAULT = { HIGH: 4, MEDIUM: 3, LOW: 2 }

// Penalty multiplier; tuned so ~3 HIGH/impact-4 issues on a single criterion
// land near the Poor/Critical boundary (3 * 4 * 3 * 1.8 = 64.8 penalty → ~35).
export const K = 1.8

// Bands are ordered high → low so bandFor() can early-return.
export const BANDS = [
  { min: 90, label: 'Excellent', tone: 'good' },
  { min: 75, label: 'Good',      tone: 'good' },
  { min: 60, label: 'Fair',      tone: 'med'  },
  { min: 40, label: 'Poor',      tone: 'high' },
  { min: 0,  label: 'Critical',  tone: 'high' },
]

export function bandFor(score) {
  const n = Number.isFinite(score) ? score : 0
  return BANDS.find((b) => n >= b.min) ?? BANDS[BANDS.length - 1]
}
```

- [ ] **Step 2: Add the `computeScores` function**

Append to `src/lib/scoring.js`:

```js
function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

function coerceImpact(rawImpact, sev) {
  const n = Number(rawImpact)
  if (Number.isInteger(n) && n >= 1 && n <= 5) return n
  return SEVERITY_IMPACT_DEFAULT[sev] ?? 3
}

// Compute overall + per-criterion scores from a normalized audit.
//
// Arguments:
//   issues   — array of { sev, impact?, crit, ... }
//   strengths — array of strings (untagged; bonus is distributed evenly)
//   selected  — array of criterion keys actually evaluated
//
// Returns:
//   {
//     overall:      number 0–100,
//     perCriterion: { [key]: number 0–100 },
//     band:         { label, tone, min },
//     // scoreNote is NOT computed here; the caller attaches the LLM-provided
//     // scoreNote (or a fallback) separately.
//   }
export function computeScores({ issues = [], strengths = [], selected = [] }) {
  const selectedCount = Math.max(selected.length, 1)
  const strengthsBonus =
    Math.min((strengths.length || 0) * 2, 6) / selectedCount

  const perCriterion = {}
  for (const crit of selected) {
    const penalty = issues
      .filter((i) => i?.crit === crit)
      .reduce((sum, i) => {
        const impact = coerceImpact(i.impact, i.sev)
        const weight = SEVERITY_WEIGHT[i.sev] ?? SEVERITY_WEIGHT.LOW
        return sum + impact * weight
      }, 0)

    const raw = 100 - penalty * K + strengthsBonus
    perCriterion[crit] = clamp(Math.round(raw), 0, 100)
  }

  const values = Object.values(perCriterion)
  const overall = values.length
    ? clamp(Math.round(values.reduce((a, b) => a + b, 0) / values.length), 0, 100)
    : 100

  return { overall, perCriterion, band: bandFor(overall) }
}
```

- [ ] **Step 3: Smoke-test the math in a Node REPL**

Run from the project root:

```bash
node --input-type=module -e "import('./src/lib/scoring.js').then(m => {
  const r = m.computeScores({
    issues: [
      { sev: 'HIGH', impact: 5, crit: 'a11y' },
      { sev: 'HIGH', impact: 4, crit: 'a11y' },
      { sev: 'MEDIUM', impact: 3, crit: 'nielsen' },
      { sev: 'LOW', impact: 2, crit: 'nielsen' },
    ],
    strengths: ['Good visual hierarchy', 'Clear CTA'],
    selected: ['a11y', 'nielsen'],
  });
  console.log(JSON.stringify(r, null, 2));
})"
```

Expected output (within rounding):
- `perCriterion.a11y` ≈ `100 - (5*3 + 4*3) * 1.8 + 2 = 100 - 48.6 + 2 = ~53`
- `perCriterion.nielsen` ≈ `100 - (3*2 + 2*1) * 1.8 + 2 = 100 - 14.4 + 2 = ~88`
- `overall` = round((53 + 88) / 2) = `~71`
- `band.label` = `"Fair"` (60–74)

If the actual numbers are within ±1 of these, the math is right.

- [ ] **Step 4: Smoke-test the empty / fallback paths**

```bash
node --input-type=module -e "import('./src/lib/scoring.js').then(m => {
  console.log('empty:', m.computeScores({ selected: ['a11y'] }));
  console.log('missing impact:', m.computeScores({
    issues: [{ sev: 'HIGH', crit: 'a11y' }],
    selected: ['a11y'],
  }));
  console.log('bad impact:', m.computeScores({
    issues: [{ sev: 'HIGH', impact: 99, crit: 'a11y' }],
    selected: ['a11y'],
  }));
})"
```

Expected:
- `empty` → `overall: 100, perCriterion: { a11y: 100 }, band: Excellent`
- `missing impact` → uses SEVERITY_IMPACT_DEFAULT.HIGH (4), so penalty = 4*3*1.8 = 21.6 → score ~78
- `bad impact` → same as missing (rejects out-of-range, falls back to 4) → ~78

- [ ] **Step 5: Stage changes and pause for user review**

```bash
git add src/lib/scoring.js
git status
```

Stop here. Tell the user: "Task 2 complete — `computeScores` module created and smoke-tested. Please review."

---

## Task 3: Update the LLM prompt to request `impact` and `scoreNote`

**Files:**
- Modify: `src/prompts/systemUxAudit.js`

- [ ] **Step 1: Extend the JSON schema in the system prompt**

Open `src/prompts/systemUxAudit.js`. Find the schema block (lines 24–41 — the `'{'` to `'}'` lines).

Replace the existing issues entry and add `scoreNote`:

```js
    '{',
    '  "screen": "string",',
    '  "selected": ["criterion_key"],',
    '  "strengths": ["string"],',
    '  "issues": [',
    '    {',
    '      "sev": "HIGH|MEDIUM|LOW",',
    '      "impact": 1,',
    '      "principle": "string",',
    '      "body": "string",',
    '      "refs": ["string"],',
    '      "crit": "criterion_key"',
    '    }',
    '  ],',
    '  "counts": { "high": 0, "med": 0, "low": 0 },',
    '  "scoreNote": "string",',
    '  "roadmap": [',
    '    { "title": "string", "body": "string", "effort": "S|M|L" }',
    '  ]',
    '}',
```

- [ ] **Step 2: Add the impact rubric and scoreNote guidance to "Output constraints"**

Find the output constraints block (lines 43–47):

```js
    'Output constraints:',
    '- selected must match criteria provided by the user.',
    '- issues.crit must reference one of selected.',
    '- counts must match the severities in issues.',
    '- Provide 3 to 8 issues and 1 to 4 strengths when enough evidence exists.',
```

Append three new constraint lines after the existing five:

```js
    '- issues.impact is an integer 1-5 representing how much this issue hurts UX in the specific context of this screen.',
    '  Use 5 for issues that block a primary task (e.g. unlabeled checkout button); 3 for issues that cause meaningful friction; 1 for cosmetic-only issues. Calibrate to the screen context, not just severity.',
    '- scoreNote is one short sentence (under 25 words) summarising why the screen scores the way it does. Reference the dominant theme of the issues, not the number itself.',
```

- [ ] **Step 3: Verify the prompt still builds**

Run from the project root:

```bash
node --input-type=module -e "import('./src/prompts/systemUxAudit.js').then(m => {
  const p = m.buildSystemPrompt({ criteriaBlocks: [{ key: 'a11y', label: 'Accessibility', lines: ['Test'] }] });
  console.log(p);
})"
```

Expected: the printed prompt contains `"impact": 1`, `"scoreNote": "string"`, the impact rubric lines, and the scoreNote line. No JS syntax errors.

- [ ] **Step 4: Stage changes and pause for user review**

```bash
git add src/prompts/systemUxAudit.js
git status
```

Stop here. Tell the user: "Task 3 complete — prompt updated to request `impact` and `scoreNote`. Please review."

---

## Task 4: Wire `computeScores` into `normalizeAudit`

**Files:**
- Modify: `src/App.jsx` (the `normalizeAudit` callback, currently lines 112–130)

- [ ] **Step 1: Import the scoring module**

In `src/App.jsx`, add a new import below the existing imports near the top of the file (after the `guidelinesForCriteria` import):

```js
import { computeScores } from './lib/scoring'
```

- [ ] **Step 2: Extend `normalizeAudit` to attach `scores` and `scoreNote`**

Replace the entire `normalizeAudit` callback (currently lines 112–130):

```js
  const normalizeAudit = useCallback((raw, selectedKeys, fallbackScreen) => {
    const issues = Array.isArray(raw?.issues) ? raw.issues : []
    const strengths = Array.isArray(raw?.strengths) ? raw.strengths : []
    const selected = Array.isArray(raw?.selected) ? raw.selected.filter((k) => selectedKeys.includes(k)) : selectedKeys
    const countsFromIssues = {
      high: issues.filter((item) => item?.sev === 'HIGH').length,
      med: issues.filter((item) => item?.sev === 'MEDIUM').length,
      low: issues.filter((item) => item?.sev === 'LOW').length,
    }

    const scores = computeScores({ issues, strengths, selected })

    const rawNote = typeof raw?.scoreNote === 'string' ? raw.scoreNote.trim() : ''
    const scoreNote = rawNote || 'Based on the issues found above.'

    return {
      screen: raw?.screen || fallbackScreen,
      selected,
      strengths,
      issues,
      counts: raw?.counts || countsFromIssues,
      roadmap: Array.isArray(raw?.roadmap) ? raw.roadmap : [],
      scores,
      scoreNote,
    }
  }, [])
```

Notes for the implementer:
- The `scoreNote` fallback string matches what the spec specifies — keep it identical so the manual verification step matches.
- `computeScores` is called with raw `issues` (including possibly invalid `impact`). The pure module coerces invalid values internally — no pre-cleaning needed here.

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`

In the browser:
1. Upload any screenshot, write a short context (≥ 3 chars), keep the default criteria, click Analyze.
2. When the audit completes, open the browser devtools console.
3. There won't be a direct way to inspect `auditResult` from the console yet — instead, temporarily add `console.log('audit:', normalized)` right before `setAuditResult(normalized)` in `runAnalysis` (and remove it before Task 5).

Expected console output: the normalized audit has `scores: { overall, perCriterion, band }` and a non-empty `scoreNote` string.

- [ ] **Step 4: Remove the temporary console.log**

If you added the `console.log('audit:', normalized)` line in Step 3, delete it now. The normaliser changes are the only things that should remain.

- [ ] **Step 5: Stage changes and pause for user review**

```bash
git add src/App.jsx
git status
```

Stop here. Tell the user: "Task 4 complete — `normalizeAudit` now attaches `scores` and `scoreNote`. Please review."

---

## Task 5: Build the `<ScoreBlock>` component

**Files:**
- Create: `src/components/output/results/ScoreBlock.jsx`

- [ ] **Step 1: Create the component file**

Create `src/components/output/results/ScoreBlock.jsx`:

```jsx
import { SectionHead } from './StrengthsSection'
import { bandFor } from '../../../lib/scoring'
import { CRIT_META } from '../../../data/criteriaMeta'

// Maps the band's tone to the existing severity CSS vars.
// "good" uses the new --good / --good-bg pair; others reuse the
// severity vars so the score block visually rhymes with the Scorecard.
const TONE_CLASSES = {
  good: { fg: 'text-[var(--good)]', bar: 'bg-[var(--good)]',  track: 'bg-[var(--good-bg)]' },
  med:  { fg: 'text-[var(--med)]',  bar: 'bg-[var(--med)]',   track: 'bg-[var(--med-bg)]'  },
  high: { fg: 'text-[var(--high)]', bar: 'bg-[var(--high)]',  track: 'bg-[var(--high-bg)]' },
}

function toneFor(score) {
  return TONE_CLASSES[bandFor(score).tone] ?? TONE_CLASSES.med
}

export default function ScoreBlock({ scores, scoreNote, selected }) {
  if (!scores) return null
  const { overall, perCriterion, band } = scores
  const overallTone = TONE_CLASSES[band.tone] ?? TONE_CLASSES.med

  return (
    <div className="animate-fade-up-d1 mb-7">
      <SectionHead mark="§ 01" title="Overall" titleEm="score" />

      {/* Hero row: big numeral on the left, band + note on the right */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-5 mb-3">
        <div className="flex items-start gap-6">
          <div className="shrink-0">
            <div className={`font-serif text-[64px] leading-none font-normal ${overallTone.fg}`}>
              {overall}
            </div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--ink-4)] mt-1">
              / 100
            </div>
          </div>
          <div className="min-w-0 pt-2">
            <div className={`font-mono text-[11px] uppercase tracking-[0.1em] mb-2 ${overallTone.fg}`}>
              — {band.label} —
            </div>
            <p className="text-[14px] leading-[1.55] text-[var(--ink-2)] m-0" style={{ textWrap: 'pretty' }}>
              {scoreNote}
            </p>
          </div>
        </div>

        {/* Per-criterion rows */}
        {selected.length > 0 && (
          <div className="mt-5 pt-5 border-t border-dashed border-[var(--border)] flex flex-col gap-3">
            {selected.map((key) => {
              const score = perCriterion[key] ?? 0
              const subBand = bandFor(score)
              const tone = toneFor(score)
              const label = CRIT_META[key]?.label || key
              return (
                <div key={key} className="grid grid-cols-[1fr_auto_minmax(120px,180px)_auto] items-center gap-3">
                  <div className="text-[13px] text-[var(--ink-2)] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {label}
                  </div>
                  <div className={`font-serif text-[18px] leading-none ${tone.fg} tabular-nums`}>
                    {score}
                  </div>
                  <div className={`h-[6px] rounded-full overflow-hidden ${tone.track}`}>
                    <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${score}%` }} />
                  </div>
                  <div className={`font-mono text-[10.5px] uppercase tracking-[0.08em] ${tone.fg}`}>
                    {subBand.label}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

Implementation notes for the implementer:
- `SectionHead` is exported from `StrengthsSection.jsx` (see line 33 of that file) — reuse it, don't duplicate.
- `animate-fade-up-d1` is the same animation class the existing `<Scorecard>` uses; keeps the entrance timing consistent.
- `tabular-nums` keeps the score numbers from jittering across rows.
- The grid template `[1fr_auto_minmax(120px,180px)_auto]` gives: label flexes, score auto, bar grows up to 180px, band label auto. This matches the mock proportions in the spec.

- [ ] **Step 2: Stage changes and pause for user review**

```bash
git add src/components/output/results/ScoreBlock.jsx
git status
```

Stop here. Tell the user: "Task 5 complete — `<ScoreBlock>` component created. Visual verification happens in Task 6 once it's wired into Results."

---

## Task 6: Render `<ScoreBlock>` in `Results.jsx` and bump section markers

**Files:**
- Modify: `src/components/output/results/Results.jsx`
- Modify: `src/components/output/results/StrengthsSection.jsx` (one line: `§ 01` → `§ 02`)
- Modify: `src/components/output/results/IssuesSection.jsx` (one line: `§ 02` → `§ 03`)
- Modify: `src/components/output/results/RoadmapSection.jsx` (one line: `§ 03` → `§ 04`)

- [ ] **Step 1: Bump StrengthsSection marker**

In `src/components/output/results/StrengthsSection.jsx` line 8:

Change:
```jsx
      <SectionHead mark="§ 01" title="What's" titleEm="working" />
```

To:
```jsx
      <SectionHead mark="§ 02" title="What's" titleEm="working" />
```

- [ ] **Step 2: Bump IssuesSection marker**

In `src/components/output/results/IssuesSection.jsx` line 25:

Change:
```jsx
      <SectionHead mark="§ 02" title="Issues" titleEm="found" />
```

To:
```jsx
      <SectionHead mark="§ 03" title="Issues" titleEm="found" />
```

- [ ] **Step 3: Bump RoadmapSection marker**

In `src/components/output/results/RoadmapSection.jsx` line 6:

Change:
```jsx
      <SectionHead mark="§ 03" title="Prioritized" titleEm="roadmap" />
```

To:
```jsx
      <SectionHead mark="§ 04" title="Prioritized" titleEm="roadmap" />
```

- [ ] **Step 4: Import and render `<ScoreBlock>` in `Results.jsx`**

In `src/components/output/results/Results.jsx`:

Add the import after the existing `Scorecard` import (currently line 3):

```jsx
import ScoreBlock from './ScoreBlock'
```

Then, in the destructuring on line 9, add `scores` and `scoreNote`:

```jsx
  const { screen, selected, strengths, issues, counts, roadmap, scores, scoreNote } = audit
```

Then, insert `<ScoreBlock>` immediately before the existing `<Scorecard counts={counts} />` line (currently line 49):

```jsx
      <ScoreBlock scores={scores} scoreNote={scoreNote} selected={selected} />

      <Scorecard counts={counts} />
```

- [ ] **Step 5: Visually verify the score block end-to-end**

Run: `npm run dev`

In the browser:
1. Upload a screenshot (any UI), enter a short context (e.g. "Checkout step"), pick at least two criteria, click Analyze.
2. When the audit returns, confirm:
   - A new "§ 01 Overall score" block appears between the header and the existing severity counts.
   - The big serif numeral, "/ 100", and a band label (e.g. "— Good —") are present.
   - The `scoreNote` sentence reads naturally and references the issues.
   - One per-criterion row exists for each selected criterion, each with a number, a progress bar, and a band label.
   - The existing severity Scorecard, Strengths (now § 02), Issues (now § 03), and Roadmap (now § 04) all still render correctly underneath.
3. Toggle the theme to dark in the Tweaks panel (if accessible) and confirm the score block stays readable — band colours use the existing `--high`/`--med` vars plus the new `--good`.

Common failure modes to check:
- Band colour wrong → check `band.tone` is one of `'good' | 'med' | 'high'` (returned from `BANDS` in `scoring.js`).
- Progress bar width clipped → `width: ${score}%` requires the parent to be display block/flex with a fixed-ish width; the grid column `minmax(120px,180px)` provides that.
- `scoreNote` missing → confirm Task 4 attached it; if not, fallback string `"Based on the issues found above."` should appear.

- [ ] **Step 6: Stage changes and pause for user review**

```bash
git add src/components/output/results/Results.jsx \
        src/components/output/results/StrengthsSection.jsx \
        src/components/output/results/IssuesSection.jsx \
        src/components/output/results/RoadmapSection.jsx
git status
```

Stop here. Tell the user: "Task 6 complete — `<ScoreBlock>` is rendered and the section markers are renumbered. Please review the running app and the staged diff."

---

## Task 7: Final pass — readiness for review

- [ ] **Step 1: Confirm no temporary debug code remains**

Run: `Grep` for `console.log` inside `src/App.jsx`. There should be **zero** matches inside `runAnalysis` (the file may have other unrelated logs, but none added during this work).

- [ ] **Step 2: Confirm the full audit flow still works end-to-end**

Run: `npm run dev`. Upload a screenshot, run an analysis, confirm:
- No console errors during analysis or render.
- The score block, severity counts, strengths, issues, and roadmap all render in the expected `§ 01 → § 04` order.
- The Tweaks panel (if opened via the postMessage protocol) still works — toggling theme/density/format does not break the score block layout.

- [ ] **Step 3: Final staged-diff summary for the user**

```bash
git status
git diff --stat
```

Tell the user: "All seven tasks complete. Summary of changes:
- `src/index.css` — added `--good` / `--good-bg`
- `src/lib/scoring.js` — new pure scoring module
- `src/prompts/systemUxAudit.js` — schema now includes `impact` and `scoreNote`
- `src/App.jsx` — `normalizeAudit` attaches `scores` and `scoreNote`
- `src/components/output/results/ScoreBlock.jsx` — new score block component
- `src/components/output/results/Results.jsx` — renders `<ScoreBlock>`
- Three sibling section components — section markers bumped to § 02–§ 04

Ready for your review and commit."

---

## Self-Review Notes

Quick check against the spec at `docs/superpowers/specs/2026-06-03-ux-scoring-system-design.md`:

| Spec requirement | Covered by |
|---|---|
| `issues[].impact` 1–5 in schema | Task 3 |
| `scoreNote` in schema | Task 3 |
| Deterministic `computeScores` with K=1.8 | Task 2 |
| Per-criterion + overall scores | Task 2 (overall = mean of perCriterion) |
| Strengths bonus distributed evenly | Task 2 (`strengthsBonus / selectedCount`) |
| Band labels (Excellent/Good/Fair/Poor/Critical) | Task 2 (`BANDS`) |
| Fallback for missing/invalid `impact` | Task 2 (`coerceImpact`) |
| Fallback for missing `scoreNote` | Task 4 |
| `--good` CSS var added to light + dark | Task 1 |
| Score block between header and Scorecard | Task 6 Step 4 |
| Section markers shift to § 02–§ 04 | Task 6 Steps 1–3 |
| Hero numeral + band + note + per-criterion rows | Task 5 |
| Reuse existing `SectionHead` | Task 5 (imported from StrengthsSection) |

No gaps found.
