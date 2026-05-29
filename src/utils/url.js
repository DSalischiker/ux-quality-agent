/**
 * Normaliza el texto del input (host/path o URL completa) y valida con la API URL nativa.
 * @returns {{ valid: boolean, href: string, error: string | null }}
 */
export function validateUserUrl(input) {
  const trimmed = String(input || '').trim()
  if (!trimmed) {
    return { valid: false, href: '', error: null }
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, href: '', error: 'La URL debe usar http:// o https://' }
    }
    return { valid: true, href: parsed.href, error: null }
  } catch {
    return { valid: false, href: '', error: 'Introduce una URL válida (http:// o https://)' }
  }
}
