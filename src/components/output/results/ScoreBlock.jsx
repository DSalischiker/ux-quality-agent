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
