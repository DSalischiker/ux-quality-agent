export default function UrlInput({ url, onChange }) {
  return (
    <div className="relative flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-3.5 transition-all duration-150 focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_var(--accent-soft)]">
      <span className="font-mono text-xs text-[var(--ink-4)] pr-2.5 border-r border-[var(--border)] mr-2.5">
        https://
      </span>
      <input
        type="text"
        value={url}
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder="app.linear.app/dashboard"
        autoComplete="off"
        spellCheck={false}
        className="flex-1 border-none outline-none bg-transparent py-3.5 text-[13px] font-mono placeholder:text-[var(--ink-5)]"
      />
    </div>
  )
}
