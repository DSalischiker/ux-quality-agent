import { parseRequestUrl } from './_lib/validateUrl.js'
import { buildScreenshotOneUrl, getScreenshotOneAccessKey } from './_lib/screenshotOne.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = parseRequestUrl(req.query?.url)
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error })
  }

  const accessKey = getScreenshotOneAccessKey()
  if (!accessKey) {
    return res.status(500).json({ error: 'Screenshot service is not configured (SCREENSHOTONE_API_KEY missing).' })
  }

  const url = buildScreenshotOneUrl({
    url: parsed.href,
    access_key: accessKey,
    viewport_width: '1280',
    viewport_height: '900',
    format: 'jpg',
    image_quality: '80',
    full_page: 'true',
    full_page_algorithm: 'by_sections',
    timeout: '90',
    block_ads: 'true',
    block_cookie_banners: 'true',
  })

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      return res.status(500).json({
        error: `Screenshot capture failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`,
      })
    }

    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    return res.status(200).json({
      base64,
      mimeType: 'image/jpeg',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Screenshot capture failed'
    return res.status(500).json({ error: message })
  }
}
