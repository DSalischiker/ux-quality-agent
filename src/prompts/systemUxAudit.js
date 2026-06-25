function renderCriteriaSection(criteriaBlocks) {
  if (!criteriaBlocks.length) return 'No specific criteria selected by the user.'

  return criteriaBlocks
    .map(({ key, label, lines }) => {
      const header = `Criterion: ${label} (${key})`
      const bullets = lines.map((line) => `- ${line}`).join('\n')
      return `${header}\n${bullets}`
    })
    .join('\n\n')
}

function renderEvidenceInstructions(sourceMode) {
  if (sourceMode === 'url') {
    return [
      'Evidence you may use:',
      '- A live full-page screenshot (1280px viewport width, scrolled to capture the entire page) attached to the user message. The capture waits for network idle, DOM ready, and a short hydration delay before shooting.',
      '- A structural HTML excerpt appended to the user message (title, meta, headings, landmarks, CTAs, images/alt, form labels, ARIA, skip link, etc.). When available, the HTML is browser-rendered (post-hydration); otherwise it may be a static server response.',
      '',
      'How to weigh evidence:',
      '- Use the screenshot for visual UX: layout, spacing, hierarchy, contrast, typography, visible states, and copy as rendered.',
      '- Use the HTML excerpt for document semantics and accessibility markup: heading order, landmarks, labels, alt text, language, viewport meta, skip links.',
      '- If the HTML section flags a probable unhydrated SPA (no headings, CTAs, or landmarks), treat the HTML as unreliable and lean on the screenshot; mention the limitation if it affects your findings.',
      '- When screenshot and HTML disagree, call out the discrepancy; do not silently pick one.',
      '- Treat the HTML as a partial parse of the page at capture time—not a guarantee of runtime behavior, auth-gated content, or other URLs.',
      '- Do not invent hidden flows, modals, or backend behavior not supported by the screenshot or HTML excerpt.',
    ].join('\n')
  }

  return [
    'Evidence you may use:',
    '- The screenshot attached to the user message and the user context text.',
    '',
    'Constraints:',
    '- Analyze only what is visible in the screenshot.',
    '- Do not invent hidden flows, hidden content, or backend behavior.',
  ].join('\n')
}

/**
 * @param {{ criteriaBlocks?: Array, sourceMode?: 'screenshot' | 'url' }} options
 */
export function buildSystemPrompt({ criteriaBlocks = [], sourceMode = 'screenshot' }) {
  const mode = sourceMode === 'url' ? 'url' : 'screenshot'
  const intro =
    mode === 'url'
      ? 'You are a senior UX auditor for digital products. The user supplied a public URL; you receive a captured screenshot plus a structural HTML summary of that page.'
      : 'You are a senior UX auditor for digital products. The user supplied a screenshot of an interface.'

  return [
    intro,
    'Prioritize practical, testable UX feedback with clear reasoning.',
    '',
    renderEvidenceInstructions(mode),
    '',
    'Response requirements:',
    '- Return valid JSON only.',
    '- Do not use markdown code fences.',
    '- Use this exact schema:',
    '{',
    '  "screen": "string",',
    '  "selected": ["criterion_key"],',
    '  "strengths": ["string"],',
    '  "issues": [',
    '    {',
    '      "sev": "HIGH|MEDIUM|LOW",',
    '      "impact": 1,',
    '      "principle": "string",',
    '      "body": "string",',
    '      "refs": ["string"],',
    '      "crit": "criterion_key"',
    '    }',
    '  ],',
    '  "counts": { "high": 0, "med": 0, "low": 0 },',
    '  "scoreNote": "string",',
    '  "roadmap": [',
    '    { "title": "string", "body": "string", "effort": "S|M|L" }',
    '  ]',
    '}',
    '',
    'Output constraints:',
    '- selected must match criteria provided by the user.',
    '- issues.crit must reference one of selected.',
    '- counts must match the severities in issues.',
    '- refs should cite observable evidence (e.g. visible UI element, heading level, missing alt in HTML excerpt).',
    '- Provide 3 to 8 issues and 1 to 4 strengths when enough evidence exists.',
    '- issues.impact is an integer 1-5 representing how much this issue hurts UX in the specific context of this screen.',
    '  Use 5 for issues that block a primary task (e.g. unlabeled checkout button); 3 for issues that cause meaningful friction; 1 for cosmetic-only issues. Calibrate to the screen context, not just severity.',
    '- scoreNote is one short sentence (under 25 words) summarising why the screen scores the way it does. Reference the dominant theme of the issues, not the number itself.',
    '',
    'UX rules to apply:',
    renderCriteriaSection(criteriaBlocks),
  ].join('\n')
}
