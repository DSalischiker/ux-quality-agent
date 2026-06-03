const CRITERIA = [
  {
    key: 'nielsen',
    label: 'Nielsen heuristics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    key: 'a11y',
    label: 'Accessibility (WCAG)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="1.6" /><path d="M5 8h14" /><path d="M12 8v6" /><path d="m8.5 21 3.5-7 3.5 7" />
      </svg>
    ),
  },
  {
    key: 'hierarchy',
    label: 'Visual hierarchy',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    key: 'copy',
    label: 'Copy clarity',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    key: 'mobile',
    label: 'Mobile readiness',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
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

      <div className="grid grid-cols-5 gap-[25px]">
        {CRITERIA.map(c => {
          const pressed = criteria.has(c.key)
          return (
            <button
              key={c.key}
              aria-pressed={pressed}
              onClick={() => onToggle(c.key)}
              className={[
                'group relative flex flex-col items-center text-center gap-2 px-2 pt-3.5 pb-2.5 rounded-[10px] border-[1px]! border-solid! transition-colors duration-150 select-none',
                pressed
                  ? 'bg-[var(--accent-soft)] border-[var(--accent-2)]!'
                  : 'bg-[var(--surface)] border-[#cec6ba]! hover:bg-[var(--surface-2)]',
              ].join(' ')}
            >
              {/* Icon */}
              <span className={[
                'grid place-items-center transition-colors duration-150 [&_svg]:w-[20px] [&_svg]:h-[20px]',
                pressed ? 'text-[var(--accent-2)]' : 'text-[var(--ink-3)] group-hover:text-[var(--ink-2)]',
              ].join(' ')}>
                {c.icon}
              </span>

              {/* Label */}
              <span className={[
                'text-[11px] font-medium leading-tight transition-colors duration-150 min-h-[26px] flex items-center',
                pressed ? 'text-[var(--accent-2)]' : 'text-[var(--ink-2)]',
              ].join(' ')}>
                {c.label}
              </span>

              {/* Indicator */}
              <span className={[
                'w-[16px] h-[16px] rounded-full border-[1.5px] grid place-items-center transition-colors duration-150 [&_svg]:w-[10px] [&_svg]:h-[10px]',
                pressed
                  ? 'bg-[var(--accent)] border-[var(--accent)] [&_svg]:opacity-100 [&_svg]:stroke-[var(--accent-ink)]'
                  : 'bg-[var(--surface-2)] border-[var(--border-strong)] [&_svg]:opacity-0',
              ].join(' ')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                  <polyline points="4 12 10 18 20 6"/>
                </svg>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
