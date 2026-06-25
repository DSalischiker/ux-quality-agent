function formatHtmlSourceLine(scrape) {
  if (scrape.htmlSource === 'screenshotone-rendered') {
    return 'Origen del HTML: renderizado en navegador (ScreenshotOne, tras networkidle + delay de hidratación)'
  }
  if (scrape.htmlSource === 'static-fetch') {
    const fallback = scrape.renderFallback
      ? ' — fallback tras fallo del renderizado en navegador'
      : ''
    return `Origen del HTML: fetch estático del servidor (sin ejecutar JavaScript)${fallback}`
  }
  return ''
}

function formatContentQualityLines(scrape) {
  const lines = []

  if (scrape.isLikelyUnhydratedSPA) {
    lines.push(
      'Calidad del extracto HTML: PROBABLE SPA SIN CONTENIDO SEMÁNTICO (sin headings, CTAs ni landmarks detectados).',
      'El HTML puede ser un shell vacío o la hidratación no completó a tiempo. Prioriza la captura visual; usa el extracto HTML solo con cautela para semántica/accesibilidad.',
    )
  } else if (scrape.contentUseful === false) {
    lines.push(
      'Calidad del extracto HTML: limitada — pocos elementos semánticos extraíbles.',
    )
  } else {
    lines.push('Calidad del extracto HTML: útil para semántica y accesibilidad.')
  }

  return lines
}

export function formatStructuralContext(scrape = {}) {
  const headings = Array.isArray(scrape.headings) ? scrape.headings : []
  const headingsText = headings.length
    ? headings.map((h) => `${String(h.level || 'h').toUpperCase()}: ${h.text || ''}`).join('\n')
    : '(ninguno detectado)'

  const landmarks = Array.isArray(scrape.landmarks) ? scrape.landmarks : []
  const ctaTexts = Array.isArray(scrape.ctaTexts) ? scrape.ctaTexts : []
  const images = Array.isArray(scrape.images) ? scrape.images : []
  const formLabels = Array.isArray(scrape.formLabels) ? scrape.formLabels : []
  const ariaLabels = Array.isArray(scrape.ariaLabels) ? scrape.ariaLabels : []
  const colorContrastClues = Array.isArray(scrape.colorContrastClues) ? scrape.colorContrastClues : []

  const imagesWithoutAlt = images.filter((img) => !img.hasAlt).length
  const missingLabels = formLabels.filter((f) => !f.hasLabel)
  const formSummary = missingLabels.length
    ? `${missingLabels.length} campo(s) sin etiqueta asociada`
    : 'todos los campos revisados tienen etiqueta'

  const htmlSourceLine = formatHtmlSourceLine(scrape)
  const contentQualityLines = formatContentQualityLines(scrape)

  return [
    '--- CONTEXTO ESTRUCTURAL DE LA PÁGINA (extraído del HTML) ---',
    ...(htmlSourceLine ? [htmlSourceLine, ''] : []),
    ...contentQualityLines,
    '',
    `Título: ${scrape.title || '(vacío)'}`,
    `Meta descripción: ${scrape.metaDescription || '(vacía)'}`,
    `Idioma declarado: ${scrape.lang || '(no declarado)'}`,
    `Viewport configurado: ${scrape.viewport || '(no configurado)'}`,
    '',
    'Jerarquía de headings:',
    headingsText,
    '',
    `Landmarks semánticos presentes: ${landmarks.length ? landmarks.join(', ') : '(ninguno)'}`,
    '',
    `Textos de CTAs y links: ${ctaTexts.length ? ctaTexts.join(' · ') : '(ninguno)'}`,
    '',
    `Imágenes (${images.length}): ${imagesWithoutAlt} sin atributo alt`,
    '',
    `Formularios: ${formSummary}`,
    '',
    `ARIA labels encontrados: ${ariaLabels.length ? ariaLabels.join(' · ') : '(ninguno)'}`,
    `Skip link presente: ${scrape.hasSkipLink ? 'sí' : 'no'}`,
    colorContrastClues.length
      ? `\nPistas de contraste (CSS): ${colorContrastClues.join(' | ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}
