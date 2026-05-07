const ACCENTS = [
  { value: 'terracotta', color: '#b85c3c' },
  { value: 'sage',       color: '#5d7a5a' },
  { value: 'indigo',     color: '#4a5582' },
  { value: 'plum',       color: '#7a4e67' },
  { value: 'ink',        color: '#2a2620' },
]

export default function TweaksPanel({ isOpen, tweaks, onClose, onTweakChange }) {
  if (!isOpen) return null

  return (
    <div className="fixed right-5 bottom-5 w-70 bg-[var(--surface)] border border-[var(--border)] rounded-[14px] shadow-[0_10px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] z-50 overflow-hidden text-xs">
      {/* Header */}
      <div className="px-3.5 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]">
        <div className="font-serif text-base italic">Tweaks</div>
        <button
          onClick={onClose}
          className="w-5 h-5 grid place-items-center text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6l-12 12"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="p-3.5 flex flex-col gap-4">
        <TweakSegments label="Theme"   tweakKey="theme"   value={tweaks.theme}   options={[{value:'light',label:'Light'},{value:'dark',label:'Dark'}]} onChange={onTweakChange} />
        <TweakSegments label="Density" tweakKey="density" value={tweaks.density} options={[{value:'comfortable',label:'Comfortable'},{value:'compact',label:'Compact'}]} onChange={onTweakChange} />
        <TweakSegments label="Result format" tweakKey="format" value={tweaks.format} options={[{value:'bulleted',label:'Structured'},{value:'narrative',label:'Narrative'}]} onChange={onTweakChange} />

        {/* Accent swatches */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--ink-4)] mb-2">Accent</div>
          <div className="flex gap-2">
            {ACCENTS.map(a => (
              <button
                key={a.value}
                aria-pressed={tweaks.accent === a.value}
                onClick={() => onTweakChange('accent', a.value)}
                className="w-6.5 h-6.5 rounded-full border-2 cursor-pointer transition-transform duration-100 hover:scale-[1.08] aria-pressed:border-[var(--ink)] aria-pressed:scale-[1.1] border-[var(--border)]"
                style={{ background: a.color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TweakSegments({ label, tweakKey, value, options, onChange }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--ink-4)] mb-2">{label}</div>
      <div className="grid gap-0.5 p-0.5 bg-[var(--bg-sunken)] border border-[var(--border)] rounded-lg" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
        {options.map(o => (
          <button
            key={o.value}
            aria-pressed={value === o.value}
            onClick={() => onChange(tweakKey, o.value)}
            className="py-1.5 px-2 rounded-[6px] text-xs text-[var(--ink-3)] aria-pressed:bg-[var(--surface)] aria-pressed:text-[var(--ink)] aria-pressed:shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
