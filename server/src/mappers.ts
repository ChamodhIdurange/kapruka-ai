import type {
  CategoryVM, CheckDeliveryVM, DeliveryCityVM, OrderResultVM,
  ProductVM, TrackOrderVM, TrackStageVM,
} from './types.js'

const CURRENCY_PREFIX: Record<string, string> = {
  USD: 'US$', LKR: 'Rs', GBP: '£', EUR: '€', AUD: 'A$', CAD: 'C$',
}

export function formatPrice(amount: number | null | undefined, currency: string): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return ''
  const prefix = CURRENCY_PREFIX[currency.toUpperCase()] ?? currency.toUpperCase() + ' '
  const n = currency.toUpperCase() === 'LKR'
    ? Math.round(amount).toLocaleString('en-US')
    : amount.toFixed(2)
  return `${prefix} ${n}`.trim()
}

function inferCat(name: string, category: string | null): ProductVM['cat'] {
  const hay = `${name} ${category ?? ''}`.toLowerCase()
  if (/\bcake|gateau|gateaux\b/.test(hay)) return 'cake'
  if (/\bflower|rose|bouquet|lily|orchid|bloom|carnation\b/.test(hay)) return 'flower'
  if (/\bchocolate|choc|ferrero|lindt|toblerone|praline\b/.test(hay)) return 'choc'
  if (/\bhamper|basket|gift set|combo|pamper\b/.test(hay)) return 'hamper'
  return null
}

interface RawProduct {
  id?: string
  name?: string
  summary?: string
  price?: { amount?: number; currency?: string }
  compare_at_price?: { amount?: number; currency?: string } | null
  in_stock?: boolean
  stock_level?: string | null
  image_url?: string | null
  category?: { id?: string; name?: string; slug?: string } | null
  rating?: number | null
  url?: string | null
}

export function mapProduct(p: RawProduct, fallbackCurrency: string): ProductVM {
  const currency = p.price?.currency ?? fallbackCurrency
  const amount = typeof p.price?.amount === 'number' ? p.price.amount : null
  const categoryName = p.category?.name ?? null
  const name = p.name ?? 'Untitled gift'
  const compareAmount = typeof p.compare_at_price?.amount === 'number' ? p.compare_at_price.amount : null

  let tag: string | null = null
  if (compareAmount && amount && compareAmount > amount) tag = 'Sale'
  else if (p.stock_level === 'low') tag = 'Low stock'

  return {
    id: p.id ?? '',
    name,
    summary: (p.summary ?? '').trim(),
    priceAmount: amount,
    currency,
    priceText: formatPrice(amount, currency),
    compareAtText: compareAmount ? formatPrice(compareAmount, p.compare_at_price?.currency ?? currency) : null,
    imageUrl: p.image_url ?? null,
    url: p.url ?? null,
    inStock: p.in_stock !== false,
    stockLevel: p.stock_level ?? null,
    rating: typeof p.rating === 'number' ? p.rating : null,
    category: categoryName,
    cat: inferCat(name, categoryName),
    tag,
  }
}

/** Pull a products array out of whatever shape a search/get_product call returned. */
export function extractProducts(raw: unknown, fallbackCurrency: string): ProductVM[] {
  if (!raw || typeof raw !== 'object') return []
  const obj = raw as Record<string, unknown>
  let list: unknown =
    obj.results ?? obj.products ?? obj.items ?? (Array.isArray(raw) ? raw : null)
  // get_product returns a single product object
  if (!list && (obj.id || obj.name)) list = [obj]
  if (!Array.isArray(list)) return []
  return list.map((p) => mapProduct(p as RawProduct, fallbackCurrency)).filter((p) => p.id || p.name)
}

export function extractNextCursor(raw: unknown): string | null {
  if (raw && typeof raw === 'object') {
    const c = (raw as Record<string, unknown>).next_cursor
    if (typeof c === 'string' && c) return c
  }
  return null
}

