import { mdInline } from '../../../utils/text'

export default function StrengthsSection({ strengths, format }) {
  const isNarrative = format === 'narrative'

  return (
    <div className="animate-fade-up-d2 mb-7">
      <SectionHead mark="§ 02" title="What's" titleEm="working" />
      <div className={['flex flex-col', isNarrative ? 'gap-0 border-b border-[var(--border)]' : 'gap-2.5'].join(' ')}>
        {strengths.map((s, i) => (
          <div
            key={i}
            className={[
              'flex gap-3 text-[13.5px] leading-[1.55]',
              isNarrative
                ? 'border-t border-[var(--border)] py-3.5'
                : 'px-4 py-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)]',
            ].join(' ')}
          >
            <span className="shrink-0 w-[18px] h-[18px] rounded-full bg-[var(--low-bg)] text-[var(--low)] grid place-items-center mt-0.5 [&_svg]:w-2.5 [&_svg]:h-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="5 12 10 17 19 7"/>
              </svg>
            </span>
            <div dangerouslySetInnerHTML={{ __html: mdInline(s) }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SectionHead({ mark, title, titleEm }) {
  return (
    <div className="flex items-baseline gap-3 mb-3.5">
      <span className="font-mono text-[10.5px] font-medium tracking-[0.1em] uppercase text-[var(--ink-4)]">{mark}</span>
      <h3 className="font-serif text-[22px] leading-[1.1] font-normal m-0 tracking-[-0.005em]">
        {title} <em className="italic text-[var(--accent)]">{titleEm}</em>
      </h3>
      <span className="flex-1 h-px bg-[var(--border)] translate-y-[-4px]" />
    </div>
  )
}
