# UX Scoring System — Design

**Date:** 2026-06-03
**Status:** Approved, ready for implementation plan
**Scope:** Add an overall + per-criterion score to the audit output.

## Goal

Give users a quick, comparable signal of how good a screen is, plus a per-criterion breakdown that points at the weakest areas. Today the output shows only severity counts; users have to read every issue to form a quality judgement.

## Non-goals

- Tracking scores across multiple audits over time (no history/storage).
- Showing scores during the loading phase.
- Exposing the impact weight on individual issue cards.

## Scoring model

### Inputs (new fields the LLM must return)

- **`issues[].impact`** — integer 1–5. The model decides how much each issue hurts UX in the specific context of this screen. A missing button label on a checkout step warrants a 5; the same issue on a marketing splash warrants a 3.
- **`scoreNote`** — one short sentence (≤ 25 words) explaining why the overall score lands where it does. Used as supporting copy in the score block.

Existing fields (`sev`, `crit`, `strengths`, `selected`) are unchanged.

### Computation (deterministic, in code)

```
SEVERITY_WEIGHT = { HIGH: 3, MED: 2, LOW: 1 }
issuePenalty(issue) = issue.impact × SEVERITY_WEIGHT[issue.sev]   // range 1–15

strengthsBonusPerCriterion =
  min(totalStrengths × 2, 6) / selectedCount

perCriterionScore(crit):
  penalty = sum(issuePenalty(i) for i in issues where i.crit == crit)
  raw     = 100 − (penalty × K) + strengthsBonusPerCriterion
  score   = clamp(round(raw), 0, 100)

overallScore:
  arithmetic mean of all per-criterion scores for selected criteria
  rounded to nearest integer
```

`K` is a tuning constant. Start at `K = 1.8` so that ~3 HIGH issues (impact 4 average) on a single criterion lands in the Poor/Critical boundary:

- 3 × (4 × 3) × 1.8 = 64.8 penalty → score ≈ 35.

We will re-tune after dogfooding a handful of real screenshots.

**Strengths attribution:** strengths are currently flat strings without a `crit` tag. For v1 we distribute the strengths bonus evenly across all selected criteria (see `strengthsBonusPerCriterion` above). If we later want per-criterion attribution, the model can start tagging strengths with `crit` — a forward-compatible additive change.

### Bands

| Score range | Band |
|---|---|
| 90–100 | Excellent |
| 75–89 | Good |
| 60–74 | Fair |
| 40–59 | Poor |
| 0–39 | Critical |

Excellent and Good map to a new `--good` (green) CSS var. Fair maps to `--med` (amber). Poor and Critical map to `--high` (red).

### Robustness / fallbacks

| Field missing or invalid | Behaviour |
|---|---|
| `issues[].impact` missing or not in 1–5 | Fall back to severity defaults: HIGH→4, MED→3, LOW→2. |
| `scoreNote` missing or empty | Render generated fallback: `"Based on the issues found above."` |
| `issues` empty for a selected criterion | That criterion scores 100. |
| No selected criteria | Should not happen (UI blocks analysis) — overall score = 100. |

These fallbacks keep older response shapes working and prevent the score block from breaking the layout.

## Visual design

A new block titled **§ 01 Score**, placed between the audit header and the existing Scorecard. The current section markers shift down by one: Strengths `§ 01 → § 02`, Issues `§ 02 → § 03`, Roadmap `§ 03 → § 04`.

```
┌────────────────────────────────────────────────────────────────┐
│ § 01  Score                                                    │
│                                                                │
│   ╔══════════════╗                                             │
│   ║              ║   ── Good ──                                │
│   ║      72      ║   Solid overall. A few accessibility gaps   │
│   ║   / 100      ║   pull this below the Excellent band.       │
│   ║              ║                                             │
│   ╚══════════════╝                                             │
│                                                                │
│   ─────────────────────────────────────────────────────────    │
│                                                                │
│   Nielsen heuristics      78  ████████████████░░░░  Good       │
│   Accessibility (WCAG)    54  ███████████░░░░░░░░░  Poor       │
│   Visual hierarchy        80  ████████████████░░░░  Good       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

Detailed treatment:

- **Numeral:** ~64px serif (matches existing `font-serif` family). `/ 100` underneath in mono, small, muted.
- **Band label and note:** band uppercase in mono (`text-[11px] tracking-[0.1em]`), in the band colour. `scoreNote` below it in `text-[var(--ink-2)]` at ~14px.
- **Divider:** thin border using `--border`.
- **Per-criterion rows:** label left (mono, muted), score number (serif, ~18px), thin progress bar (~6px tall, rounded), band label right (mono, small, in band colour). Bar fill colour matches the band.

## Affected code

| Change | File |
|---|---|
| Add `impact` and `scoreNote` to the schema; describe scoring intent and the impact rubric for the LLM | `src/prompts/systemUxAudit.js` |
| New pure module: `computeScores(issues, strengths, selected) → { overall, perCriterion, band, scoreNote }` | new `src/lib/scoring.js` |
| Validate `impact`, surface `scoreNote`, call `computeScores`, attach `scores` to the normalized audit object | `normalizeAudit` in `src/App.jsx` |
| New visual block | new `src/components/output/results/ScoreBlock.jsx` |
| Render `<ScoreBlock>` between header and `<Scorecard>`; bump existing section markers | `src/components/output/results/Results.jsx` |
| Add `--good` (green) CSS var, plus `--good-bg` to match the existing `--high-bg` / `--med-bg` / `--low-bg` family | wherever `--high` is defined (likely `src/index.css` or `src/App.css`) |

## Out of scope / future

- Tagging strengths with a `crit` field for direct per-criterion attribution.
- Score history / trend lines across audits.
- User-tunable severity weights or `K`.
- Showing score deltas vs. a prior audit of the same screen.
