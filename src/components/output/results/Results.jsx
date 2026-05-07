import { IconBtn } from '../../Topbar'
import { CRIT_META } from '../../../data/mockAudit'
import Scorecard from './Scorecard'
import StrengthsSection from './StrengthsSection'
import IssuesSection from './IssuesSection'
import RoadmapSection from './RoadmapSection'

export default function Results({ audit, format }) {
  const { screen, selected, strengths, issues, counts, roadmap } = audit
  const critLabels = selected.map(k => CRIT_META[k]?.label).filter(Boolean)
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="animate-fade-up flex items-start justify-between gap-5 pb-5 mb-7 border-b border-[var(--border)]">
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--accent-2)] mb-2.5">
            Audit · {date}
          </div>
          <h1 className="font-serif text-[30px] leading-[1.18] font-normal m-0 mb-3 tracking-[-0.005em]" style={{ textWrap: 'pretty' }}>
            <em className="italic text-[var(--accent)]">Screen</em> — {screen || 'Interface under review'}
          </h1>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {critLabels.map(l => (
              <span key={l} className="text-[10.5px] font-mono text-[var(--ink-3)] px-2 py-[3px] rounded-full bg-[var(--surface)] border border-[var(--border)]">
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <IconBtn title="Copy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </IconBtn>
          <IconBtn title="Export">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </IconBtn>
        </div>
      </div>

      <Scorecard counts={counts} />

      {strengths.length > 0 && (
        <StrengthsSection strengths={strengths} format={format} />
      )}

      <IssuesSection issues={issues} format={format} />

      <RoadmapSection roadmap={roadmap} />
    </div>
  )
}
