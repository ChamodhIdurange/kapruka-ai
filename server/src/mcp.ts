import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { config } from './config.js'

export interface McpToolInfo {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

let client: Client | null = null
let connecting: Promise<Client> | null = null
let toolCache: McpToolInfo[] | null = null

async function makeClient(): Promise<Client> {
  const c = new Client(
    { name: 'kapruka-concierge-server', version: '0.1.0' },
    { capabilities: {} },
  )
  const transport = new StreamableHTTPClientTransport(new URL(config.mcpUrl))
  await c.connect(transport)
  return c
}

/** Lazily connect (and reconnect after a dropped session) to the Kapruka MCP server. */
async function getClient(): Promise<Client> {
  if (client) return client
  if (!connecting) {
    connecting = makeClient()
      .then((c) => {
        client = c
        connecting = null
        // Drop the cached client if the transport closes so the next call reconnects.
        c.onclose = () => {
          client = null
        }
        return c
      })
      .catch((err) => {
        connecting = null
        throw err
      })
  }
  return connecting
}

export async function listMcpTools(): Promise<McpToolInfo[]> {
  if (toolCache) return toolCache
  const c = await getClient()
  const res = await c.listTools()
  toolCache = res.tools.map((t) => ({
    name: t.name,
    description: t.description ?? '',
    inputSchema: (t.inputSchema ?? {}) as Record<string, unknown>,
  }))
  return toolCache
}

/**
 * Call a Kapruka MCP tool. Every tool nests its args under `params`, so we wrap
 * the flattened arguments and request JSON output, then parse the text content.
 */
export async function callMcpTool(
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const c = await getClient()
  const params = { ...args, response_format: 'json' }
  let res
  try {
    res = await c.callTool({ name, arguments: { params } })
  } catch (err) {
    // One reconnect attempt if the session was dropped server-side.
    client = null
    const c2 = await getClient()
    res = await c2.callTool({ name, arguments: { params } })
    void err
  }

  const content = (res.content ?? []) as Array<{ type: string; text?: string }>
  const text = content
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('\n')
    .trim()

  if (!text) return res
  try {
    return JSON.parse(text)
  } catch {
    return { text }
  }
}
