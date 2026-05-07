const CRITERIA = [
  { key: 'nielsen',   label: 'Nielsen heuristics' },
  { key: 'a11y',      label: 'Accessibility (WCAG)' },
  { key: 'hierarchy', label: 'Visual hierarchy' },
  { key: 'copy',      label: 'Copy clarity' },
  { key: 'mobile',    label: 'Mobile readiness' },
]

export default function CriteriaField({ criteria, onToggle }) {
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--ink-3)]">
          <span className="font-mono text-[var(--ink-4)] font-normal">03</span>
          Evaluation criteria
        </div>
        <div className="text-[11px] text-[var(--ink-4)] font-mono">
          {criteria.size} selected
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CRITERIA.map(c => {
          const pressed = criteria.has(c.key)
          return (
            <button
              key={c.key}
              aria-pressed={pressed}
              onClick={() => onToggle(c.key)}
              className={[
                'inline-flex items-center gap-2 py-2 pr-3.5 pl-2.5 rounded-full border text-[12.5px] font-medium transition-all duration-150 select-none',
                pressed
                  ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-2)]'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--ink-2)] hover:border-[var(--border-strong)]',
              ].join(' ')}
            >
              <span className={[
                'w-4 h-4 rounded-full border-[1.5px] grid place-items-center transition-all duration-150 [&_svg]:w-2.5 [&_svg]:h-2.5',
                pressed
                  ? 'bg-[var(--accent)] border-[var(--accent)] [&_svg]:opacity-100 [&_svg]:stroke-[var(--accent-ink)]'
                  : 'bg-[var(--surface-2)] border-[var(--border-strong)] [&_svg]:opacity-0',
              ].join(' ')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="4 12 10 18 20 6"/>
                </svg>
              </span>
              {c.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
