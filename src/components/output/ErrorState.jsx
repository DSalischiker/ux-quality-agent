function getHelpMessage(rawMessage = '') {
  const msg = String(rawMessage || '').toLowerCase()
  if (msg.includes('vite_gemini_api_key') || msg.includes('vite_openrouter_api_key')) {
    return 'Falta configurar una API key. Revisa tu archivo .env y reinicia la app.'
  }
  if (msg.includes('all ai providers failed')) {
    return 'No se pudo conectar con ningun proveedor de IA. Verifica red, credenciales y proveedor seleccionado.'
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Parece un problema de red. Revisa tu conexion e intenta nuevamente.'
  }
  if (
    msg.includes('unterminated string') ||
    msg.includes('json incomplet') ||
    msg.includes('limite de tokens') ||
    msg.includes('max_tokens')
  ) {
    return 'La respuesta del modelo llego cortada (suele ser por limite de salida). Pulsa Reintentar; si vuelve a pasar, elige menos criterios o acorta el contexto.'
  }
  if (msg.includes('json') || msg.includes('unexpected')) {
    return 'El proveedor respondio en un formato no valido. Intenta de nuevo en unos segundos.'
  }
  return 'No se pudo completar el analisis. Puedes reintentar; si persiste, revisa la configuracion del proveedor.'
}

export default function ErrorState({ message, providerUsed, onRetry }) {
  const help = getHelpMessage(message)
  return (
    <div className="pt-10 px-2">
      <h2 className="font-serif text-[30px] leading-[1.2] font-normal tracking-[-0.01em] m-0 mb-3">
        No se pudo completar el analisis
      </h2>
      {providerUsed && (
        <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--ink-3)] m-0 mb-2">
          Ultimo proveedor usado: {providerUsed}
        </p>
      )}
      <p className="text-[13px] text-[var(--ink-3)] m-0 mb-2 max-w-[60ch]">
        {help}
      </p>
      {!!message && (
        <p className="text-[12px] text-[var(--ink-3)]/85 m-0 mb-4 max-w-[80ch] break-words">
          Detalle tecnico: {message}
        </p>
      )}
      <button
        type="button"
        onClick={onRetry}
        className="h-9 px-4 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] text-[13px] hover:bg-[var(--surface-hover)] transition-colors"
      >
        Reintentar analisis
      </button>
    </div>
  )
}
