const SCORES = [
  { key: 'high', label: 'High severity', colorClass: 'text-[var(--high)]', accentBg: 'bg-[var(--high)]' },
  { key: 'med',  label: 'Medium',        colorClass: 'text-[var(--med)]',  accentBg: 'bg-[var(--med)]'  },
  { key: 'low',  label: 'Low',           colorClass: 'text-[var(--low)]',  accentBg: 'bg-[var(--low)]'  },
]

export default function Scorecard({ counts }) {
  return (
    <div className="animate-fade-up-d1 grid grid-cols-3 gap-2 mb-7">
      {SCORES.map(s => (
        <div key={s.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-3.5 relative overflow-hidden">
          <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${s.accentBg}`} />
          <div className="text-[10.5px] font-mono uppercase tracking-[0.08em] text-[var(--ink-3)]">{s.label}</div>
          <div className={`font-serif text-[34px] leading-none mt-1 font-normal ${s.colorClass}`}>
            {counts[s.key]}
          </div>
        </div>
      ))}
    </div>
  )
}
