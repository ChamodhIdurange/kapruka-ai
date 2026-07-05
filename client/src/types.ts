export type Category = 'cake' | 'flower' | 'choc' | 'hamper'

/** A product as served by the backend (mapped from the Kapruka MCP). */
export interface Product {
  id: string
  name: string
  summary: string
  priceAmount: number | null
  currency: string
  priceText: string
  compareAtText?: string | null
  imageUrl: string | null
  url: string | null
  inStock: boolean
  stockLevel: string | null
  rating: number | null
  category: string | null
  /** Coarse category for the glyph fallback when no image. */
  cat: Category | null
  tag: string | null
}

export type MessageRole = 'user' | 'assistant'
export type MessageKind = 'text' | 'products' | 'categories' | 'confirmation'

export interface CategoryChip {
  name: string
  url: string | null
}

export interface OrderInfo {
  orderRef: string | null
  payUrl: string | null
  recipientName: string
  etaText: string
  itemsCount: number
  totalText: string
}

export interface Message {
  id: string
  role: MessageRole
  kind: MessageKind
  text?: string
  label?: string
  products?: Product[]
  categories?: CategoryChip[]
  order?: OrderInfo
  streaming?: boolean
}

export interface Suggestion {
  label: string
  action: ActionKey
}

export interface CartItem {
  id: string
  productId: string
  name: string
  priceAmount: number
  currency: string
  priceText: string
  imageUrl: string | null
  cat: Category | null
  qty: number
}

export type ChatStep =
  | 'welcome' | 'recommend' | 'compose' | 'delivery' | 'review' | 'done'

/** Step in the checkout wizard modal (null = modal closed). */
export type CheckoutStep = 'gift' | 'delivery' | 'review' | 'done'
export type GiftCard = 'classic' | 'floral' | 'modern'
export type DeliveryDate = 'today' | 'tomorrow' | 'weekend'
export type DeliverySlot = 'morning' | 'afternoon' | 'evening'
export type PayMethod = 'card' | 'cod' | 'wallet'

export interface DeliveryCheck {
  available: boolean
  rateText: string | null
  nextAvailableDate: string | null
  warning: string | null
}

export interface TrackStage {
  label: string
  note: string | null
  timestamp: string | null
  done: boolean
}

export interface TrackInfo {
  orderNumber: string
  status: string | null
  recipient: string | null
  eta: string | null
  itemsCount: number | null
  stages: TrackStage[]
}

export interface Chat {
  id: string
  title: string
  started: boolean
  tone: number
  messages: Message[]
  suggestions: Suggestion[]
  typing: boolean
  step: ChatStep
  quickReplies: string[]
  cart: CartItem[]
  checkoutStep: CheckoutStep | null
  giftTo: string
  giftFrom: string
  giftText: string
  giftCard: GiftCard
  dlName: string
  dlPhone: string
  dlAddr: string
  dlCity: string
  dlDate: DeliveryDate
  dlSlot: DeliverySlot
  dlCheck: DeliveryCheck | null
  payMethod: PayMethod
  order: OrderInfo | null
  placing: boolean
  giftWrap: boolean
  track: TrackInfo | null
  trackQuery: string
  trackError: string | null
}

export type ActionKey = 'checkout' | 'open-composer' | 'browse-best'

export type Lang = 'en' | 'si' | 'ta'
export type Theme = 'light' | 'dark'
export type Tab = 'basket' | 'saved'
export type BrowseCat = 'all' | Category | string
export type BrowseSort = 'popular' | 'price-asc' | 'price-desc' | 'rating'
export type BrowsePrice = 'any' | 'lt20' | 'mid' | 'gt40'

/* ── Chat streaming protocol (mirrors the server) ── */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
export type ChatEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool'; name: string; status: 'start' | 'done'; label: string }
  | { type: 'products'; items: Product[]; query?: string }
  | { type: 'categories'; items: CategoryChip[] }
  | { type: 'quickReplies'; items: string[] }
  | { type: 'done' }
  | { type: 'error'; message: string }
