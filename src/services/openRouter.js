const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1'

function trimSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

function getBaseUrl() {
  return trimSlash(import.meta.env.VITE_OPENROUTER_BASE_URL || DEFAULT_BASE_URL)
}

function buildHeaders(apiKey) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }

  const referer = import.meta.env.VITE_OPENROUTER_HTTP_REFERER
  const title = import.meta.env.VITE_OPENROUTER_APP_NAME

  if (referer) headers['HTTP-Referer'] = referer
  if (title) headers['X-Title'] = title

  return headers
}

function buildErrorMessage(payload, fallback = 'OpenRouter request failed') {
  if (!payload) return fallback
  if (typeof payload === 'string') return payload
  return payload.error?.message || payload.message || fallback
}

export async function chatCompletion({
  model,
  messages,
  temperature = 0.2,
  maxTokens = 8192,
  responseFormat = null,
  signal,
}) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('Missing VITE_OPENROUTER_API_KEY environment variable')
  }

  const finalModel = model || import.meta.env.VITE_OPENROUTER_MODEL
  if (!finalModel) {
    throw new Error('Missing OpenRouter model. Set VITE_OPENROUTER_MODEL or pass model explicitly.')
  }

  const body = {
    model: finalModel,
    messages,
    temperature,
    max_tokens: maxTokens,
  }

  if (responseFormat) {
    body.response_format = responseFormat
  }

  console.log('[OpenRouter] Request body:', body)

  const response = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: JSON.stringify(body),
    signal,
  })

  const rawText = await response.text()
  let payload = null

  if (rawText) {
    try {
      payload = JSON.parse(rawText)
    } catch (_) {
      if (!response.ok) {
        throw new Error(buildErrorMessage(rawText))
      }
    }
  }

  console.log('[OpenRouter] Response:', {
    ok: response.ok,
    status: response.status,
    payload,
    rawText: payload ? null : rawText,
  })

  if (!response.ok) {
    throw new Error(buildErrorMessage(payload, `OpenRouter request failed (${response.status})`))
  }

  return payload
}
