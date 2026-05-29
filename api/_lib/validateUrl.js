export function parseRequestUrl(raw) {
  const trimmed = String(raw || '').trim()
  if (!trimmed) {
    return { ok: false, error: 'Missing url parameter' }
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, error: 'URL must use http or https' }
    }
    return { ok: true, href: parsed.href }
  } catch {
    return { ok: false, error: 'Invalid URL' }
  }
}
