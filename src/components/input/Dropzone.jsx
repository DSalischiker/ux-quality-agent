import { useRef, useState } from 'react'

export default function Dropzone({ onFileLoad }) {
  const fileInputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true) }
  const handleDragLeave = () => setIsDragOver(false)
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFileLoad(f)
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() }
  }
  const handleChange = (e) => {
    const f = e.target.files?.[0]
    if (f) onFileLoad(f)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'relative border-[1.5px] border-dashed rounded-[var(--radius-lg)] bg-[var(--surface)] px-6 py-10 text-center transition-all duration-200 cursor-pointer',
        isDragOver
          ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
          : 'border-[var(--border-strong)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]',
      ].join(' ')}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleChange}
      />
      <div className="w-12 h-12 mx-auto mb-3.5 rounded-xl bg-[var(--surface-2)] grid place-items-center text-[var(--ink-3)] border border-[var(--border)] [&_svg]:w-[22px] [&_svg]:h-[22px]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12"/><path d="m7 8 5-5 5 5"/>
          <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>
        </svg>
      </div>
      <div className="text-sm font-medium mb-1">
        Drop screenshot, or{' '}
        <em className="font-serif italic text-[var(--accent)] font-normal">browse files</em>
      </div>
      <div className="text-[11px] text-[var(--ink-4)] font-mono">PNG · JPG · WEBP · up to 10 MB</div>
    </div>
  )
}
