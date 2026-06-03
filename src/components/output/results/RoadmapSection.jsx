import { SectionHead } from './StrengthsSection'

export default function RoadmapSection({ roadmap }) {
  return (
    <div className="animate-fade-up-d4">
      <SectionHead mark="§ 04" title="Prioritized" titleEm="roadmap" />
      <div className="flex flex-col">
        {roadmap.map((r, i) => (
          <div
            key={i}
            className="grid gap-4 py-4 border-t border-[var(--border)] last:border-b items-start"
            style={{ gridTemplateColumns: '32px 1fr auto' }}
          >
            <div className="font-serif text-[28px] leading-none text-[var(--accent)] italic mt-[-4px]">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="text-sm leading-[1.55]">
              <strong className="block font-semibold mb-1">{r.title}</strong>
              <span className="text-[var(--ink-3)]">{r.body}</span>
            </div>
            <div className="font-mono text-[10.5px] text-[var(--ink-4)] px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-full whitespace-nowrap">
              {r.effort} effort
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
