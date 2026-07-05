import type { ChatCompletionTool } from 'openai/resources/index'
import { listMcpTools, callMcpTool, type McpToolInfo } from './mcp.js'
import { extractProducts, mapCategories } from './mappers.js'
import type { CategoryVM, ProductVM } from './types.js'

/** Tools the chat agent is allowed to call. create_order is deliberately excluded
 *  — orders are only ever placed through the gated /api/order endpoint. */
const AGENT_TOOLS = new Set([
  'kapruka_search_products',
  'kapruka_get_product',
  'kapruka_list_categories',
  'kapruka_list_delivery_cities',
  'kapruka_check_delivery',
  'kapruka_track_order',
])

const PRODUCT_TOOLS = new Set(['kapruka_search_products', 'kapruka_get_product'])

function resolveRef(ref: string, defs: Record<string, any>): any {
  const m = /^#\/\$defs\/(.+)$/.exec(ref)
  return m ? defs[m[1]] : undefined
}

/** Flatten the MCP `{ params: { $ref } }` envelope into a plain OpenAI parameter
 *  schema (inner Input object), dropping the response_format knob. */
function flattenSchema(schema: Record<string, any>): Record<string, any> {
  const defs = schema.$defs ?? {}
  const paramsProp = schema.properties?.params
  let inner = paramsProp
  if (paramsProp?.$ref) inner = resolveRef(paramsProp.$ref, defs)

  if (!inner || !inner.properties) {
    return { type: 'object', properties: {}, additionalProperties: true }
  }

  const properties = { ...inner.properties }
  delete properties.response_format
  const required = (inner.required ?? []).filter((r: string) => r !== 'response_format')

  const out: Record<string, any> = { type: 'object', properties, additionalProperties: false }
  if (required.length) out.required = required
  if (Object.keys(defs).length) out.$defs = defs
  return out
}

/** A UI-only tool (not an MCP call): lets the agent offer tappable answer chips
 *  while it asks follow-up questions. */
const QUICK_REPLIES_TOOL: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'propose_quick_replies',
    description:
      'Offer the shopper 3–5 short, tappable answer chips for the question you just asked (e.g. occasion or budget options). Call this whenever you ask a follow-up question. The shopper can also type a free-form answer.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        replies: {
          type: 'array',
          description: '3–5 short answer options, each under ~3 words, in the reply language.',
          items: { type: 'string' },
        },
      },
      required: ['replies'],
    },
  },
}

/** Build the OpenAI function-tool list from the live MCP tool list, plus UI tools. */
export async function buildAgentTools(): Promise<ChatCompletionTool[]> {
  const tools = await listMcpTools()
  const mcpTools = tools
    .filter((t) => AGENT_TOOLS.has(t.name))
    .map((t: McpToolInfo) => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: flattenSchema(t.inputSchema),
      },
    }))
  return [...mcpTools, QUICK_REPLIES_TOOL]
}

function compactProduct(p: ProductVM) {
  return {
    id: p.id,
    name: p.name,
    price: p.priceText,
    in_stock: p.inStock,
    stock_level: p.stockLevel,
    rating: p.rating,
    category: p.category,
    url: p.url,
    summary: p.summary ? p.summary.slice(0, 160) : undefined,
  }
}

export interface DispatchResult {
  /** Compact JSON returned to the model as the tool result. */
  result: unknown
  /** Rich product cards to surface in the UI (search/get_product only). */
  products?: ProductVM[]
  /** Category chips to surface in the UI (list_categories only). */
  categories?: CategoryVM[]
  /** Tappable quick-reply chips (propose_quick_replies only). */
  quickReplies?: string[]
}

// Kapruka's search is largely literal/keyword-based, so long natural-language
// queries ("birthday chocolate cake Colombo") often return nothing. Reduce a
// zero-result query to its core product keyword(s).
const PRODUCT_KEYWORDS = [
  'cake', 'cakes', 'cupcake', 'chocolate', 'chocolates', 'flowers', 'flower', 'roses', 'rose',
  'bouquet', 'lily', 'lilies', 'orchid', 'carnation', 'hamper', 'hampers', 'basket', 'fruit',
  'wine', 'watch', 'perfume', 'cologne', 'toy', 'teddy', 'plant', 'jewellery', 'jewelry',
  'mug', 'gift', 'spa', 'pamper', 'ferrero', 'lindt', 'macaron', 'pastry',
]
function simplifyQuery(q: string): string {
  const words = q.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean)
  const kw = words.filter((w) => PRODUCT_KEYWORDS.includes(w))
  if (kw.length) return Array.from(new Set(kw)).slice(0, 2).join(' ')
  return words.slice(0, 2).join(' ')
}

/** Execute one agent tool call against the MCP server. */
export async function dispatchTool(
  name: string,
  args: Record<string, unknown>,
  currency: string,
): Promise<DispatchResult> {
  if (name === 'propose_quick_replies') {
    const replies = Array.isArray(args.replies) ? args.replies.map(String).filter(Boolean).slice(0, 6) : []
    return { result: { shown: replies.length }, quickReplies: replies }
  }
  if (!AGENT_TOOLS.has(name)) {
    return { result: { error: `Tool ${name} is not available to the assistant.` } }
  }
  // Force the display currency so the model's price filters (min/max) are
  // interpreted in the same currency as the prices we show — otherwise a "$30"
  // budget gets read as 30 LKR and filters out everything.
  if (PRODUCT_TOOLS.has(name)) args = { ...args, currency }

  let raw = await callMcpTool(name, args)

  if (PRODUCT_TOOLS.has(name)) {
    let products = extractProducts(raw, currency)

    // Fallback: retry once with a simplified keyword query and no filters.
    if (products.length === 0 && name === 'kapruka_search_products' && typeof args.q === 'string') {
      const simpler = simplifyQuery(args.q)
      raw = await callMcpTool(name, { q: simpler || args.q, currency, limit: args.limit ?? 8 })
      products = extractProducts(raw, currency)
    }

    const nextCursor =
      raw && typeof raw === 'object' ? (raw as Record<string, unknown>).next_cursor : undefined
    return {
      products,
      result: {
        count: products.length,
        products: products.map(compactProduct),
        next_cursor: nextCursor ?? null,
        note: products.length === 0 ? 'No matches — try a simpler one-word query like "cake" or "roses".' : undefined,
      },
    }
  }

  if (name === 'kapruka_list_categories') {
    const categories = mapCategories(raw)
    // Give the model NAMES ONLY — never the URLs (so it can't paste a link dump).
    return { categories, result: { count: categories.length, categories: categories.map((c) => c.name) } }
  }

  return { result: raw }
}

const FRIENDLY: Record<string, string> = {
  kapruka_search_products: 'Searching Kapruka',
  kapruka_get_product: 'Looking up product details',
  kapruka_list_categories: 'Browsing categories',
  kapruka_list_delivery_cities: 'Checking delivery cities',
  kapruka_check_delivery: 'Checking delivery options',
  kapruka_track_order: 'Tracking your order',
}
export const friendlyToolLabel = (name: string) => FRIENDLY[name] ?? name
