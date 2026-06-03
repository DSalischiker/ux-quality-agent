import { useState, useEffect, useRef } from 'react'

const STEPS = [
  'Reading the screen',
  'Applying selected heuristics',
  'Checking accessibility & contrast',
  'Drafting roadmap',
]

function ImagePreview({ previewImageUrl, expectingImage }) {
  if (!expectingImage && !previewImageUrl) return null

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] max-h-[70vh] overflow-y-auto">
      {previewImageUrl ? (
        <img
          src={previewImageUrl}
          alt="Captured page preview"
          className="w-full h-auto block"
        />
      ) : (
        <div className="relative w-full aspect-[3/4] bg-[var(--bg-sunken)] overflow-hidden">
          <div className="absolute inset-0 skeleton-shimmer" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--ink-4)]">
            <span className="w-4 h-4 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent)] animate-spin-slow" />
            <span className="text-[11px] font-mono uppercase tracking-[0.08em]">
              Capturing screen…
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LoadingState({ currentStep, previewImageUrl, expectingImage = false }) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(null)

  useEffect(() => {
    startRef.current = performance.now()
    let raf
    const tick = () => {
      setElapsed(((performance.now() - startRef.current) / 1000).toFixed(1))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const showImageColumn = expectingImage || !!previewImageUrl

  return (
    <div className="pt-10 px-2">
      <div className="flex items-center gap-2.5 text-xs font-mono text-[var(--ink-3)] mb-6">
        <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent)] animate-spin-slow" />
        <span>Running audit · <span>{elapsed}s</span></span>
      </div>

      <h2 className="font-serif text-[34px] leading-[1.15] font-normal tracking-[-0.01em] m-0 mb-9">
        Looking at the screen<br />
        through a <em className="italic text-[var(--accent)]">senior reviewer's</em> eyes.
      </h2>

      <div
        className={[
          'grid gap-8 items-start',
          showImageColumn ? 'md:grid-cols-[1fr_minmax(0,360px)]' : 'grid-cols-1',
        ].join(' ')}
      >
        <div className="flex flex-col gap-0.5 border-t border-[var(--border)]">
          {STEPS.map((s, i) => {
            const isDone   = i < currentStep
            const isActive = i === currentStep
            return (
              <div
                key={s}
                className={[
                  'flex items-center gap-3.5 py-3.5 px-1 border-b border-[var(--border)] text-[13px] transition-colors duration-200',
                  isDone   ? 'text-[var(--ink-3)]' :
                  isActive ? 'text-[var(--ink)]'   : 'text-[var(--ink-4)]',
                ].join(' ')}
              >
                <span className={[
                  'w-[18px] h-[18px] rounded-full border-[1.5px] grid place-items-center shrink-0 relative',
                  isDone   ? 'bg-[var(--ink-3)] border-[var(--ink-3)] step-marker-done'   :
                  isActive ? 'border-[var(--accent)] step-marker-active'                   : 'border-[var(--border-strong)]',
                ].join(' ')} />
                <span>{s}</span>
                <span className="font-mono text-[11px] text-[var(--ink-4)] ml-auto">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            )
          })}
        </div>

        {showImageColumn && (
          <div className="md:sticky md:top-2">
            <ImagePreview previewImageUrl={previewImageUrl} expectingImage={expectingImage} />
          </div>
        )}
      </div>
    </div>
  )
}
