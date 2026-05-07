export default function InputPane({ children }) {
  return (
    <section className="pane p-[var(--pad-xl)] overflow-y-auto min-h-[calc(100vh-61px)] bg-[var(--bg)] border-r border-[var(--border)]">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-serif text-[32px] leading-none font-normal tracking-[-0.01em]">
          New <em className="italic text-[var(--accent)]">audit</em>
        </h1>
        <div className="text-xs text-[var(--ink-3)] font-mono uppercase tracking-[0.08em]">Brief</div>
      </div>
      {children}
    </section>
  )
}
