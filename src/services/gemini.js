const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

function trimSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

function getBaseUrl() {
  return trimSlash(import.meta.env.VITE_GEMINI_BASE_URL || DEFAULT_BASE_URL)
}

function buildErrorMessage(payload, fallback = 'Gemini request failed') {
  if (!payload) return fallback
  if (typeof payload === 'string') return payload
  return payload.error?.message || payload.message || fallback
}

function parseDataUrl(url) {
  if (typeof url !== 'string') return null
  const match = url.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  return { mimeType: match[1], data: match[2] }
}

function mapMessagesToGemini(messages = []) {
  const systemTexts = []
  const contents = []

  for (const message of messages) {
    if (!message) continue
    if (message.role === 'system') {
      if (typeof message.content === 'string' && message.content.trim()) {
        systemTexts.push(message.content.trim())
      }
      continue
    }

    if (message.role !== 'user' && message.role !== 'assistant') continue

    const parts = []
    if (typeof message.content === 'string') {
      if (message.content.trim()) parts.push({ text: message.content })
    } else if (Array.isArray(message.content)) {
      for (const chunk of message.content) {
        if (chunk?.type === 'text' && typeof chunk.text === 'string' && chunk.text.trim()) {
          parts.push({ text: chunk.text })
        }
        if (chunk?.type === 'image_url') {
          const parsed = parseDataUrl(chunk?.image_url?.url)
          if (parsed) {
            parts.push({
              inline_data: {
                mime_type: parsed.mimeType,
                data: parsed.data,
              },
            })
          }
        }
      }
    }

    if (!parts.length) continue

    contents.push({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts,
    })
  }

  return {
    systemInstruction: systemTexts.length
      ? { parts: [{ text: systemTexts.join('\n\n') }] }
      : null,
    contents,
  }
}

function normalizeGeminiResponse(payload) {
  const candidate = payload?.candidates?.[0]
  const finishReason = candidate?.finishReason
  if (finishReason === 'MAX_TOKENS') {
    throw new Error(
      'Gemini corto la respuesta por limite de tokens de salida (JSON incompleto).'
    )
  }

  const parts = candidate?.content?.parts
  const text = Array.isArray(parts)
    ? parts.map((part) => (typeof part?.text === 'string' ? part.text : '')).filter(Boolean).join('\n')
    : ''

  return {
    ...payload,
    choices: [
      {
        message: {
          role: 'assistant',
          content: text,
        },
      },
    ],
  }
}

export async function chatCompletionGemini({
  model,
  messages,
  temperature = 0.2,
  maxTokens = 8192,
  responseFormat = null,
  signal,
}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY environment variable')
  }

  const finalModel = model || import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'
  const { systemInstruction, contents } = mapMessagesToGemini(messages)
  if (!contents.length) {
    throw new Error('Gemini request has no valid message content.')
  }

  const body = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  }

  if (systemInstruction) {
    body.systemInstruction = systemInstruction
  }

  if (responseFormat?.type === 'json_object') {
    body.generationConfig.responseMimeType = 'application/json'
  }

  console.log('[Gemini] Request body:', body)

  const response = await fetch(`${getBaseUrl()}/models/${encodeURIComponent(finalModel)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  console.log('[Gemini] Response:', {
    ok: response.ok,
    status: response.status,
    payload,
    rawText: payload ? null : rawText,
  })

  if (!response.ok) {
    throw new Error(buildErrorMessage(payload, `Gemini request failed (${response.status})`))
  }

  return normalizeGeminiResponse(payload)
}