export function mapCategories(raw: unknown): CategoryVM[] {
  const list = (raw as { categories?: unknown })?.categories
  if (!Array.isArray(list)) return []
  return list.map((c) => {
    const o = c as Record<string, unknown>
    return { name: String(o.name ?? ''), url: (o.url as string) ?? null }
  }).filter((c) => c.name)
}

export function mapCities(raw: unknown): DeliveryCityVM[] {
  if (!raw || typeof raw !== 'object') return []
  const obj = raw as Record<string, unknown>
  const list = (obj.cities ?? obj.results ?? (Array.isArray(raw) ? raw : null)) as unknown
  if (!Array.isArray(list)) return []
  return list
    .map((c): DeliveryCityVM | null => {
      if (typeof c === 'string') return { name: c }
      const o = c as Record<string, unknown>
      const name = (o.name ?? o.city ?? o.canonical_name) as string | undefined
      if (!name) return null
      const aliases = Array.isArray(o.aliases) ? (o.aliases as string[]) : undefined
      return { name, aliases }
    })
    .filter((c): c is DeliveryCityVM => c !== null)
}

function num(...vals: unknown[]): number | null {
  for (const v of vals) if (typeof v === 'number' && !Number.isNaN(v)) return v
  return null
}
function str(...vals: unknown[]): string | null {
  for (const v of vals) if (typeof v === 'string' && v.trim()) return v.trim()
  return null
}

export function mapCheckDelivery(raw: unknown): CheckDeliveryVM {
  const o = (raw ?? {}) as Record<string, any>
  const rateLkr = num(o.rate, o.rate_lkr, o.delivery_rate, o.delivery_fee, o.fee, o.amount)
  const available = o.available ?? o.is_available ?? o.deliverable
  return {
    available: available !== false,
    rateLkr,
    rateText: rateLkr !== null ? formatPrice(rateLkr, 'LKR') : str(o.rate_text, o.rate_formatted),
    nextAvailableDate: str(o.next_available_date, o.next_date, o.earliest_date),
    warning: str(o.perishable_warning, o.warning, o.freshness_warning, o.reason, o.note, o.message),
    raw,
  }
}

export function mapOrderResult(raw: unknown): OrderResultVM {
  const o = (raw ?? {}) as Record<string, any>
  return {
    orderRef: str(o.order_ref, o.order_reference, o.ref, o.reference, o.id, o.order_id),
    payUrl: str(o.pay_url, o.payment_url, o.checkout_url, o.url, o.pay_link, o.link),
    totalText: str(o.total_text, o.total_formatted) ?? (num(o.total, o.total_amount) !== null ? formatPrice(num(o.total, o.total_amount), str(o.currency) ?? 'LKR') : null),
    currency: str(o.currency),
    message: str(o.message, o.note, o.status_message),
    raw,
  }
}

export function mapTrackOrder(raw: unknown, orderNumber: string): TrackOrderVM {
  const o = (raw ?? {}) as Record<string, any>
  const rawStages: unknown = o.timeline ?? o.progress ?? o.stages ?? o.history ?? []
  const stages: TrackStageVM[] = Array.isArray(rawStages)
    ? rawStages.map((s): TrackStageVM => {
        const st = s as Record<string, any>
        return {
          label: str(st.label, st.status, st.stage, st.name) ?? 'Update',
          note: str(st.note, st.description, st.detail),
          timestamp: str(st.timestamp, st.time, st.date, st.at),
          done: st.done ?? st.completed ?? (st.timestamp != null),
        }
      })
    : []
  const recipient = o.recipient ?? o.delivery?.recipient ?? {}
  return {
    orderNumber,
    status: str(o.status, o.state),
    recipient: str(recipient?.name, o.recipient_name, recipient),
    eta: str(o.eta, o.estimated_delivery, o.delivery_date, o.arrives),
    itemsCount: num(o.items_count, o.item_count, Array.isArray(o.items) ? o.items.length : undefined),
    stages,
    raw,
  }
}
