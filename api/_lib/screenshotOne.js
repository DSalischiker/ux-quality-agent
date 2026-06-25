export const SCREENSHOTONE_BASE = 'https://api.screenshotone.com/take'

export function getScreenshotOneAccessKey() {
  return process.env.SCREENSHOTONE_API_KEY || ''
}

/** Wait for network idle + DOM ready, then a short delay so SPAs can hydrate. */
export function appendRenderWaitParams(params) {
  params.append('wait_until', 'networkidle2')
  params.append('wait_until', 'domcontentloaded')
  params.set('delay', '2')
  if (!params.has('timeout')) {
    params.set('timeout', '60')
  }
  params.set('reduced_motion', 'true')
  return params
}

export function buildScreenshotOneUrl(extraParams) {
  const params = new URLSearchParams(extraParams)
  appendRenderWaitParams(params)
  return `${SCREENSHOTONE_BASE}?${params.toString()}`
}
