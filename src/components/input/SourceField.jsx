import Dropzone from './Dropzone'
import ImagePreview from './ImagePreview'
import UrlInput from './UrlInput'

const TABS = [
  {
    mode: 'screenshot',
    label: 'Screenshot',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-4.5-4.5L5 22"/>
      </svg>
    ),
  },
  {
    mode: 'url',
    label: 'URL',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7"/>
        <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/>
      </svg>
    ),
  },
]

export default function SourceField({ mode, file, fileDataUrl, url, onModeChange, onFileLoad, onFileRemove, onUrlChange }) {
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--ink-3)]">
          <span className="font-mono text-[var(--ink-4)] font-normal">01</span>
          Source
          <span className="text-[var(--accent)] font-normal ml-1">*</span>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex bg-[var(--surface-2)] border border-[var(--border)] rounded-[10px] p-[3px] gap-0.5" role="tablist">
          {TABS.map(t => (
            <button
              key={t.mode}
              role="tab"
              aria-selected={mode === t.mode}
              onClick={() => onModeChange(t.mode)}
              className={[
                'px-3.5 py-[7px] rounded-[7px] text-[13px] font-medium flex items-center gap-1.5 transition-all duration-150',
                '[&_svg]:w-[13px] [&_svg]:h-[13px]',
                mode === t.mode
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_var(--border)] [&_svg]:opacity-100'
                  : 'text-[var(--ink-3)] hover:text-[var(--ink-2)] [&_svg]:opacity-70',
              ].join(' ')}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Screenshot panel */}
      {mode === 'screenshot' && (
        <>
          {!file ? (
            <Dropzone onFileLoad={onFileLoad} />
          ) : (
            <ImagePreview fileDataUrl={fileDataUrl} file={file} onRemove={onFileRemove} />
          )}
        </>
      )}

      {/* URL panel */}
      {mode === 'url' && (
        <>
          <UrlInput url={url} onChange={onUrlChange} />
          <div className="text-[11px] text-[var(--ink-4)] font-mono mt-2">
            Captures a live screenshot and HTML semantics, then audits like a screenshot upload.
          </div>
        </>
      )}
    </div>
  )
}
