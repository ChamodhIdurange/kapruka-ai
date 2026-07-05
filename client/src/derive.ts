import type { CartItem, Chat } from './types'

const PREFIX: Record<string, string> = {
  USD: 'US$', LKR: 'Rs', GBP: '£', EUR: '€', AUD: 'A$', CAD: 'C$',
}

/** Format an amount in a currency the same way the server does. */
export function formatPrice(amount: number, currency: string): string {
  const p = PREFIX[currency.toUpperCase()] ?? currency.toUpperCase() + ' '
  const n = currency.toUpperCase() === 'LKR'
    ? Math.round(amount).toLocaleString('en-US')
    : amount.toFixed(2)
  return `${p} ${n}`.trim()
}

export interface Pricing {
  subtotal: number
  currency: string
  total: number
  totalText: string
  itemsCount: number
}

/** Basket pricing. Prices are summed in the items' own currency (the agent and
 *  search both use the default display currency, so this is consistent). Live
 *  delivery cost is shown separately from the check-delivery call. */
export function pricing(cart: CartItem[]): Pricing {
  const currency = cart[0]?.currency ?? 'USD'
  const subtotal = cart.reduce((acc, x) => acc + (x.priceAmount || 0) * x.qty, 0)
  const itemsCount = cart.reduce((acc, x) => acc + x.qty, 0)
  return { subtotal, currency, total: subtotal, totalText: formatPrice(subtotal, currency), itemsCount }
}

/** Sidebar sub-label for a chat. */
export function chatStatus(ch: Chat): string {
  if (ch.step === 'done') return 'Order placed'
  const n = ch.cart.reduce((acc, x) => acc + x.qty, 0)
  if (n > 0) return n + (n === 1 ? ' item' : ' items') + ' in basket'
  return ch.started ? 'In progress' : 'New chat'
}

/** Convert a relative delivery choice to an ISO date (Asia/Colombo-ish, local). */
export function deliveryDateISO(choice: 'today' | 'tomorrow' | 'weekend'): string {
  const d = new Date()
  if (choice === 'tomorrow') d.setDate(d.getDate() + 1)
  else if (choice === 'weekend') {
    // next Saturday (or today if already Saturday)
    const day = d.getDay()
    const add = (6 - day + 7) % 7
    d.setDate(d.getDate() + (add === 0 ? 0 : add))
  }
  return d.toISOString().slice(0, 10)
}

export const TRACK_STAGES = [
  { label: 'Order confirmed', note: 'We’ve received your order' },
  { label: 'Preparing your gift', note: 'Freshly made & gift-wrapped' },
  { label: 'Out for delivery', note: 'On the way with our courier' },
  { label: 'Delivered', note: 'Handed to the recipient' },
]
