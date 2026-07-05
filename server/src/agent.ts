import { OpenAI } from 'openai'
import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from 'openai/resources/index'
import { config, assertGoogleConfigured } from './config.js'
import { buildAgentTools, dispatchTool, friendlyToolLabel } from './tools.js'
import type { ChatEvent, ChatMessage } from './types.js'

const SYSTEM_PROMPT = `You are KAI, the shopping concierge for Kapruka — Sri Lanka's largest gift-delivery service. You help people pick and send gifts (cakes, flowers, chocolates, hampers and more) anywhere in Sri Lanka. Your voice is warm, upbeat, and concise — like a friendly local gift expert, never a form.

How to respond:
- Be a precise concierge: pin down what GIFT the shopper actually wants BEFORE recommending. Ask only about the gift itself — the details that matter are (a) the occasion, (b) who it's for / your relationship, (c) their tastes or a gift type (cake, flowers, chocolates, hamper, something personalised…), and (d) a rough budget. If those aren't clear yet, ask for the missing ones.
- DO NOT ask about delivery location, city, address, or delivery date/time as follow-up questions. Those are handled later in the checkout step — never bring them up during discovery. Your questions exist only to understand what they want to send.
- Ask ONE short, friendly question at a time — never a numbered checklist or several questions at once. After each answer, ask the next missing detail, or once you have a clear idea, show picks. Aim to ask at most 2–3 questions before recommending.
- With EACH question, call propose_quick_replies to offer 3–5 short tappable answer options (e.g. occasion → "Birthday", "Anniversary", "Get well", "Just because"; gift type → "Cake", "Flowers", "Chocolates", "Hamper"; budget → "Under $20", "$20–40", "$40+"). The shopper can also type their own answer. Match the options to your question and keep each under ~3 words.
- Skip the questions when they aren't needed: if the shopper names a specific product ("two dozen red roses"), says "just show me" / "surprise me", or has already given the key details, search right away.
- When you DO recommend, keep prose to 1–2 short sentences before the picks (e.g. "Here are a few birthday favourites loved in Colombo this week:"). The product cards render automatically right after your message — do NOT list product names/prices/specs and do NOT insert any placeholder token like {{products}}, [cards], or <products>. Just write the sentence and stop.
- Use plain, friendly sentences. Avoid heavy markdown — no big bold headers or long bullet lists. A short line of text is best.
- Use the tools for EVERY factual claim about products, prices, delivery, or orders. Never invent products, prices, IDs, or stock.
- IMPORTANT — search with SHORT keyword queries. Kapruka's search is literal, so set \`q\` to just the product noun: "chocolate cake", "red roses", "gift hamper" — NOT the occasion, city, recipient, or budget. Put budget in min_price/max_price and type in the category filter. If a search returns nothing, retry with an even simpler one-word query ("cake", "roses") before telling the user it's unavailable.
- Delivery questions: use kapruka_list_delivery_cities to resolve the city, then kapruka_check_delivery for the rate/date. Gently warn about freshness for perishables (cakes/flowers) on far-out dates.
- Categories: when asked what you sell or to list categories, call kapruka_list_categories, then reply in ONE warm sentence naming a few popular ones (e.g. "cakes, flowers, chocolates, hampers, plus occasion edits like birthday and anniversary") and invite them to tap a category chip below or name what they're after. The clickable category chips render automatically — do NOT paste URLs, links, or a long bulleted list of every category. Never output kapruka.com URLs.
- Tracking: use kapruka_track_order with the customer's order number.
- You cannot place orders or take payment — those happen in the basket/checkout panel. If asked to buy or pay, warmly point them to add items to the basket and check out there.
- Default currency is ${config.defaultCurrency}. Be specific to Sri Lanka and keep it delightful.`

let llmClient: OpenAI | null = null
function getClient(): OpenAI {
  assertGoogleConfigured()
  if (!llmClient) {
    // Google AI Studio (Gemini) is OpenAI-compatible — reuse the OpenAI SDK
    // pointed at Google's OpenAI-compatibility base URL.
    llmClient = new OpenAI({
      apiKey: config.google.apiKey,
      baseURL: config.google.baseUrl,
      // The free Gemini tier has low RPM/TPM quotas and each turn makes several
      // calls; let the SDK ride out transient 429s with exponential backoff.
      maxRetries: 4,
    })
  }
  return llmClient
}

const MAX_ITERATIONS = 8

// After the primary model is rate-limited, prefer the fallback for a while so we
// don't waste a failing request on every turn (the free daily quota won't recover
// for hours anyway). The primary is re-probed once the cooldown lapses.
const PRIMARY_COOLDOWN_MS = 20 * 60_000
let primaryCooldownUntil = 0

// Statuses that mean "try the other model": rate limit (429) or transient
// unavailability/overload from the provider (500/502/503/529).
const FALLBACKABLE = new Set([429, 500, 502, 503, 529])

/**
 * Open a streaming chat completion, trying the primary model first and
 * automatically falling back to the lighter model when the primary is
 * rate-limited (429) or temporarily unavailable/overloaded (5xx).
 */
