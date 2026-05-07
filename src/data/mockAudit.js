export const CRIT_META = {
  nielsen:   { label: 'Nielsen heuristics' },
  a11y:      { label: 'Accessibility (WCAG)' },
  hierarchy: { label: 'Visual hierarchy' },
  copy:      { label: 'Copy clarity' },
  mobile:    { label: 'Mobile readiness' },
}

const ISSUE_POOL = {
  nielsen: [
    { sev: 'HIGH', principle: 'Visibility of system status',
      body: "The primary submit action gives no feedback during or after press — no spinner, no disabled state, no success confirmation. Users who don't see an immediate page change will re‑click, risking duplicate submissions.",
      refs: ['Primary CTA', 'Form submit'] },
    { sev: 'MEDIUM', principle: 'Recognition rather than recall',
      body: "Form fields rely on placeholder-only labels. Once a user starts typing, there's no way to recall what each field is for — particularly problematic for the two similar-looking code inputs near the top.",
      refs: ['Input fields', 'Placeholders'] },
    { sev: 'LOW', principle: 'Aesthetic & minimalist design',
      body: "The right rail shows three promotional callouts layered above the primary task. Consider demoting or deferring them so the task flow reads cleanly top‑to‑bottom.",
      refs: ['Right rail', 'Promo cards'] },
    { sev: 'MEDIUM', principle: 'Error prevention',
      body: "The destructive 'Delete account' action sits one tab-stop away from 'Save changes' with identical styling. A confirmation step or visual separation would prevent accidental activation.",
      refs: ['Danger zone'] },
  ],
  a11y: [
    { sev: 'HIGH', principle: 'Color contrast (WCAG 1.4.3)',
      body: "Secondary helper text appears in a low-contrast warm grey on the cream background — reads roughly 3.1:1, below the 4.5:1 required for body text. Bump to a darker neutral or bold the weight.",
      refs: ['Helper text', 'Body copy'] },
    { sev: 'MEDIUM', principle: 'Focus visibility (WCAG 2.4.7)',
      body: "Custom pill buttons appear to suppress the default focus ring without providing an alternative. Keyboard users will lose their place while tabbing through criteria.",
      refs: ['Pill buttons', 'Focus states'] },
    { sev: 'LOW', principle: 'Form labels (WCAG 3.3.2)',
      body: "The search field uses a magnifier icon without a visible or programmatically associated label. Add an aria-label or a visually-hidden <label for>.",
      refs: ['Search'] },
  ],
  hierarchy: [
    { sev: 'MEDIUM', principle: 'Scan path',
      body: "The page title and the first metric card share the same type weight and size, so the eye doesn't know where to land first. Push the title up one step in the scale, or give the card less visual weight.",
      refs: ['Page title', 'Metric cards'] },
    { sev: 'LOW', principle: 'Grouping & proximity',
      body: "Filter controls sit visually closer to the results list than to the 'Filters' header they belong to. Tighten the gap under the header and add breathing room above the list.",
      refs: ['Filter bar'] },
  ],
  copy: [
    { sev: 'MEDIUM', principle: 'Action-oriented labels',
      body: "The primary CTA reads 'Submit' — generic and passive. 'Send audit request' (or whatever the action produces) will feel more purposeful and preview the outcome.",
      refs: ['CTA copy'] },
    { sev: 'LOW', principle: 'Microcopy tone',
      body: "Empty-state text ('No items found. Try again.') is blunt. A one-line hint about what typically goes here, or a link to create the first item, turns a dead end into a next step.",
      refs: ['Empty state'] },
  ],
  mobile: [
    { sev: 'HIGH', principle: 'Touch target size',
      body: "The icon-only action buttons in the header measure about 28×28px. Bump to at least 44×44px (Apple HIG) or 48×48dp (Material) to meet thumb-reachable targets.",
      refs: ['Header actions'] },
    { sev: 'MEDIUM', principle: 'Thumb zone',
      body: "The primary CTA currently pins to the top-right on mobile, which sits outside the natural thumb arc. Consider a sticky bottom bar on viewports < 640px.",
      refs: ['Primary CTA'] },
  ],
}

const STRENGTH_POOL = {
  nielsen: [
    "Clear back-navigation in the top-left keeps **user control and freedom** intact across the flow.",
    "Primary action sits consistently bottom-right across screens, matching **standards** users carry from similar tools.",
  ],
  a11y: [
    "Body copy uses generous 16px type on a warm near-white — comfortable contrast and line-length for reading.",
    "Form fields are visibly grouped with labels above inputs, supporting screen-reader traversal.",
  ],
  hierarchy: [
    "The serif title anchors the page beautifully; the eye lands there first and then drops into the content column.",
    "Whitespace around the primary CTA gives it real gravity without shouting.",
  ],
  copy: [
    "Micro-labels like **'Evaluation criteria'** are concrete and specific — no vague 'Options' or 'Settings' filler.",
    "Helper text under inputs explains *why* a field is asked for, not just *what* to type.",
  ],
  mobile: [
    "Type scale holds up at 375px without truncation on the main labels.",
    "Primary actions remain single-column and full-width at small breakpoints.",
  ],
}

const ROADMAP_EFFORT = ['S', 'M', 'L']
const SEV_RANK = { HIGH: 3, MEDIUM: 2, LOW: 1 }

export function buildMockAudit({ context, criteria }) {
  const selected = [...criteria]
  const strengths = []
  const issues = []

  selected.forEach(k => {
    const pool = ISSUE_POOL[k] || []
    const n = pool.length >= 3 ? 2 + Math.floor(Math.random() * 2) : Math.min(pool.length, 2)
    pool.slice(0, n).forEach(iss => issues.push({ ...iss, crit: k }))
    const s = STRENGTH_POOL[k] || []
    s.slice(0, 1).forEach(t => strengths.push(t))
  })

  issues.sort((a, b) => SEV_RANK[b.sev] - SEV_RANK[a.sev])

  const counts = {
    high: issues.filter(i => i.sev === 'HIGH').length,
    med:  issues.filter(i => i.sev === 'MEDIUM').length,
    low:  issues.filter(i => i.sev === 'LOW').length,
  }

  const roadmap = issues.slice(0, Math.min(issues.length, 5)).map((iss, idx) => ({
    title: iss.principle,
    body: iss.sev === 'HIGH'
      ? `Ship a fix this sprint — ${iss.body.split('.')[0].toLowerCase()}.`
      : iss.sev === 'MEDIUM'
      ? `Queue for the next cycle — ${iss.body.split('.')[0].toLowerCase()}.`
      : `Polish pass whenever touched — ${iss.body.split('.')[0].toLowerCase()}.`,
    effort: ROADMAP_EFFORT[Math.min(2, idx)],
  }))

  const ctx = (context || '').trim()
  const screen = ctx.length > 120 ? ctx.slice(0, 117) + '…' : ctx

  return { screen, selected, strengths, issues, counts, roadmap }
}
