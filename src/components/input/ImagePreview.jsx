export default function ImagePreview({ fileDataUrl, file, onRemove }) {
  return (
    <div className="relative rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
      <img
        src={fileDataUrl}
        alt=""
        className="w-full block max-h-[280px] object-cover object-top"
      />
      <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-[var(--border)] bg-[var(--surface-2)] text-xs">
        <div className="flex items-center gap-2 font-medium min-w-0 [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-4.5-4.5L5 22"/>
          </svg>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[var(--ink-4)] font-mono text-[11px]">
            {(file.size / 1024).toFixed(0)} KB
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="text-[var(--ink-3)] text-xs px-2 py-1 rounded-[6px] hover:bg-[var(--bg)] hover:text-[var(--ink)] transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
