const ICONS = {
  high: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  med: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  low: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
}

const SCORES = [
  {
    key: 'high',
    label: 'High severity',
    colorClass: 'text-[var(--high)]',
    bgClass: 'bg-[var(--high-bg)]',
    borderClass: 'border-[var(--high)]/35',
  },
  {
    key: 'med',
    label: 'Medium',
    colorClass: 'text-[var(--med)]',
    bgClass: 'bg-[var(--med-bg)]',
    borderClass: 'border-[var(--med)]/35',
  },
  {
    key: 'low',
    label: 'Low',
    colorClass: 'text-[var(--low)]',
    bgClass: 'bg-[var(--low-bg)]',
    borderClass: 'border-[var(--low)]/35',
  },
]

export default function Scorecard({ counts }) {
  return (
    <div className="animate-fade-up-d1 grid grid-cols-3 gap-2 mb-7">
      {SCORES.map(s => (
        <div
          key={s.key}
          className={`${s.bgClass} ${s.borderClass} border rounded-[var(--radius-md)] p-3.5 relative overflow-hidden`}
        >
          <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${s.colorClass}`} style={{ backgroundColor: 'currentColor' }} />
          <div className="flex items-center justify-between">
            <div className={`text-[10.5px] font-mono uppercase tracking-[0.08em] ${s.colorClass}`}>
              {s.label}
            </div>
            <span className={`${s.colorClass} [&_svg]:w-4 [&_svg]:h-4 opacity-90`}>
              {ICONS[s.key]}
            </span>
          </div>
          <div className={`font-serif text-[34px] leading-none mt-2 font-normal ${s.colorClass}`}>
            {counts[s.key]}
          </div>
        </div>
      ))}
    </div>
  )
}
