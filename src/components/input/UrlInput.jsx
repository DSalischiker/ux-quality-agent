import { validateUserUrl } from '../../utils/url'

export default function UrlInput({ url, onChange }) {
  const validation = validateUserUrl(url)
  const showError = url.trim().length > 0 && !validation.valid

  return (
    <div>
      <div
        className={[
          'relative flex items-center bg-[var(--surface)] border rounded-[var(--radius-md)] px-3.5 transition-all duration-150 focus-within:shadow-[0_0_0_3px_var(--accent-soft)]',
          showError
            ? 'border-[var(--high)] focus-within:border-[var(--high)]'
            : 'border-[var(--border)] focus-within:border-[var(--accent)]',
        ].join(' ')}
      >
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
          aria-invalid={showError}
          className="flex-1 border-none outline-none bg-transparent py-3.5 text-[13px] font-mono placeholder:text-[var(--ink-5)]"
        />
      </div>
      {showError && (
        <p className="text-[11px] font-mono text-[var(--high)] mt-2 m-0" role="alert">
          {validation.error}
        </p>
      )}
    </div>
  )
}
