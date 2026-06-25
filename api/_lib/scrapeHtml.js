import * as cheerio from 'cheerio'

const LANDMARK_TAGS = new Set(['nav', 'main', 'header', 'footer', 'aside'])
const LANDMARK_ROLES = new Set([
  'navigation',
  'main',
  'banner',
  'contentinfo',
  'complementary',
  'nav',
  'header',
  'footer',
  'aside',
])

function collectLandmarks($) {
  const found = new Set()

  LANDMARK_TAGS.forEach((tag) => {
    if ($(tag).length) found.add(tag)
  })

  $('[role]').each((_, el) => {
    const role = String($(el).attr('role') || '')
      .trim()
      .toLowerCase()
    if (LANDMARK_ROLES.has(role)) {
      found.add(
        role === 'navigation'
          ? 'nav'
          : role === 'banner'
            ? 'header'
            : role === 'contentinfo'
              ? 'footer'
              : role === 'complementary'
                ? 'aside'
                : role,
      )
    }
  })

  return [...found]
}

function collectColorContrastClues($) {
  const clues = []

  $('[style]').each((_, el) => {
    if (clues.length >= 10) return false
    const style = String($(el).attr('style') || '')
    if (/color\s*:/i.test(style) || /background(-color)?\s*:/i.test(style)) {
      clues.push(style.trim().slice(0, 160))
    }
  })

  $('[class]').each((_, el) => {
    if (clues.length >= 10) return false
    const className = String($(el).attr('class') || '')
    const tokens = className.split(/\s+/).filter((token) => /color|bg-|background|text-/i.test(token))
    if (tokens.length) {
      clues.push(tokens.slice(0, 4).join(' '))
    }
  })

  return clues.slice(0, 10)
}

export function scrapeHtml(html) {
  const $ = cheerio.load(html)

  const headings = []
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim()
    if (text) headings.push({ level: el.tagName.toLowerCase(), text })
  })

  const ctaTexts = []
  $('button, a').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim()
    if (text) ctaTexts.push(text)
  })

  const images = []
  $('img').each((_, el) => {
    if (images.length >= 20) return false
    const src = String($(el).attr('src') || '').trim()
    const alt = $(el).attr('alt')
    const hasAlt = alt !== undefined && String(alt).trim().length > 0
    images.push({ src, alt: alt ?? '', hasAlt })
  })

  const formLabels = []
  $('input, select, textarea').each((_, el) => {
    const id = String($(el).attr('id') || '').trim()
    const labelEl = id ? $(`label[for="${id}"]`).first() : $(el).closest('label')
    const labelText = labelEl.length ? labelEl.text().replace(/\s+/g, ' ').trim() : ''
    formLabels.push({
      inputId: id || '(sin id)',
      labelText,
      hasLabel: labelText.length > 0,
    })
  })

  const ariaLabels = []
  $('[aria-label]').each((_, el) => {
    const value = String($(el).attr('aria-label') || '').trim()
    if (value) ariaLabels.push(value)
  })

  let hasSkipLink = false
  $('a').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim().toLowerCase()
    const href = String($(el).attr('href') || '').toLowerCase()
    if (
      text.includes('skip to content') ||
      text.includes('saltar al contenido') ||
      href.includes('#main') ||
      href.includes('#content')
    ) {
      hasSkipLink = true
      return false
    }
  })

  return {
    title: $('title').first().text().trim(),
    metaDescription: $('meta[name="description"]').attr('content')?.trim() || '',
    viewport: $('meta[name="viewport"]').attr('content')?.trim() || '',
    lang: $('html').attr('lang')?.trim() || '',
    headings,
    landmarks: collectLandmarks($),
    ctaTexts: [...new Set(ctaTexts)].slice(0, 80),
    images,
    formLabels,
    ariaLabels: [...new Set(ariaLabels)],
    hasSkipLink,
    colorContrastClues: collectColorContrastClues($),
  }
}
