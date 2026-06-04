export const CRITERIA_GUIDELINES = {
  nielsen: [
    // Match between system and real world
    'Match between system and real world: all labels, headings, and CTAs must use vocabulary familiar to the target audience — avoid internal jargon, unexplained acronyms, or technical terms. Flag any visible text that a non-expert user would likely not understand.',
    'Match between system and real world: icons must be universally recognizable for their intended meaning. Report standalone icons that have no visible text label and whose meaning is ambiguous out of context.',
    'Match between system and real world: visible date formats, currency symbols, and units of measurement should match the expected locale of the target audience. Report formats that appear inconsistent or inappropriate for the audience.',
 
    // User control and freedom
    'User control and freedom: destructive or irreversible actions (e.g., delete, remove, cancel subscription) visible in the UI must be clearly distinguished visually from safe actions — through color, label, or placement — and must have a visible confirmation affordance (e.g., a confirm button, a warning label, or a visible secondary step). Flag destructive actions styled identically to safe ones with no visual warning.',
    'User control and freedom: multi-step flows or wizards visible in the layout must show a visible "Back", "Cancel", or equivalent exit option. Flag step-based UIs with no visible escape route.',
    'User control and freedom: modals or overlays visible in the screenshot must include an explicit close mechanism (e.g., an X button or a clearly labeled cancel action). Report modals with no visible dismissal control.',
 
    // Consistency and standards
    'Consistency and standards: interactive elements of the same type (e.g., primary buttons, secondary buttons, text links, form inputs) must share consistent visual styling — same shape, size range, color convention, and typography — across the entire screen. Flag elements of the same type that differ in style without a clear functional reason.',
    'Consistency and standards: terminology for the same concept must be identical throughout the visible interface. Report synonym drift where the same entity or action is referred to by different names on the same screen or across sections (e.g., "Workspace" vs "Project" vs "Space").',
    'Consistency and standards: layout patterns such as header structure, navigation placement, card anatomy, and section spacing must be visually consistent across all sections of the page. Report structural inconsistencies that would create unpredictable scanning.',
 
    // Error prevention (static affordances only)
    'Error prevention: form inputs must include visible affordances that prevent user mistakes — correct input type attributes (e.g., type="email", type="number"), visible placeholder text, helper text for constrained formats (e.g., "DD/MM/YYYY"), and character limits where relevant. Flag inputs that provide no guidance on expected format or constraints.',
    'Error prevention: required fields in forms must be visually marked (e.g., asterisk with a legend, or explicit "Required" label). Report forms where required vs. optional fields are indistinguishable.',
    'Error prevention: any error messages visible in the screenshot must be specific, written in plain language, and include the corrective action (e.g., "Password must be at least 8 characters" not "Invalid input"). Report generic or vague visible error strings.',
 
    // Aesthetic and minimalist design
    'Aesthetic and minimalist design: every visible UI element must serve a clear purpose. Flag decorative elements, redundant labels, repeated information, or visual noise that competes with primary content without adding meaning.',
    'Aesthetic and minimalist design: the visual complexity of secondary and tertiary content (metadata, footnotes, auxiliary links) must be clearly lower than primary content. Report screens where everything appears at the same visual weight, creating an undifferentiated wall of information.',
  ],
 
  a11y: [
    // Contrast
    'WCAG contrast (AA): body and UI text must achieve at least 4.5:1 contrast ratio against its background. Large text (18pt+ or 14pt bold+) requires at least 3:1. Report any text/background color combination that appears to fail these thresholds, identifying the element and estimating the ratio.',
    'WCAG contrast (AA): interactive component boundaries (button outlines, input borders, checkboxes, radio buttons) must meet at least 3:1 contrast against adjacent background colors. Flag thin or visually faint borders on interactive elements.',
 
    // Focus visibility (inspectable from HTML/CSS)
    'Focus visibility: check whether CSS contains outline: none or outline: 0 on focusable elements (:focus, :focus-visible selectors) without a replacement focus style being defined. Flag any suppression of the default focus ring that is not compensated by a custom visible indicator.',
 
    // Semantics and labels (fully detectable from HTML)
    'Semantics and labels: every form input must have an associated <label> element linked via matching for/id attributes, or an aria-label / aria-labelledby attribute. Report inputs that rely solely on placeholder text as their only label — placeholders disappear on input and are not reliably announced by screen readers.',
    'Semantics and labels: images that convey meaning must have a descriptive, content-specific alt attribute. Decorative images must use alt="" so screen readers skip them. Flag missing alt attributes, empty alt on meaningful images, or filename-style alt text (e.g., alt="image_001.jpg").',
    'Semantics and labels: buttons and links must have a discernible accessible name — either visible text content, an aria-label, or an aria-labelledby reference. Report icon-only buttons or links with no accessible name in the HTML.',
    'Semantics and labels: heading levels (h1–h6) must reflect a logical document hierarchy — one h1 per page, no skipped levels (e.g., jumping from h2 to h4). Report heading structures that are flat, inverted, or have skipped levels.',
    'Semantics and labels: landmark regions must be used correctly — <header>, <nav>, <main>, <footer>, <aside> or their ARIA role equivalents. Flag pages missing a <main> landmark, using multiple <main> elements, or relying entirely on generic <div> containers for major structural regions.',
    'Semantics and labels: form error messages must be programmatically associated with their input via aria-describedby or aria-errormessage. Report visible error messages that are only positioned near an input visually but have no programmatic association in the HTML.',
    'Semantics and labels: interactive elements must use semantically correct HTML elements (<button> for actions, <a> for navigation) or include the appropriate ARIA role. Report <div> or <span> elements with click handlers that lack role, tabindex, and keyboard event handling in the HTML.',
 
    // Touch targets
    'Touch targets: all interactive elements (buttons, links, checkboxes, icon buttons) must have a minimum tappable area of 44×44 CSS pixels (Apple HIG / WCAG 2.5.5). Evaluate from computed CSS dimensions and report controls that appear smaller than this threshold.',
    'Touch targets: interactive elements must be separated by at least 8px of non-interactive space to prevent accidental activation of adjacent controls. Report tightly packed action groups where spacing appears insufficient.',
 
    // Color independence
    'Color independence: information must never be conveyed by color alone. Error states, required field markers, success indicators, and status badges must also use a visible text label, icon, or pattern — not just a color change. Report elements where color is the sole differentiator of meaning.',
 
    // Language and document
    'Document language: the HTML <html> element must include a lang attribute matching the primary language of the content (e.g., lang="en"). Report missing or mismatched lang attributes.',
    'Page title: the <title> element must be present, non-empty, and descriptive of the page purpose — not a generic placeholder like "Home" or the domain name alone. Report missing, empty, or non-descriptive page titles.',
  ],
 
  hierarchy: [
    // Heading and primary entry point
    'Primary heading: the page must have a single, visually dominant H1 that clearly communicates the page purpose. It must be the largest or heaviest typographic element in the main content area. Flag pages with no visible H1, or with multiple headings competing at the same visual weight.',
    'Primary CTA discoverability: the most important action on the screen must be visually distinct from all secondary actions — through size, fill color, contrast, or placement — so it is identifiable at a glance. Report screens where the primary CTA is indistinguishable from secondary options without reading every label.',
 
    // Typographic contrast
    'Typographic levels: the layout must use at least two clearly distinct typographic levels (e.g., heading vs. body, label vs. value) to separate information layers. Flag screens where all visible text appears at the same size, weight, and color, creating a flat, unscanned layout.',
    'Subordinate metadata: supporting content such as timestamps, tags, categories, and captions must be visually subordinate to primary content through reduced size, lighter weight, or lower contrast. Report metadata styled with the same prominence as primary text.',
    'Line length: body text blocks should fall between 50–75 characters per line for comfortable reading. Flag full-width text containers on wide viewports where line length is excessive and degrades readability.',
 
    // Spatial grouping
    'Proximity and grouping: related elements (e.g., a form label and its input, a card\'s title, body, and action) must be visually closer to each other than to unrelated surrounding elements. Identify layouts where internal element spacing equals or exceeds the spacing between sections, making groupings ambiguous.',
    'Section separation: distinct content sections must be visually separated through whitespace, dividers, or background color changes. Report pages where sections flow into each other without visual delineation, making the structure hard to scan.',
    'Grid and alignment consistency: elements within lists, grids, or repeated components must share consistent alignment and baseline. Flag misaligned columns, inconsistent card heights in a grid, or elements that break the layout grid without intentional design purpose.',
 
    // Visual weight
    'Secondary content weight: auxiliary content (sidebar links, footnotes, secondary navigation items) must not carry the same visual weight as primary content. Flag secondary elements using bold text, high-saturation color, or large type sizes that compete with the primary message.',
    'Decorative vs. functional elements: purely decorative visuals must not be positioned or styled in a way that makes them appear interactive or as important as functional content. Report decorative elements that could be mistaken for buttons, links, or primary content.',
  ],
 
  copy: [
    // CTA labels
    'Action-oriented labels: CTA buttons and links must use specific verb + object phrases that clearly describe the outcome (e.g., "Create Account", "Download Report", "Send Message"). Flag generic labels such as "Submit", "Click here", "OK", or "Continue" that provide no context about what will happen.',
    'CTA and destination alignment: the label of a button or link must accurately reflect the action or destination it leads to. Report mismatches between what a label implies and what the surrounding context suggests it will do (e.g., "Learn More" on a checkout button, or "Sign Up" on a login form).',
    'Link text descriptiveness: hyperlink text must describe the destination or action on its own, without relying on surrounding context. Report anchors using "here", "click here", "read more", or "learn more" as the sole link text — these are non-descriptive for screen readers and provide no SEO value.',
 
    // Microcopy
    'Helper text for constrained inputs: form inputs with format requirements (dates, phone numbers, codes, passwords) must include visible helper text below the field that clarifies the expected format or constraints. Flag constrained inputs with no visible guidance beyond the input label.',
    'Placeholder text role: placeholder text must not be the only label for an input. It should be used for example values or hints, not to replace the label. Report inputs where removing the placeholder would leave users with no context for what the field requires.',
    'Error message quality: any visible error messages must state specifically what is wrong and what the user should do to fix it, in plain language. Report generic strings like "Error", "Invalid", "Something went wrong", or HTTP codes shown without human-readable explanation.',
    'Empty state copy: visible empty states (empty lists, zero-result searches, blank dashboards) must include a clear explanation of why the content is absent and a visible next action. Flag blank empty states with no message, or empty states that only show a loader or a generic illustration with no text.',
 
    // Consistency and tone
    'Terminology consistency: the same concept, entity, or action must be referred to by exactly the same term throughout the visible interface. Identify synonym drift where the same thing is called different names on the same screen or in close proximity (e.g., "Workspace" vs. "Project" vs. "Space").',
    'Voice and tone consistency: the writing register must be consistent across the entire screen — do not mix formal and casual tones within the same view. Flag abrupt shifts in register between headings, body copy, and microcopy on the same page.',
 
    // Conciseness and clarity
    'Conciseness: all visible UI text must be as short as possible without losing meaning. Flag filler phrases ("Please note that…", "In order to…", "You can also…") in headings, buttons, labels, or tooltips that add length without adding information.',
    'SEO-relevant headings: page title, H1, and visible section headings must include descriptive, keyword-relevant content. Flag headings that are purely stylistic or emotional with no semantic specificity (e.g., "Take control" instead of "Manage your team\'s invoices").',
    'Clarity for broad audiences: visible UI text must avoid idioms, culturally specific expressions, and colloquialisms that would confuse non-native speakers or users from different regions. Flag expressions that rely on cultural familiarity to be understood.',
  ],
 
  mobile: [
    // Thumb reach and layout
    'Thumb-zone ergonomics: primary actions and bottom navigation must be placed in the lower portion of the screen (the natural thumb-reach zone for one-handed use). Report primary CTAs or critical actions anchored exclusively at the top of the viewport where they require an uncomfortable reach.',
    'Top-corner action placement: critical or frequently used actions must not be placed exclusively in the top-left or top-right corners of the screen, which are the hardest areas to reach one-handed on phones larger than 5". Flag layouts where the only access to essential functions is in a top corner.',
 
    // Tap targets and spacing
    'Tap target size: all interactive elements (buttons, links, checkboxes, icon buttons, form inputs) must have a minimum tappable area of 44×44 CSS pixels. Evaluate from CSS dimensions and report controls that fall below this threshold.',
    'Tap target spacing: interactive elements must be separated by at least 8px of non-interactive space to prevent accidental activation. Flag densely packed navigation items, inline links, or action groups where adjacent targets are too close together.',
 
    // Viewport and readability
    'Responsive text sizing: body text must be set to at least 16px (1rem) on mobile breakpoints to prevent browsers from auto-zooming on input focus (iOS Safari) and to maintain comfortable readability on small screens. Flag text below this threshold in mobile-targeted CSS.',
    'Viewport overflow prevention: the layout must not produce horizontal scrolling on viewports between 320px and 390px wide. Inspect for fixed-width containers, non-responsive images (missing max-width: 100%), or elements that expand beyond the viewport width.',
    'Content stacking order on small viewports: when a multi-column desktop layout stacks to a single column on mobile, primary content must appear above secondary content. Flag layouts where stacking order buries the main content below sidebars, filters, or auxiliary panels.',
    'Readable line length on mobile: text containers on mobile must not span the full width of very wide mobile viewports without padding. Lines exceeding ~75 characters on a phone screen indicate missing horizontal padding or a max-width constraint.',
 
    // Forms and inputs
    'Input type for mobile keyboards: form inputs must use the most specific HTML input type available (type="email", type="tel", type="number", type="url", type="date") so the OS triggers the appropriate soft keyboard. Flag inputs using type="text" where a more specific type applies.',
    'Autocomplete attributes: inputs collecting common personal data (name, email, phone, address, postal code, credit card) must include the appropriate autocomplete attribute to enable OS and browser autofill. Report inputs missing these attributes.',
    'Form input height on mobile: form inputs and select elements must be at least 44px tall with adequate internal padding to be comfortably tappable and legible on touch screens. Report inputs that appear undersized in the layout.',
    'Horizontal scroll components on mobile: carousels, tab bars, or horizontally scrollable containers must provide a visual affordance indicating that more content exists beyond the visible area (e.g., a partially visible next item, a scroll indicator, or a visible scrollbar). Flag horizontally scrollable areas with no overflow hint.',
  ],
 
  gestalt: [
    // Proximity
    'Proximity: elements that belong together functionally (label + input, card title + description + CTA, icon + caption) must be grouped with tighter spacing than the gap separating them from unrelated elements. Report layouts where internal and external spacing is identical, making it unclear which elements form a group.',
    'Section whitespace hierarchy: the whitespace between distinct content sections must be visibly larger than the whitespace between elements within a section. Flag pages where all vertical gaps are uniform, preventing the eye from identifying structural boundaries.',
 
    // Similarity
    'Similarity — consistent component styling: elements that share the same function must share the same visual style. All primary buttons should look alike; all secondary buttons should look alike; all form inputs should look alike. Report visual inconsistencies within the same component type that imply unintended functional differences.',
    'Similarity — destructive action differentiation: actions that are destructive or irreversible (delete, remove, cancel) must be visually distinct from constructive or neutral actions — typically through a different color (e.g., red) or explicit warning styling. Flag destructive actions that look identical to safe actions.',
 
    // Continuity
    'Continuity — reading flow: the layout must guide the eye along a predictable reading path (F-pattern for content-heavy layouts, Z-pattern for sparse ones). Report abrupt alignment changes, orphaned elements, or visual dead-ends that interrupt the natural scanning flow.',
    'Continuity — grid and list alignment: items in a list, grid, or repeated component set must share consistent alignment and baseline so the eye can scan them as a coherent group. Report misaligned columns, inconsistent card heights within a grid, or elements that break rhythm without intentional purpose.',
 
    // Figure-ground
    'Figure-ground — content vs. background: primary content and interactive elements must stand out clearly from the page background through contrast, elevation (drop shadows, card surfaces), or whitespace separation. Report content that blends into the background or surfaces where multiple competing elements share identical visual weight.',
    'Figure-ground — modal and overlay separation: modals or overlays visible in the screenshot must use a clearly distinct backdrop (dimmed overlay, blur, or contrasting surface color) to visually separate the foreground dialog from the underlying page. Flag modals that appear to float without background separation.',
 
    // Common region
    'Common region — intentional grouping: visually enclosed areas (cards, panels, bordered containers, tinted backgrounds) signal to users that their contents belong together. Audit whether enclosed regions correctly group related content and report cases where a container groups unrelated items, creating a false association.',
    'Common region — form field grouping: long forms must use visual containers, dividers, or tinted regions to cluster related fields into logical groups (e.g., "Billing Address" as a distinct visual block from "Account Details"). Flag long forms where all fields are stacked uniformly with no visual grouping.',
 
    // Closure and symmetry
    'Closure — scroll affordance: partially visible elements at the edge of a scrollable container (carousel, horizontal list, masonry grid) effectively signal that more content exists off-screen. Flag scrollable containers where all visible items are fully shown with no overflow hint, leaving users unaware that more content is available.',
    'Symmetry and balance: intentional asymmetry can be a valid design choice, but accidental imbalance — a single orphaned item in a grid row, a CTA misaligned from its sibling elements, or uneven column widths with no structural purpose — creates visual tension. Report asymmetries that appear unintentional based on the surrounding layout context.',
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
