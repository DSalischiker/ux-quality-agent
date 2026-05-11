export const CRITERIA_GUIDELINES = {
  nielsen: [
    'Visibility of system status: every important action should provide immediate feedback.',
    'Match between system and real world: use familiar language and concepts for the target audience.',
    'User control and freedom: provide clear undo/escape routes for risky actions.',
    'Consistency and standards: keep behavior and labels predictable across screens.',
    'Error prevention and recovery: prevent mistakes and provide actionable recovery guidance.',
  ],
  a11y: [
    'WCAG contrast: body text should usually meet at least 4.5:1 contrast ratio.',
    'Keyboard support: interactive elements must be reachable and usable via keyboard.',
    'Focus visibility: ensure a clearly visible focus state for keyboard users.',
    'Semantics and labels: controls and inputs need explicit, meaningful labels.',
    'Touch targets: interactive areas should be large enough for mobile ergonomics.',
  ],
  hierarchy: [
    'Prioritize visual scanning: primary action and heading should be immediately discoverable.',
    'Use typographic contrast to separate information levels.',
    'Group related items using spacing and alignment, avoid accidental associations.',
    'Reduce competing visual weight in secondary content.',
  ],
  copy: [
    'Prefer explicit, action-oriented labels over generic verbs.',
    'Microcopy should explain intent and next step, not only state errors.',
    'Maintain consistent terminology for the same concept.',
    'Use concise wording and avoid ambiguity in calls-to-action.',
  ],
  mobile: [
    'Design for thumb reach and comfortable one-hand usage.',
    'Keep key actions visible without forcing difficult top-corner interactions.',
    'Use adequate spacing to avoid accidental taps.',
    'Ensure content remains readable and actionable on small viewports.',
  ],
  gestalt: [
    'Proximity: elements placed close together are perceived as related.',
    'Similarity: consistent style should reflect consistent meaning.',
    'Continuity: layouts should guide the eye naturally through the task flow.',
    'Figure-ground: primary content should stand out clearly from background noise.',
    'Common region: enclosed elements are interpreted as belonging together.',
  ],
}

export function guidelinesForCriteria(criteriaKeys = []) {
  const seen = new Set()
  return criteriaKeys.flatMap((key) => {
    if (seen.has(key)) return []
    seen.add(key)
    const lines = CRITERIA_GUIDELINES[key] || []
    return lines.length ? [{ key, lines }] : []
  })
}
