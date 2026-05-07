import EmptyState from './EmptyState'
import LoadingState from './LoadingState'
import Results from './results/Results'

export default function OutputPane({ phase, auditResult, loadingStep, format }) {
  return (
    <section className="pane p-[var(--pad-xl)] overflow-y-auto min-h-[calc(100vh-61px)] bg-[var(--bg-sunken)]">
      {phase === 'idle'    && <EmptyState />}
      {phase === 'loading' && <LoadingState currentStep={loadingStep} />}
      {phase === 'done'    && auditResult && <Results audit={auditResult} format={format} />}
    </section>
  )
}
