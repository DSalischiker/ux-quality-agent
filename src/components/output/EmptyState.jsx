export default function EmptyState() {
  return (
    <div className="h-full min-h-[70vh] flex items-center justify-center text-center px-10">
      <div className="max-w-[360px]">
        <div className="illo-rings w-24 h-24 mx-auto mb-5 rounded-full bg-[var(--surface)] grid place-items-center text-[var(--ink-4)] border border-dashed border-[var(--border-strong)] relative [&_svg]:w-8 [&_svg]:h-8">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/>
            <path d="m20 20-3.5-3.5"/>
            <path d="M11 8v6"/>
            <path d="M8 11h6"/>
          </svg>
        </div>
        <h2 className="font-serif text-[28px] font-normal m-0 mb-2.5 tracking-[-0.01em]">
          Your audit appears <em className="italic text-[var(--accent)]">here</em>
        </h2>
        <p className="text-[13.5px] text-[var(--ink-3)] leading-[1.55] m-0">
          Fill in the brief on the left — a source, a line of context, and which criteria matter. I'll return strengths, ranked issues, and a prioritized roadmap.
        </p>
      </div>
    </div>
  )
}
