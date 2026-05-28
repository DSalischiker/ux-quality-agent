import { chatCompletion as chatCompletionOpenRouter } from './openRouter'
import { chatCompletionGemini } from './gemini'

const PROVIDER_GEMINI = 'gemini'
const PROVIDER_OPENROUTER = 'openrouter'

function normalizeProvider(value) {
  const provider = String(value || '').trim().toLowerCase()
  if (provider === PROVIDER_OPENROUTER) return PROVIDER_OPENROUTER
  return PROVIDER_GEMINI
}

function hasGeminiConfig() {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY)
}

function hasOpenRouterConfig() {
  return Boolean(import.meta.env.VITE_OPENROUTER_API_KEY)
}

function buildProviderOrder() {
  const preferred = normalizeProvider(import.meta.env.VITE_AI_PROVIDER)
  if (preferred === PROVIDER_OPENROUTER) {
    return [PROVIDER_OPENROUTER, PROVIDER_GEMINI]
  }
  return [PROVIDER_GEMINI, PROVIDER_OPENROUTER]
}

async function runWithProvider(provider, params) {
  if (provider === PROVIDER_GEMINI) {
    if (!hasGeminiConfig()) {
      throw new Error('Gemini provider selected but VITE_GEMINI_API_KEY is missing.')
    }
    return chatCompletionGemini(params)
  }

  if (!hasOpenRouterConfig()) {
    throw new Error('OpenRouter provider selected but VITE_OPENROUTER_API_KEY is missing.')
  }
  return chatCompletionOpenRouter(params)
}

function withProviderMetadata(payload, provider) {
  return {
    ...(payload || {}),
    provider,
  }
}

export async function chatCompletion(params) {
  const providers = buildProviderOrder()
  const errors = []

  for (const provider of providers) {
    try {
      const payload = await runWithProvider(provider, params)
      return withProviderMetadata(payload, provider)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`[${provider}] ${message}`)
    }
  }

  throw new Error(`All AI providers failed. ${errors.join(' | ')}`)
}
