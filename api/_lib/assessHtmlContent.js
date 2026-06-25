/**
 * Detect if parsed HTML looks like an unhydrated SPA shell (no semantic content).
 * @param {{ headings?: unknown[], ctaTexts?: unknown[], landmarks?: unknown[] }} scrapeResult
 */
export function assessHtmlContent(scrapeResult) {
  const headings = Array.isArray(scrapeResult.headings) ? scrapeResult.headings : []
  const ctaTexts = Array.isArray(scrapeResult.ctaTexts) ? scrapeResult.ctaTexts : []
  const landmarks = Array.isArray(scrapeResult.landmarks) ? scrapeResult.landmarks : []

  const isLikelyUnhydratedSPA =
    headings.length === 0 && ctaTexts.length === 0 && landmarks.length === 0

  return {
    isLikelyUnhydratedSPA,
    contentUseful: !isLikelyUnhydratedSPA,
  }
}
