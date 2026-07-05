import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT ?? 8787),
  clientOrigins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  mcpUrl: process.env.KAPRUKA_MCP_URL ?? 'https://mcp.kapruka.com/mcp',
  defaultCurrency: process.env.DEFAULT_CURRENCY ?? 'USD',
  azure: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT ?? '',
    apiKey: process.env.AZURE_OPENAI_API_KEY ?? '',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? 'gpt-5.2',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2024-10-21',
  },
}

/** Throws a clear error if Azure OpenAI is not configured (only needed by /api/chat). */
export function assertAzureConfigured() {
  if (!config.azure.endpoint || !config.azure.apiKey) {
    throw new Error(
      'Azure OpenAI is not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY in server/.env',
    )
  }
}
