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