async function createChatStream(
  client: OpenAI,
  messages: ChatCompletionMessageParam[],
  tools: ChatCompletionTool[],
) {
  const primary = config.google.model
  const fallback = config.google.fallbackModel
  // Skip the primary while it's cooling down; otherwise try it first.
  const skipPrimary = fallback && Date.now() < primaryCooldownUntil
  const order = [...new Set([skipPrimary ? fallback : primary, fallback].filter(Boolean))] as string[]

  let lastErr: unknown
  for (let i = 0; i < order.length; i++) {
    const model = order[i]
    const isLast = i === order.length - 1
    try {
      return await client.chat.completions.create(
        { model, messages, tools, tool_choice: 'auto', stream: true },
        // Fail fast on the primary so we fall back quickly; let the last model retry.
        { maxRetries: isLast ? 3 : 0 },
      )
    } catch (err) {
      lastErr = err
      const status = (err as { status?: number })?.status ?? 0
      // Only a daily rate limit (429) warrants the long cooldown; a 5xx is
      // transient, so we fall back for this request but keep re-trying the primary.
      if (status === 429 && model === primary && fallback) {
        primaryCooldownUntil = Date.now() + PRIMARY_COOLDOWN_MS
      }
      if (FALLBACKABLE.has(status) && !isLast) {
        console.warn(`Model "${model}" unavailable (${status}) — falling back to "${order[i + 1]}".`)
        continue
      }
      throw err
    }
  }
  throw lastErr
}

/**
 * Run the KAI agent over the conversation `history`, streaming events via `emit`.
 * Resolves when the assistant has produced its final (tool-free) turn.
 */
const LANG_DIRECTIVE: Record<string, string> = {
  si: 'Reply to the user in Sinhala (සිංහල). Keep product names, prices and order numbers as-is. Tool calls and search queries stay in English.',
  ta: 'Reply to the user in Tamil (தமிழ்). Keep product names, prices and order numbers as-is. Tool calls and search queries stay in English.',
}

export async function runAgent(
  history: ChatMessage[],
  emit: (e: ChatEvent) => void,
  language?: string,
): Promise<void> {
  const client = getClient()
  const tools = await buildAgentTools()

  const langNote = language && LANG_DIRECTIVE[language] ? `\n\n${LANG_DIRECTIVE[language]}` : ''
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT + langNote },
    ...history.map((m) => ({ role: m.role, content: m.content }) as ChatCompletionMessageParam),
  ]

  // Some models (e.g. Gemini via the OpenAI-compat layer) repeat the same
  // preamble text before AND after a tool call. Buffer each turn's text and
  // emit it as one deduped block so the user never sees doubled sentences.
  const seenText = new Set<string>()
  let anyTextEmitted = false
  const flushText = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    const key = text.replace(/\s+/g, ' ')
    if (seenText.has(key)) return
    seenText.add(key)
    emit({ type: 'text', delta: (anyTextEmitted ? '\n\n' : '') + text })
    anyTextEmitted = true
  }

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    const stream = await createChatStream(client, messages, tools)

    let textBuf = ''
    const toolAcc: Record<number, { id: string; name: string; args: string }> = {}

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta
      if (!delta) continue
      if (delta.content) textBuf += delta.content
      for (const tc of delta.tool_calls ?? []) {
        const idx = tc.index ?? 0
        const acc = (toolAcc[idx] ??= { id: '', name: '', args: '' })
        if (tc.id) acc.id = tc.id
        if (tc.function?.name) acc.name += tc.function.name
        if (tc.function?.arguments) acc.args += tc.function.arguments
      }
    }

    flushText(textBuf)

    const calls = Object.values(toolAcc).filter((c) => c.name)
    if (calls.length === 0) {
      // No tool calls → this was the final answer.
      return
    }

    // Record the assistant's tool-call turn.
    const assistantToolCalls: ChatCompletionMessageToolCall[] = calls.map((c) => ({
      id: c.id,
      type: 'function',
      function: { name: c.name, arguments: c.args || '{}' },
    }))
    messages.push({
      role: 'assistant',
      content: textBuf || null,
      tool_calls: assistantToolCalls,
    })

    // Execute each tool call and feed results back.
    for (const c of calls) {
      const isUiTool = c.name === 'propose_quick_replies'
      if (!isUiTool) emit({ type: 'tool', name: c.name, status: 'start', label: friendlyToolLabel(c.name) })
      let args: Record<string, unknown> = {}
      try {
        args = c.args ? JSON.parse(c.args) : {}
      } catch {
        args = {}
      }
      try {
        const { result, products, categories, quickReplies } = await dispatchTool(c.name, args, config.defaultCurrency)
        if (products && products.length) {
          emit({ type: 'products', items: products, query: String(args.q ?? '') })
        }
        if (categories && categories.length) {
          emit({ type: 'categories', items: categories })
        }
        if (quickReplies && quickReplies.length) {
          emit({ type: 'quickReplies', items: quickReplies })
        }
        messages.push({
          role: 'tool',
          tool_call_id: c.id,
          content: JSON.stringify(result),
        })
      } catch (err) {
        messages.push({
          role: 'tool',
          tool_call_id: c.id,
          content: JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
        })
      }
      if (!isUiTool) emit({ type: 'tool', name: c.name, status: 'done', label: friendlyToolLabel(c.name) })
    }
  }

  emit({ type: 'text', delta: '\n\n(I had to stop after several steps — could you refine what you need?)' })
}
