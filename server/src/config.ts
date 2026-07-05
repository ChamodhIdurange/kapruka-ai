import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT ?? 8787),
  clientOrigins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  mcpUrl: process.env.KAPRUKA_MCP_URL ?? 'https://mcp.kapruka.com/mcp',
  defaultCurrency: process.env.DEFAULT_CURRENCY ?? 'USD',
  google: {
    apiKey: process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? '',
    // Primary model. The server automatically falls back to `fallbackModel`
    // when the primary is rate-limited (the free tier for gemini-2.5-flash is
    // only ~20 requests/day; gemini-2.5-flash-lite allows ~1000/day).
    model: process.env.GOOGLE_MODEL ?? 'gemini-2.5-flash',
    fallbackModel: process.env.GOOGLE_FALLBACK_MODEL ?? 'gemini-2.5-flash-lite',
    // Google AI Studio's OpenAI-compatibility endpoint.
    baseUrl: process.env.GOOGLE_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta/openai/',
  },
}

/** Throws a clear error if Google AI Studio is not configured (only needed by /api/chat). */
export function assertGoogleConfigured() {
  if (!config.google.apiKey) {
    throw new Error('Google AI Studio is not configured. Set GOOGLE_API_KEY in server/.env')
  }
}
