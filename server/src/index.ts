import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { callMcpTool, listMcpTools } from './mcp.js'
import { runAgent } from './agent.js'
import { searchProducts } from './tools.js'
import {
  extractProducts, mapCategories, mapCheckDelivery,
  mapCities, mapOrderResult, mapTrackOrder,
} from './mappers.js'
import type { ChatEvent, ChatMessage } from './types.js'

const app = express()
app.use(cors({ origin: config.clientOrigins.length ? config.clientOrigins : true }))
app.use(express.json({ limit: '1mb' }))

const asyncRoute =
  (fn: (req: express.Request, res: express.Response) => Promise<void>) =>
  (req: express.Request, res: express.Response) => {
    fn(req, res).catch((err) => {
      console.error(err)
      if (!res.headersSent) res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    })
  }

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mcp: config.mcpUrl, currency: config.defaultCurrency })
})

// ── Categories (cached briefly) ──────────────────────────
let catCache: { at: number; data: unknown } | null = null
app.get('/api/categories', asyncRoute(async (_req, res) => {
  if (!catCache || Date.now() - catCache.at > 10 * 60_000) {
    const raw = await callMcpTool('kapruka_list_categories', { depth: 1 })
    catCache = { at: Date.now(), data: mapCategories(raw) }
  }
  res.json({ categories: catCache.data })
}))

// ── Search (browse modal + chips) ────────────────────────
app.get('/api/search', asyncRoute(async (req, res) => {
  const q = String(req.query.q ?? '').trim()
  const currency = String(req.query.currency ?? config.defaultCurrency)
  const args: Record<string, unknown> = {
    q: q || 'gifts',
    limit: Math.min(Number(req.query.limit ?? 24) || 24, 50),
    currency,
  }
  if (req.query.category) args.category = String(req.query.category)
  if (req.query.min_price) args.min_price = Number(req.query.min_price)
  if (req.query.max_price) args.max_price = Number(req.query.max_price)
  if (req.query.cursor) args.cursor = String(req.query.cursor)
  if (req.query.sort) args.sort = String(req.query.sort)
  if (req.query.in_stock_only != null) args.in_stock_only = req.query.in_stock_only === 'true'

  // searchProducts applies the price budget in the display currency (the MCP
  // filters in LKR), so the browse-modal price chips work correctly.
  const { products, nextCursor } = await searchProducts(args, currency)
  res.json({ items: products, nextCursor })
}))

// ── Product detail ───────────────────────────────────────
app.get('/api/product/:id', asyncRoute(async (req, res) => {
  const currency = String(req.query.currency ?? config.defaultCurrency)
  const raw = await callMcpTool('kapruka_get_product', { product_id: req.params.id, currency })
  const items = extractProducts(raw, currency)
  res.json({ product: items[0] ?? null, raw })
}))

// ── Delivery cities (autocomplete) ───────────────────────
app.get('/api/delivery-cities', asyncRoute(async (req, res) => {
  const args: Record<string, unknown> = { limit: Math.min(Number(req.query.limit ?? 25) || 25, 50) }
  if (req.query.query) args.query = String(req.query.query)
  const raw = await callMcpTool('kapruka_list_delivery_cities', args)
  res.json({ cities: mapCities(raw) })
}))

// ── Check delivery ───────────────────────────────────────
app.post('/api/check-delivery', asyncRoute(async (req, res) => {
  const { city, delivery_date, product_id } = req.body ?? {}
  if (!city) {
    res.status(400).json({ error: 'city is required' })
    return
  }
  const args: Record<string, unknown> = { city }
  if (delivery_date) args.delivery_date = delivery_date
  if (product_id) args.product_id = product_id
  const raw = await callMcpTool('kapruka_check_delivery', args)
  res.json(mapCheckDelivery(raw))
}))

// ── Track order ──────────────────────────────────────────
app.post('/api/track', asyncRoute(async (req, res) => {
  const orderNumber = String(req.body?.order_number ?? '').trim()
  if (!orderNumber) {
    res.status(400).json({ error: 'order_number is required' })
    return
  }
  const raw = await callMcpTool('kapruka_track_order', { order_number: orderNumber })
  res.json(mapTrackOrder(raw, orderNumber))
}))

// ── Create order (THE gated mutation — only path that places an order) ──
app.post('/api/order', asyncRoute(async (req, res) => {
  const { cart, recipient, delivery, sender, gift_message, currency } = req.body ?? {}
  if (!Array.isArray(cart) || cart.length === 0) {
    res.status(400).json({ error: 'cart must have at least one item' })
    return
  }
  if (!recipient?.name || !recipient?.phone) {
    res.status(400).json({ error: 'recipient.name and recipient.phone are required' })
    return
  }
  if (!delivery?.address || !delivery?.city || !delivery?.date) {
    res.status(400).json({ error: 'delivery.address, delivery.city and delivery.date are required' })
    return
  }
  if (!sender?.name) {
    res.status(400).json({ error: 'sender.name is required' })
    return
  }
  const args: Record<string, unknown> = {
    cart, recipient, delivery, sender,
    currency: currency ?? config.defaultCurrency,
  }
  if (gift_message) args.gift_message = gift_message
  const raw = await callMcpTool('kapruka_create_order', args)
  const result = mapOrderResult(raw)

  // create_order may "succeed" as a tool call but return an error payload
  // (e.g. city_not_deliverable, date_not_deliverable). Surface it as a 4xx so
  // the client can show why, instead of a fake confirmation with no pay link.
  if (!result.payUrl) {
    const text = typeof (raw as { text?: string })?.text === 'string' ? (raw as { text: string }).text : ''
    const m = /Error\s*\(([^)]+)\)\s*:?\s*(.*)/i.exec(text)
    const message = m
      ? (m[2]?.trim() || m[1].replace(/_/g, ' '))
      : (text || 'Could not create the order. Please check the delivery city and date, then try again.')
    res.status(422).json({ error: message, code: m?.[1] })
    return
  }
  res.json(result)
}))

// ── Chat (SSE) ───────────────────────────────────────────
app.post('/api/chat', asyncRoute(async (req, res) => {
  const history = (req.body?.messages ?? []) as ChatMessage[]
  const language = typeof req.body?.language === 'string' ? req.body.language : undefined
  if (!Array.isArray(history) || history.length === 0) {
    res.status(400).json({ error: 'messages[] is required' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  const send = (e: ChatEvent) => res.write(`data: ${JSON.stringify(e)}\n\n`)

  try {
    await runAgent(history, send, language)
    send({ type: 'done' })
  } catch (err) {
    const status = (err as { status?: number })?.status
    const message =
      status === 429
        ? "KAI is getting a lot of requests right now (AI rate limit). Please wait a few seconds and try again."
        : status === 401 || status === 403
          ? 'The AI service rejected the request — check GOOGLE_API_KEY in server/.env.'
          : err instanceof Error ? err.message : String(err)
    send({ type: 'error', message })
  } finally {
    res.end()
  }
}))

app.listen(config.port, async () => {
  console.log(`Kapruka concierge server listening on http://localhost:${config.port}`)
  try {
    const tools = await listMcpTools()
    console.log(`Connected to Kapruka MCP — ${tools.length} tools available.`)
  } catch (err) {
    console.warn('Warning: could not reach Kapruka MCP yet:', err instanceof Error ? err.message : err)
  }
})
