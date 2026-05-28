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

export function buildSystemPrompt({ criteriaBlocks = [] }) {
  return [
    'You are a senior UX auditor for digital products.',
    'Analyze only what can be observed in the provided screenshot and user context.',
    'Do not invent hidden flows, hidden content, or backend behavior.',
    'Prioritize practical, testable UX feedback with clear reasoning.',
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
    '      "principle": "string",',
    '      "body": "string",',
    '      "refs": ["string"],',
    '      "crit": "criterion_key"',
    '    }',
    '  ],',
    '  "counts": { "high": 0, "med": 0, "low": 0 },',
    '  "roadmap": [',
    '    { "title": "string", "body": "string", "effort": "S|M|L" }',
    '  ]',
    '}',
    '',
    'Output constraints:',
    '- selected must match criteria provided by the user.',
    '- issues.crit must reference one of selected.',
    '- counts must match the severities in issues.',
    '- Provide 3 to 8 issues and 1 to 4 strengths when enough evidence exists.',
    '',
    'UX rules to apply:',
    renderCriteriaSection(criteriaBlocks),
  ].join('\n')
}
