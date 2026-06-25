import { buildSystemPrompt } from '../prompts/systemUxAudit'
import { CRIT_META } from '../data/criteriaMeta'
import { guidelinesForCriteria } from '../guidelines'

export function buildCriteriaBlocks(criteriaSet) {
  const selectedKeys = [...criteriaSet]
  const criteriaBlocks = guidelinesForCriteria(selectedKeys).map((entry) => ({
    ...entry,
    label: CRIT_META[entry.key]?.label || entry.key,
  }))
  return { selectedKeys, criteriaBlocks }
}

export function buildAuditMessages({
  context,
  criteriaSet,
  imageDataUrl,
  sourceMode = 'screenshot',
  extraUserSections = [],
}) {
  const mode = sourceMode === 'url' ? 'url' : 'screenshot'
  const { selectedKeys, criteriaBlocks } = buildCriteriaBlocks(criteriaSet)
  const criteriaText = selectedKeys
    .map((key) => `- ${key}: ${CRIT_META[key]?.label || key}`)
    .join('\n')

  const taskLine =
    mode === 'url'
      ? 'Audit this URL capture: combine the screenshot (visual UX) with the structural HTML section below. Use only that evidence and these selected criteria. Return valid JSON only.'
      : 'Analyze the screenshot using only visible evidence and these selected criteria. Return valid JSON only.'

  const userTextParts = [
    'User context:',
    context.trim(),
    '',
    'Evaluation criteria selected by user:',
    criteriaText,
    '',
    'Task:',
    taskLine,
  ]

  for (const section of extraUserSections) {
    if (section?.trim()) {
      userTextParts.push('', section.trim())
    }
  }

  const userText = userTextParts.join('\n')

  return {
    selectedKeys,
    messages: [
      { role: 'system', content: buildSystemPrompt({ criteriaBlocks, sourceMode: mode }) },
      {
        role: 'user',
        content: [
          { type: 'text', text: userText },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      },
    ],
  }
}
