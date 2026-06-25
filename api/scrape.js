import { parseRequestUrl } from './_lib/validateUrl.js'
import {
  buildScreenshotOneUrl,
  getScreenshotOneAccessKey,
} from './_lib/screenshotOne.js'
import { assessHtmlContent } from './_lib/assessHtmlContent.js'
import { scrapeHtml } from './_lib/scrapeHtml.js'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

async function fetchStaticHtml(href) {
  const response = await fetch(href, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(10_000),
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`Could not fetch URL (${response.status})`)
  }

  return response.text()
}

async function fetchRenderedHtml(href) {
  const accessKey = getScreenshotOneAccessKey()
  if (!accessKey) {
    const html = await fetchStaticHtml(href)
    return { html, htmlSource: 'static-fetch' }
  }

  const url = buildScreenshotOneUrl({
    url: href,
    access_key: accessKey,
    format: 'html',
    viewport_width: '1280',
    viewport_height: '900',
    include_shadow_dom: 'true',
  })

  const response = await fetch(url)

  if (!response.ok) {
    const html = await fetchStaticHtml(href)
    return { html, htmlSource: 'static-fetch', renderFallback: true }
  }

  return { html: await response.text(), htmlSource: 'screenshotone-rendered' }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = parseRequestUrl(req.query?.url)
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error })
  }

  try {
    const { html, htmlSource, renderFallback } = await fetchRenderedHtml(parsed.href)
    const scraped = scrapeHtml(html)
    const quality = assessHtmlContent(scraped)

    return res.status(200).json({
      ...scraped,
      htmlSource,
      renderFallback: renderFallback ?? false,
      ...quality,
    })
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'TimeoutError'
        ? 'Request timed out after 10 seconds'
        : error instanceof Error
          ? error.message
          : 'Failed to scrape URL'
    return res.status(500).json({ error: message })
  }
}
