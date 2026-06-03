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
    '- Provide 3 to 8 issues and 1 to 4 strengths when enough evidence exists.',
    '- issues.impact is an integer 1-5 representing how much this issue hurts UX in the specific context of this screen.',
    '  Use 5 for issues that block a primary task (e.g. unlabeled checkout button); 3 for issues that cause meaningful friction; 1 for cosmetic-only issues. Calibrate to the screen context, not just severity.',
    '- scoreNote is one short sentence (under 25 words) summarising why the screen scores the way it does. Reference the dominant theme of the issues, not the number itself.',
    '',
    'UX rules to apply:',
    renderCriteriaSection(criteriaBlocks),
  ].join('\n')
}
