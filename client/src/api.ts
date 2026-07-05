import type { ChatEvent, ChatMessage, Lang, Product } from './types'

const BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:8787').replace(/\/$/, '')

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `POST ${path} failed: ${res.status}`
    try {
      const j = await res.json()
      if (j?.error) msg = j.error
    } catch { /* ignore */ }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export interface SearchResponse { items: Product[]; nextCursor: string | null }
export interface CategoriesResponse { categories: { name: string; url: string | null }[] }
export interface CitiesResponse { cities: { name: string; aliases?: string[] }[] }
export interface CheckDeliveryResponse {
  available: boolean
  rateText: string | null
  rateLkr: number | null
  nextAvailableDate: string | null
  warning: string | null
}
export interface OrderResponse {
  orderRef: string | null
  payUrl: string | null
  totalText: string | null
  currency: string | null
  message: string | null
}
export interface TrackResponse {
  orderNumber: string
  status: string | null
  recipient: string | null
  eta: string | null
  itemsCount: number | null
  stages: { label: string; note: string | null; timestamp: string | null; done: boolean }[]
}

/** Stream the KAI agent reply. Calls `onEvent` for each SSE event; resolves on done/error. */
export async function streamChat(
  messages: ChatMessage[],
  lang: Lang,
  onEvent: (e: ChatEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, language: lang }),
    signal,
  })
  if (!res.ok || !res.body) {
    throw new Error(`Chat request failed: ${res.status}`)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''
    for (const part of parts) {
      const line = part.split('\n').find((l) => l.startsWith('data: '))
      if (!line) continue
      try {
        onEvent(JSON.parse(line.slice(6)) as ChatEvent)
      } catch { /* ignore malformed frame */ }
    }
  }
}
