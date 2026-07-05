/** Normalised product shown to both the LLM and the client UI. */
export interface ProductVM {
  id: string
  name: string
  summary: string
  priceAmount: number | null
  currency: string
  priceText: string
  compareAtText: string | null
  imageUrl: string | null
  url: string | null
  inStock: boolean
  stockLevel: string | null
  rating: number | null
  category: string | null
  /** Inferred coarse category for the UI glyph fallback. */
  cat: 'cake' | 'flower' | 'choc' | 'hamper' | null
  tag: string | null
}

export interface CategoryVM {
  name: string
  url: string | null
}

export interface DeliveryCityVM {
  name: string
  aliases?: string[]
}

export interface CheckDeliveryVM {
  available: boolean
  rateText: string | null
  rateLkr: number | null
  nextAvailableDate: string | null
  warning: string | null
  raw?: unknown
}

export interface OrderResultVM {
  orderRef: string | null
  payUrl: string | null
  totalText: string | null
  currency: string | null
  message: string | null
  raw?: unknown
}

export interface TrackStageVM {
  label: string
  note: string | null
  timestamp: string | null
  done: boolean
}

export interface TrackOrderVM {
  orderNumber: string
  status: string | null
  recipient: string | null
  eta: string | null
  itemsCount: number | null
  stages: TrackStageVM[]
  raw?: unknown
}

/** Server-sent events emitted by POST /api/chat. */
export type ChatEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool'; name: string; status: 'start' | 'done'; label: string }
  | { type: 'products'; items: ProductVM[]; query?: string }
  | { type: 'categories'; items: CategoryVM[] }
  | { type: 'quickReplies'; items: string[] }
  | { type: 'done' }
  | { type: 'error'; message: string }

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
