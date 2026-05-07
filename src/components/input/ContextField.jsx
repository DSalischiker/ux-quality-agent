const HINTS = [
  { label: 'Onboarding', text: 'Mobile onboarding — first-run screen for new users signing up.' },
  { label: 'Checkout',   text: 'Checkout step — returning customers on desktop completing a purchase.' },
  { label: 'Dashboard',  text: 'Admin dashboard — internal ops team viewing daily metrics.' },
  { label: 'Settings',   text: 'Settings page — power users managing notifications and integrations.' },
]

const MAX = 500

export default function ContextField({ context, onContextChange }) {
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--ink-3)]">
          <span className="font-mono text-[var(--ink-4)] font-normal">02</span>
          Context
          <span className="text-[var(--accent)] font-normal ml-1">*</span>
        </div>
        <div className="text-[11px] text-[var(--ink-4)] font-mono">
          {context.length} / {MAX}
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-3.5 py-3 transition-all duration-150 focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_var(--accent-soft)]">
        <textarea
          value={context}
          onChange={(e) => onContextChange(e.target.value)}
          maxLength={MAX}
          placeholder="What screen is this, and who uses it? e.g. 'Checkout step 2 for first-time buyers on desktop — shipping and payment.'"
          className="w-full border-none outline-none bg-transparent resize-y min-h-[84px] text-[13px] leading-[1.55] placeholder:text-[var(--ink-5)]"
        />

        <div className="flex justify-between items-center pt-2.5 mt-2 border-t border-dashed border-[var(--border)] text-[11px] text-[var(--ink-4)] font-mono">
          <span>Suggestions</span>
          <div className="flex gap-1.5 flex-wrap">
            {HINTS.map(h => (
              <button
                key={h.label}
                onClick={() => onContextChange(h.text)}
                className="px-2 py-[3px] rounded-full bg-[var(--bg-sunken)] border border-[var(--border)] text-[10.5px] text-[var(--ink-3)] transition-all duration-[120ms] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-2)] hover:border-[var(--accent)]"
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
