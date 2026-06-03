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
import { CRIT_META } from './data/criteriaMeta'
import { chatCompletion } from './services/aiClient'
import { buildSystemPrompt } from './prompts/systemUxAudit'
import { guidelinesForCriteria } from './guidelines'
import { computeScores } from './lib/scoring'

const LOADING_STEPS = [
  { label: 'Reading the screen',              ms: 900  },
  { label: 'Applying selected heuristics',    ms: 1100 },
  { label: 'Checking accessibility & contrast', ms: 1000 },
  { label: 'Drafting roadmap',                ms: 900  },
]

export const STEPS = LOADING_STEPS

/** Quita ```json ... ``` si el modelo los incluye pese a las instrucciones. */
function stripJsonFence(raw) {
  let t = String(raw || '').trim()
  const fenced = /^```(?:json)?\s*\n?([\s\S]*?)```$/im.exec(t)
  if (fenced) return fenced[1].trim()
  return t
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
  const [phase, setPhase]             = useState('idle') // idle | loading | done | error
  const [auditResult, setAuditResult] = useState(null)
  const [loadingStep, setLoadingStep] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [providerUsed, setProviderUsed] = useState('')

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
  const hasSource = mode === 'screenshot' ? !!file : false
  const ready     = hasSource && context.trim().length >= 3 && criteria.size > 0

  const readinessText = () => {
    if (mode === 'url')                return 'URL analysis is not available yet'
    if (!hasSource)                    return 'Add a screenshot'
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

  const normalizeAudit = useCallback((raw, selectedKeys, fallbackScreen) => {
    const issues = Array.isArray(raw?.issues) ? raw.issues : []
    const strengths = Array.isArray(raw?.strengths) ? raw.strengths : []
    const selected = Array.isArray(raw?.selected) ? raw.selected.filter((k) => selectedKeys.includes(k)) : selectedKeys
    const countsFromIssues = {
      high: issues.filter((item) => item?.sev === 'HIGH').length,
      med: issues.filter((item) => item?.sev === 'MEDIUM').length,
      low: issues.filter((item) => item?.sev === 'LOW').length,
    }

    const scores = computeScores({ issues, strengths, selected })

    const rawNote = typeof raw?.scoreNote === 'string' ? raw.scoreNote.trim() : ''
    const scoreNote = rawNote || 'Based on the issues found above.'

    return {
      screen: raw?.screen || fallbackScreen,
      selected,
      strengths,
      issues,
      counts: raw?.counts || countsFromIssues,
      roadmap: Array.isArray(raw?.roadmap) ? raw.roadmap : [],
      scores,
      scoreNote,
    }
  }, [])

  const runAnalysis = useCallback(async () => {
    if (mode !== 'screenshot' || !fileDataUrl) return

    setPhase('loading')
    setLoadingStep(0)
    setAuditResult(null)
    setErrorMessage('')
    setProviderUsed('')

    let currentStep = 0
    const loadingInterval = window.setInterval(() => {
      currentStep = (currentStep + 1) % LOADING_STEPS.length
      setLoadingStep(currentStep)
    }, 1000)

    const selectedKeys = [...criteria]
    const criteriaBlocks = guidelinesForCriteria(selectedKeys).map((entry) => ({
      ...entry,
      label: CRIT_META[entry.key]?.label || entry.key,
    }))
    const criteriaText = selectedKeys
      .map((key) => `- ${key}: ${CRIT_META[key]?.label || key}`)
      .join('\n')

    const userText = [
      'User context:',
      context.trim(),
      '',
      'Evaluation criteria selected by user:',
      criteriaText,
      '',
      'Task:',
      'Analyze the screenshot using only visible evidence and these selected criteria. Return valid JSON only.',
    ].join('\n')

    try {
      const response = await chatCompletion({
        messages: [
          { role: 'system', content: buildSystemPrompt({ criteriaBlocks }) },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              { type: 'image_url', image_url: { url: fileDataUrl } },
            ],
          },
        ],
        responseFormat: { type: 'json_object' },
        maxTokens: 8192,
      })
      setProviderUsed(response?.provider || '')

      const content = response?.choices?.[0]?.message?.content
      const text = Array.isArray(content)
        ? content.map((part) => (typeof part?.text === 'string' ? part.text : '')).join('\n')
        : String(content || '')

      if (!text) {
        throw new Error('The model returned an empty response.')
      }

      const parsed = JSON.parse(stripJsonFence(text))
      const normalized = normalizeAudit(parsed, selectedKeys, context.trim())
      setAuditResult(normalized)
      setPhase('done')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error during analysis.'
      setErrorMessage(message)
      setPhase('error')
    } finally {
      window.clearInterval(loadingInterval)
    }
  }, [context, criteria, fileDataUrl, mode, normalizeAudit])

  const handleReset = useCallback(() => {
    setFile(null); setFileDataUrl(null); setUrl('')
    setContext(''); setPhase('idle'); setAuditResult(null); setLoadingStep(0); setErrorMessage(''); setProviderUsed('')
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
          errorMessage={errorMessage}
          providerUsed={providerUsed}
          format={tweaks.format}
          onRetry={runAnalysis}
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
