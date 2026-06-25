import { useState } from 'react'
import { SectionHead } from './StrengthsSection'

const SEV_BADGE = {
  HIGH:   { label: 'HIGH', classes: 'bg-[var(--high-bg)] text-[var(--high)]' },
  MEDIUM: { label: 'MED',  classes: 'bg-[var(--med-bg)]  text-[var(--med)]'  },
  LOW:    { label: 'LOW',  classes: 'bg-[var(--low-bg)]  text-[var(--low)]'  },
}

export default function IssuesSection({ issues, format }) {
  const [openSet, setOpenSet] = useState(() => new Set(issues.slice(0, 2).map((_, i) => i)))
  const isNarrative = format === 'narrative'

  const toggle = (idx) => {
    if (isNarrative) return
    setOpenSet(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  return (
    <div className="animate-fade-up-d3 mb-7">
      <SectionHead mark="§ 03" title="Issues" titleEm="found" />
      <div className={['flex flex-col', isNarrative ? 'gap-0' : 'gap-3'].join(' ')}>
        {issues.map((iss, idx) => {
          const isOpen = isNarrative || openSet.has(idx)
          const badge  = SEV_BADGE[iss.sev] || SEV_BADGE.LOW
          return (
            <div
              key={idx}
              className={[
                isNarrative
                  ? 'border-t border-[var(--border)] py-4 last:border-b'
                  : 'bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden',
              ].join(' ')}
            >
              {/* Head */}
              <div
                role={isNarrative ? undefined : 'button'}
                tabIndex={isNarrative ? undefined : 0}
                onClick={() => toggle(idx)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(idx) }}
                className={[
                  'flex items-center gap-3 select-none',
                  isNarrative
                    ? 'p-0 cursor-default'
                    : 'px-4 py-3.5 cursor-pointer transition-colors duration-[120ms] hover:bg-[var(--surface-2)]',
                ].join(' ')}
              >
                <span className="font-mono text-[11px] text-[var(--ink-4)] min-w-[18px]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className={`inline-flex items-center gap-[5px] text-[10.5px] font-semibold tracking-[0.06em] uppercase px-2 py-[3px] rounded-[5px] font-mono shrink-0 ${badge.classes}`}>
                  <span className="w-[5px] h-[5px] rounded-full bg-current" />
                  {badge.label}
                </span>
                <span className="text-[13.5px] font-medium flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                  {iss.principle}
                </span>
                {!isNarrative && (
                  <span className={['text-[var(--ink-4)] transition-transform duration-200', isOpen ? 'rotate-90' : ''].join(' ')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 6 15 12 9 18"/>
                    </svg>
                  </span>
                )}
              </div>

              {/* Body */}
              {isOpen && (
                <div className={[
                  'text-[13px] leading-[1.6] text-[var(--ink-2)]',
                  isNarrative
                    ? 'pt-2.5 pl-11 pb-0'
                    : 'px-4 pb-4 pt-3.5 border-t border-dashed border-[var(--border)]',
                ].join(' ')}>
                  {iss.body}
                  {iss.refs?.length > 0 && (
                    <div className="mt-2.5 flex gap-1.5 flex-wrap">
                      {iss.refs.map(r => (
                        <span key={r} className="font-mono text-[10.5px] text-[var(--ink-3)] px-2 py-[3px] rounded bg-[var(--bg-sunken)] border border-[var(--border)]">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
