import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Topbar from './components/Topbar'
import TweaksPanel from './components/TweaksPanel'
import InputPane from './components/input/InputPane'
import SourceField from './components/input/SourceField'
import ContextField from './components/input/ContextField'
import CriteriaField from './components/input/CriteriaField'
import AnalyzeRow from './components/input/AnalyzeRow'
import OutputPane from './components/output/OutputPane'
import { buildMockAudit } from './data/mockAudit'

const LOADING_STEPS = [
  { label: 'Reading the screen',              ms: 900  },
  { label: 'Applying selected heuristics',    ms: 1100 },
  { label: 'Checking accessibility & contrast', ms: 1000 },
  { label: 'Drafting roadmap',                ms: 900  },
]

export const STEPS = LOADING_STEPS

function isValidUrl(u) {
  if (!u) return false
  return /^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(u) || /^https?:\/\/.+\..+/i.test(u)
}

export default function App() {
  // ── Input state ──────────────────────────────────────────
  const [mode, setMode]               = useState('screenshot')
  const [file, setFile]               = useState(null)
  const [fileDataUrl, setFileDataUrl] = useState(null)
  const [url, setUrl]                 = useState('')
  const [context, setContext]         = useState('')
  const [criteria, setCriteria]       = useState(new Set(['nielsen', 'a11y']))

  // ── Output state ─────────────────────────────────────────
  const [phase, setPhase]             = useState('idle') // idle | loading | done
  const [auditResult, setAuditResult] = useState(null)
  const [loadingStep, setLoadingStep] = useState(0)

  // ── Tweaks ───────────────────────────────────────────────
  const [tweaks, setTweaks]                   = useState({ theme: 'light', accent: 'terracotta', density: 'comfortable', format: 'bulleted' })
  const [tweaksPanelOpen, setTweaksPanelOpen] = useState(false)
  const [tweaksBtnVisible, setTweaksBtnVisible] = useState(false)

  // Sync tweaks → body data-* attributes (CSS selectors target these)
  useEffect(() => {
    document.body.dataset.theme   = tweaks.theme
    document.body.dataset.accent  = tweaks.accent
    document.body.dataset.density = tweaks.density
    document.body.dataset.format  = tweaks.format
  }, [tweaks])

  // Edit-mode postMessage protocol (tweaks panel visibility)
  useEffect(() => {
    const handler = (e) => {
      const d = e.data || {}
      if (d.type === '__activate_edit_mode')   { setTweaksBtnVisible(true); setTweaksPanelOpen(true) }
      if (d.type === '__deactivate_edit_mode') { setTweaksPanelOpen(false) }
    }
    window.addEventListener('message', handler)
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*') } catch (_) {}
    return () => window.removeEventListener('message', handler)
  }, [])

  // ── Derived readiness ────────────────────────────────────
  const hasSource = mode === 'screenshot' ? !!file : isValidUrl(url)
  const ready     = hasSource && context.trim().length >= 3 && criteria.size > 0

  const readinessText = () => {
    if (!hasSource)                    return mode === 'screenshot' ? 'Add a screenshot' : 'Paste a valid URL'
    if (context.trim().length < 3)     return 'Describe the screen'
    if (criteria.size === 0)           return 'Pick at least one criterion'
    return 'Ready'
  }

  // ── Handlers ─────────────────────────────────────────────
  const handleFileLoad = useCallback((f) => {
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return
    const reader = new FileReader()
    reader.onload = () => { setFile(f); setFileDataUrl(reader.result) }
    reader.readAsDataURL(f)
  }, [])

  const handleFileRemove = useCallback(() => {
    setFile(null)
    setFileDataUrl(null)
  }, [])

  const toggleCriterion = useCallback((key) => {
    setCriteria(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }, [])

  const setTweak = useCallback((key, value) => {
    setTweaks(prev => ({ ...prev, [key]: value }))
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: value } }, '*') } catch (_) {}
  }, [])

  const runAnalysis = useCallback(() => {
    setPhase('loading')
    setLoadingStep(0)
    setAuditResult(null)

    // TODO: LLM API call goes here
    // Input:  fileDataUrl (base64 string) or url (string), context (string), criteria (Set)
    // Output: audit result object — { screen, selected, strengths, issues, counts, roadmap }
    let i = 0
    const tick = () => {
      if (i >= LOADING_STEPS.length) {
        setAuditResult(buildMockAudit({ context, criteria }))
        setPhase('done')
        return
      }
      setLoadingStep(i)
      setTimeout(() => { i++; tick() }, LOADING_STEPS[i].ms)
    }
    tick()
  }, [context, criteria])

  const handleReset = useCallback(() => {
    setFile(null); setFileDataUrl(null); setUrl('')
    setContext(''); setPhase('idle'); setAuditResult(null); setLoadingStep(0)
  }, [])

  // Cmd/Ctrl+Enter shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && ready) runAnalysis()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [ready, runAnalysis])

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar tweaksBtnVisible={tweaksBtnVisible} onTweaksOpen={() => setTweaksPanelOpen(true)} />

      <main
        className="flex-1 grid min-h-0"
        style={{ gridTemplateColumns: 'minmax(420px,1fr) minmax(520px,1.25fr)' }}
      >
        <InputPane>
          <SourceField
            mode={mode}
            file={file}
            fileDataUrl={fileDataUrl}
            url={url}
            onModeChange={setMode}
            onFileLoad={handleFileLoad}
            onFileRemove={handleFileRemove}
            onUrlChange={setUrl}
          />
          <ContextField context={context} onContextChange={setContext} />
          <CriteriaField criteria={criteria} onToggle={toggleCriterion} />
          <AnalyzeRow
            ready={ready}
            readinessText={readinessText()}
            onAnalyze={runAnalysis}
            onReset={handleReset}
          />
        </InputPane>
        <OutputPane
          phase={phase}
          auditResult={auditResult}
          loadingStep={loadingStep}
          format={tweaks.format}
        />
      </main>

      <TweaksPanel
        isOpen={tweaksPanelOpen}
        tweaks={tweaks}
        onClose={() => setTweaksPanelOpen(false)}
        onTweakChange={setTweak}
      />
    </div>
  )
}
