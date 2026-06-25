export default function Topbar({ tweaksBtnVisible, onTweaksOpen }) {
  return (
    <header className="flex items-center justify-between px-7 py-4 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-20 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Brand mark */}
        <div className="w-7 h-7 rounded-lg bg-[var(--ink)] text-[var(--bg)] grid place-items-center font-serif text-xl italic leading-none pb-0.5">
          q
        </div>
        <div className="text-sm font-semibold tracking-[-0.01em]">
          UX QA{' '}
          <em className="font-serif not-italic font-normal text-[var(--ink-3)] ml-1">agent</em>
        </div>
        {/* <span className="text-[11px] text-[var(--ink-3)] font-mono px-2 py-1 border border-[var(--border)] rounded-full bg-[var(--surface)]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4e7b3a] mr-1.5 align-[1px] animate-token-pulse" />
          claude‑sonnet‑4
        </span> */}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative group flex items-center justify-center">
          <div className="pointer-events-none px-2 py-1/2 rounded-md bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border)] text-[11px] font-medium whitespace-nowrap">
            Coming soon
          </div>
          <IconBtn title="History">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>
            </svg>
          </IconBtn>
        </div>

        {tweaksBtnVisible && (
          <IconBtn title="Tweaks" onClick={onTweaksOpen}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
            </svg>
          </IconBtn>
        )}
      </div>
    </header>
  )
}

export function IconBtn({ children, onClick, title, style }) {
  return (
    <button
      className="w-8 h-8 grid place-items-center border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--ink-2)] transition-all duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--ink)] hover:border-[var(--border-strong)] [&_svg]:w-3.5 [&_svg]:h-3.5"
      onClick={onClick}
      title={title}
      style={style}
    >
      {children}
    </button>
  )
}
