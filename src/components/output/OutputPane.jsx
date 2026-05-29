import EmptyState from './EmptyState'
import LoadingState from './LoadingState'
import Results from './results/Results'
import ErrorState from './ErrorState'

function providerLabel(value) {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'gemini') return 'Gemini'
  if (normalized === 'openrouter') return 'OpenRouter'
  return value || ''
}

export default function OutputPane({ phase, auditResult, loadingStep, loadingPreviewUrl, format, errorMessage, providerUsed, onRetry }) {
  const label = providerLabel(providerUsed)
  return (
    <section className="pane p-[var(--pad-xl)] overflow-y-auto min-h-[calc(100vh-61px)] bg-[var(--bg-sunken)]">
      {!!label && (
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-[3px] text-[10.5px] font-mono uppercase tracking-[0.08em] text-[var(--ink-3)]">
            Provider: {label}
          </span>
        </div>
      )}
      {phase === 'idle'    && <EmptyState />}
      {phase === 'loading' && (
        <LoadingState currentStep={loadingStep} previewImageUrl={loadingPreviewUrl} />
      )}
      {phase === 'done'    && auditResult && <Results audit={auditResult} format={format} />}
      {phase === 'error'   && <ErrorState message={errorMessage} providerUsed={label} onRetry={onRetry} />}
    </section>
  )
}
