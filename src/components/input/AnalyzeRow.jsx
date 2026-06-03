export default function AnalyzeRow({ ready, readinessText, onAnalyze, onReset }) {
  return (
    <div className="flex items-center gap-3 mt-8 pt-5 border-t border-[var(--border)]">
      {/* Analyze button */}
      <button
        disabled={!ready}
        onClick={onAnalyze}
        className={[
          'inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-[14px] font-semibold tracking-[-0.01em] transition-all duration-150 relative overflow-hidden bg-[var(--ink)] text-[var(--bg)] [&_svg]:w-4 [&_svg]:h-4',
          ready
            ? 'shadow-[0_4px_14px_-2px_rgba(31,27,21,0.35)] hover:bg-[var(--accent)] hover:shadow-[0_6px_20px_-2px_rgba(184,92,60,0.45)] hover:-translate-y-px active:translate-y-0 active:shadow-[0_2px_8px_-2px_rgba(31,27,21,0.35)]'
            : 'opacity-40 cursor-not-allowed',
        ].join(' ')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 4 4L19 6"/>
        </svg>
        Run Analysis
        <span className="font-mono text-[10.5px] px-[6px] py-[3px] bg-white/15 rounded-md ml-1.5">⌘↵</span>
      </button>

      {/* Reset button */}
      <button
        onClick={onReset}
        title="Reset"
        className="inline-flex items-center gap-2 px-3.5 py-[11px] rounded-[10px] text-[13px] font-medium transition-all duration-150 text-[var(--ink-3)] border border-[var(--border)] bg-transparent hover:text-[var(--ink)] hover:bg-[var(--surface)] hover:border-[var(--border-strong)] [&_svg]:w-[13px] [&_svg]:h-[13px]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>
        </svg>
      </button>

      {/* Readiness indicator */}
      <div className={[
        'ml-auto text-[11px] font-mono flex items-center gap-1.5',
        ready ? 'text-[var(--low)]' : 'text-[var(--ink-4)]',
      ].join(' ')}>
        <span className={[
          'w-1.5 h-1.5 rounded-full transition-colors duration-150',
          ready ? 'bg-[var(--low)]' : 'bg-[var(--ink-5)]',
        ].join(' ')} />
        {readinessText}
      </div>
    </div>
  )
}
