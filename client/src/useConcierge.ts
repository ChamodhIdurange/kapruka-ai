import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { apiPost, streamChat, type CheckDeliveryResponse, type OrderResponse, type TrackResponse } from './api'
import { deliveryDateISO, pricing } from './derive'
import { tr } from './i18n'
import type {
  ActionKey, Chat, ChatMessage, Lang, Message, OrderInfo, Product, Tab, Theme,
  BrowseCat, BrowsePrice, BrowseSort,
} from './types'

interface RootState {
  chats: Record<string, Chat>
  chatOrder: string[]
  activeId: string
  favorites: string[]
  savedMap: Record<string, Product>
  activeTab: Tab
  draft: string
  sidebarExpanded: boolean
  cartOpen: boolean
  theme: Theme
  lang: Lang
  toast: string
  browseOpen: boolean
  browseCat: BrowseCat
  browseSort: BrowseSort
  browsePrice: BrowsePrice
  browseQuery: string
  editingId: string | null
  editTitle: string
}

function makeCounter(start: number) {
  let n = start
  return { uid: (p = 'm') => p + ++n, value: () => n }
}

const STARTER_SUGGESTIONS: Chat['suggestions'] = []

function makeChat(over: Partial<Chat>, uid: (p?: string) => string): Chat {
  return {
    id: uid('c'),
    title: 'New gift',
    started: false,
    tone: 0,
    messages: [],
    suggestions: STARTER_SUGGESTIONS,
    typing: false,
    step: 'welcome',
    quickReplies: [],
    cart: [],
    checkoutStep: null,
    giftTo: '', giftFrom: '', giftText: '', giftCard: 'floral',
    dlName: '', dlPhone: '', dlAddr: '', dlCity: '', dlDate: 'tomorrow', dlSlot: 'afternoon',
    dlCheck: null,
    payMethod: 'card', order: null, placing: false, giftWrap: false,
    track: null, trackQuery: '', trackError: null,
    ...over,
  }
}

export function useConcierge() {
  const init = useRef<{ state: RootState; start: number } | null>(null)
  if (!init.current) {
    const ctr = makeCounter(100)
    const first = makeChat({ title: 'New gift' }, ctr.uid)
    // On phones the sidebar + basket are overlays, so they start closed.
    const isMobileInit = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
    init.current = {
      start: ctr.value(),
      state: {
        chats: { [first.id]: first },
        chatOrder: [first.id],
        activeId: first.id,
        favorites: [],
        savedMap: {},
        activeTab: 'basket',
        draft: '',
        sidebarExpanded: !isMobileInit,
        cartOpen: !isMobileInit,
        theme: 'light',
        lang: 'en',
        toast: '',
        browseOpen: false,
        browseCat: 'all',
        browseSort: 'popular',
        browsePrice: 'any',
        browseQuery: '',
        editingId: null,
        editTitle: '',
      },
    }
  }

  const [state, setState] = useState<RootState>(init.current.state)
  const counter = useRef(makeCounter(init.current.start))
  const stateRef = useRef(state)
  stateRef.current = state
  const tToast = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const messagesRef = useRef<HTMLDivElement>(null)

  const uid = useCallback((p?: string) => counter.current.uid(p), [])

  const patch = useCallback((id: string, partial: Partial<Chat>) => {
    setState((s) => {
      const c = s.chats[id]
      if (!c) return s
      return { ...s, chats: { ...s.chats, [id]: { ...c, ...partial } } }
    })
  }, [])

  const patchFn = useCallback((id: string, fn: (c: Chat) => Partial<Chat>) => {
    setState((s) => {
      const c = s.chats[id]
      if (!c) return s
      return { ...s, chats: { ...s.chats, [id]: { ...c, ...fn(c) } } }
    })
  }, [])

  const pushMsg = useCallback((id: string, msg: Omit<Message, 'id'>): string => {
    const mid = uid()
    patchFn(id, (c) => ({ messages: [...c.messages, { id: mid, ...msg }], started: true }))
    return mid
  }, [patchFn, uid])

  const updateMsg = useCallback((id: string, mid: string, fn: (m: Message) => Message) => {
    patchFn(id, (c) => ({ messages: c.messages.map((m) => (m.id === mid ? fn(m) : m)) }))
  }, [patchFn])

  const toast = useCallback((t: string) => {
    setState((s) => ({ ...s, toast: t }))
    clearTimeout(tToast.current)
    tToast.current = setTimeout(() => setState((s) => ({ ...s, toast: '' })), 2200)
  }, [])

  const maybeTitle = useCallback((id: string, text: string) => {
    const c = stateRef.current.chats[id]
    if (c && (c.title === 'New gift' || c.title === 'New chat')) {
      patch(id, { title: text.length > 26 ? text.slice(0, 26) + '…' : text })
    }
  }, [patch])

  /* ── chat management ── */
  const newChat = useCallback(() => {
    setState((s) => {
      const chat = makeChat({ title: 'New gift', tone: s.chatOrder.length % 4 }, uid)
      return { ...s, chats: { ...s.chats, [chat.id]: chat }, chatOrder: [chat.id, ...s.chatOrder], activeId: chat.id, draft: '' }
    })
  }, [uid])
  const selectChat = useCallback((id: string) => setState((s) => ({ ...s, activeId: id, draft: '' })), [])
  const expandSidebar = useCallback(() => setState((s) => ({ ...s, sidebarExpanded: true })), [])
  const collapseSidebar = useCallback(() => setState((s) => ({ ...s, sidebarExpanded: false })), [])
  const toggleCart = useCallback(() => setState((s) => ({ ...s, cartOpen: !s.cartOpen })), [])
  const toggleTheme = useCallback(() => setState((s) => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' })), [])
  const setLang = useCallback((l: Lang) => setState((s) => ({ ...s, lang: l })), [])
  const openBrowse = useCallback(() => setState((s) => ({ ...s, browseOpen: true })), [])
  const openCategory = useCallback((name: string) => setState((s) => ({ ...s, browseOpen: true, browseCat: name, browseQuery: '', browsePrice: 'any', browseSort: 'popular' })), [])
  const closeBrowse = useCallback(() => setState((s) => ({ ...s, browseOpen: false })), [])
  const setBrowseCat = useCallback((k: BrowseCat) => setState((s) => ({ ...s, browseCat: k })), [])
  const setBrowsePrice = useCallback((k: BrowsePrice) => setState((s) => ({ ...s, browsePrice: k })), [])
  const setBrowseSort = useCallback((k: BrowseSort) => setState((s) => ({ ...s, browseSort: k })), [])
  const setBrowseQuery = useCallback((v: string) => setState((s) => ({ ...s, browseQuery: v })), [])
  const setActiveTab = useCallback((t: Tab) => setState((s) => ({ ...s, activeTab: t })), [])
  const setDraft = useCallback((v: string) => setState((s) => ({ ...s, draft: v })), [])

  const startRename = useCallback((id: string) => {
    const c = stateRef.current.chats[id]
    setState((s) => ({ ...s, editingId: id, editTitle: c ? c.title : '' }))
  }, [])
  const onEditTitle = useCallback((v: string) => setState((s) => ({ ...s, editTitle: v })), [])
  const commitRename = useCallback(() => {
    const id = stateRef.current.editingId
    if (!id) return
    const t = (stateRef.current.editTitle || '').trim()
    if (t) patch(id, { title: t.length > 26 ? t.slice(0, 26) + '…' : t })
    setState((s) => ({ ...s, editingId: null }))
  }, [patch])
  const cancelRename = useCallback(() => setState((s) => ({ ...s, editingId: null })), [])

  const deleteChat = useCallback((id: string) => {
    setState((s) => {
      const order = s.chatOrder.filter((x) => x !== id)
      const chats = { ...s.chats }
      delete chats[id]
      let activeId = s.activeId
      if (activeId === id) activeId = order[0] || ''
      if (!activeId) {
        const nc = makeChat({ title: 'New gift' }, uid)
        chats[nc.id] = nc
        order.unshift(nc.id)
        activeId = nc.id
      }
      return { ...s, chats, chatOrder: order, activeId, editingId: s.editingId === id ? null : s.editingId }
    })
    toast(tr(stateRef.current.lang, 'toastChatDeleted'))
  }, [toast, uid])

  /* ── chat send / stream ── */
  const send = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const id = stateRef.current.activeId

    pushMsg(id, { role: 'user', kind: 'text', text: trimmed })
    maybeTitle(id, trimmed)

    // History from committed messages + this user turn (placeholder excluded).
    const prior = stateRef.current.chats[id]?.messages ?? []
    const history: ChatMessage[] = [
      ...prior
        .filter((m) => (m.kind === 'text' || m.kind === 'products') && (m.text ?? '').trim())
        .map((m) => ({ role: m.role, content: m.text ?? '' }) as ChatMessage),
      { role: 'user', content: trimmed },
    ]

    // Show the "thinking" dots; create the assistant bubble lazily only when the
    // first content arrives (so we never render an empty bubble + dots together).
    patch(id, { typing: true, suggestions: [], quickReplies: [] })
    let asstId: string | null = null
    let buf = ''
    const ensureBubble = () => {
      if (!asstId) {
        asstId = pushMsg(id, { role: 'assistant', kind: 'text', text: buf, streaming: true })
        patch(id, { typing: false })
      }
    }

    streamChat(history, stateRef.current.lang, (e) => {
      if (e.type === 'text') {
        buf += e.delta
        if (!asstId) ensureBubble()
        else updateMsg(id, asstId, (m) => ({ ...m, text: buf }))
      } else if (e.type === 'products') {
        patch(id, { typing: false, quickReplies: [] })
        pushMsg(id, { role: 'assistant', kind: 'products', text: '', label: 'Picked for you', products: e.items })
        patch(id, { step: 'recommend' })
      } else if (e.type === 'categories') {
        patch(id, { typing: false })
        pushMsg(id, { role: 'assistant', kind: 'categories', text: '', categories: e.items })
      } else if (e.type === 'quickReplies') {
        patch(id, { quickReplies: e.items })
      } else if (e.type === 'error') {
        buf += `${buf ? '\n\n' : ''}⚠️ ${e.message}`
        ensureBubble()
        updateMsg(id, asstId!, (m) => ({ ...m, text: buf, streaming: false }))
      }
    })
      .catch((err) => {
        buf = buf || `⚠️ ${err instanceof Error ? err.message : 'Something went wrong.'}`
        ensureBubble()
        updateMsg(id, asstId!, (m) => ({ ...m, text: buf, streaming: false }))
      })
      .finally(() => {
        if (asstId) updateMsg(id, asstId, (m) => ({ ...m, streaming: false }))
        const cartLen = stateRef.current.chats[id]?.cart.length ?? 0
        patch(id, {
          typing: false,
          suggestions: cartLen > 0
            ? [{ label: 'Add a gift card', action: 'open-composer' }, { label: 'Proceed to checkout', action: 'checkout' }]
            : [],
        })
      })
  }, [pushMsg, maybeTitle, patch, updateMsg])

  const heroSend = useCallback((text: string) => send(text), [send])
  const onSend = useCallback(() => {
    const t = stateRef.current.draft
    if (!t.trim()) return
    setState((s) => ({ ...s, draft: '' }))
    send(t)
  }, [send])

  /* ── cart + favourites ── */
  const addToCart = useCallback((p: Product) => {
    const id = stateRef.current.activeId
    patchFn(id, (c) => {
      const ex = c.cart.find((x) => x.productId === p.id)
      const cart = ex
        ? c.cart.map((x) => (x.productId === p.id ? { ...x, qty: x.qty + 1 } : x))
        : [...c.cart, {
            id: p.id, productId: p.id, name: p.name,
            priceAmount: p.priceAmount ?? 0, currency: p.currency, priceText: p.priceText,
            imageUrl: p.imageUrl, cat: p.cat, qty: 1,
          }]
      return { cart }
    })
    setState((s) => ({ ...s, cartOpen: true }))
    toast(tr(stateRef.current.lang, 'toastAdded', { name: p.name }))
  }, [patchFn, toast])

  const toggleFav = useCallback((p: Product) => {
    const lang = stateRef.current.lang
    setState((s) => {
      const has = s.favorites.includes(p.id)
      const favorites = has ? s.favorites.filter((f) => f !== p.id) : [...s.favorites, p.id]
      const savedMap = { ...s.savedMap, [p.id]: p }
      return { ...s, favorites, savedMap }
    })
    toast(stateRef.current.favorites.includes(p.id) ? tr(lang, 'toastRemovedWish') : tr(lang, 'toastSaved'))
  }, [toast])

  const changeQty = useCallback((pid: string, d: number) => {
    const id = stateRef.current.activeId
    patchFn(id, (c) => ({ cart: c.cart.map((x) => (x.id === pid ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0) }))
  }, [patchFn])
  const removeItem = useCallback((pid: string) => {
    const id = stateRef.current.activeId
    patchFn(id, (c) => ({ cart: c.cart.filter((x) => x.id !== pid) }))
    toast(tr(stateRef.current.lang, 'toastRemovedBasket'))
  }, [patchFn, toast])
  const toggleGiftWrap = useCallback(() => {
    const id = stateRef.current.activeId
    patchFn(id, (c) => ({ giftWrap: !c.giftWrap }))
  }, [patchFn])

  /* ── checkout wizard ── */
  const openCheckout = useCallback((step: 'gift' | 'delivery' | 'review') => {
    const id = stateRef.current.activeId
    const c = stateRef.current.chats[id]
    if (!c || c.cart.length === 0) {
      toast(tr(stateRef.current.lang, 'toastBasketEmpty'))
      return
    }
    patch(id, { checkoutStep: step })
  }, [patch, toast])
  const closeCheckout = useCallback(() => {
    const id = stateRef.current.activeId
    patch(id, { checkoutStep: null })
  }, [patch])
  const goCheckoutStep = useCallback((step: 'gift' | 'delivery' | 'review') => {
    const id = stateRef.current.activeId
    patch(id, { checkoutStep: step })
  }, [patch])

  const act = useCallback((a: ActionKey) => {
    if (a === 'checkout') openCheckout('delivery')
    else if (a === 'open-composer') openCheckout('gift')
    else if (a === 'browse-best') setState((s) => ({ ...s, browseOpen: true }))
  }, [openCheckout])

  // Gift step → advance to delivery (clearing the message when skipped).
  const finishCard = useCallback((keep: boolean) => {
    const id = stateRef.current.activeId
    patch(id, keep ? { checkoutStep: 'delivery' } : { giftText: '', giftTo: '', checkoutStep: 'delivery' })
  }, [patch])

  const checkDelivery = useCallback(async () => {
    const id = stateRef.current.activeId
    const c = stateRef.current.chats[id]
    if (!c || !c.dlCity.trim()) return
    try {
      const r = await apiPost<CheckDeliveryResponse>('/api/check-delivery', {
        city: c.dlCity.trim(),
        delivery_date: deliveryDateISO(c.dlDate),
        product_id: c.cart[0]?.productId,
      })
      patch(id, { dlCheck: { available: r.available, rateText: r.rateText, nextAvailableDate: r.nextAvailableDate, warning: r.warning } })
    } catch {
      patch(id, { dlCheck: null })
    }
  }, [patch])

  const submitDelivery = useCallback(() => {
    const id = stateRef.current.activeId
    patch(id, { checkoutStep: 'review' })
  }, [patch])

  const placeOrder = useCallback(async () => {
    const id = stateRef.current.activeId
    const c = stateRef.current.chats[id]
    if (!c || c.cart.length === 0) return
    patch(id, { placing: true })
    try {
      const payload = {
        cart: c.cart.map((x) => ({ product_id: x.productId, quantity: x.qty })),
        recipient: { name: c.dlName.trim() || 'Recipient', phone: c.dlPhone.trim() || '+94770000000' },
        delivery: {
          address: c.dlAddr.trim() || 'N/A',
          city: c.dlCity.trim() || 'Colombo 03',
          date: deliveryDateISO(c.dlDate),
          location_type: 'house',
        },
        sender: { name: c.giftFrom.trim() || 'A friend' },
        gift_message: c.giftText.trim() || undefined,
        currency: c.cart[0]?.currency ?? 'USD',
      }
      const r = await apiPost<OrderResponse>('/api/order', payload)
      const { totalText, itemsCount } = pricing(c.cart)
      const order: OrderInfo = {
        orderRef: r.orderRef,
        payUrl: r.payUrl,
        recipientName: c.dlName.trim() || 'Recipient',
        etaText: deliveryDateISO(c.dlDate),
        itemsCount,
        totalText: r.totalText ?? totalText,
      }
      pushMsg(id, { role: 'assistant', kind: 'confirmation', text: r.message ?? 'Your order is ready for payment.', order })
      patch(id, { order, checkoutStep: 'done', step: 'done', placing: false, cart: [], suggestions: [] })
      setState((s) => ({ ...s, cartOpen: true }))
    } catch (err) {
      patch(id, { placing: false })
      toast(err instanceof Error ? err.message : 'Could not place order')
    }
  }, [patch, pushMsg, toast])

  /* ── tracking ── */
  const setTrackQuery = useCallback((v: string) => {
    const id = stateRef.current.activeId
    patch(id, { trackQuery: v })
  }, [patch])
  const trackOrder = useCallback(async () => {
    const id = stateRef.current.activeId
    const c = stateRef.current.chats[id]
    const q = (c?.trackQuery ?? '').trim()
    if (!q) return
    patch(id, { trackError: null })
    try {
      const r = await apiPost<TrackResponse>('/api/track', { order_number: q })
      patch(id, { track: r, trackError: null })
    } catch (err) {
      patch(id, { track: null, trackError: err instanceof Error ? err.message : 'Lookup failed' })
    }
  }, [patch])

  const active = state.chats[state.activeId]
  useEffect(() => {
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [active?.messages, active?.typing, active?.checkoutStep, state.activeId])

  useEffect(() => () => clearTimeout(tToast.current), [])

  const actions = useMemo(() => ({
    newChat, selectChat, expandSidebar, collapseSidebar, toggleCart, toggleTheme,
    setLang, openBrowse, openCategory, closeBrowse, setBrowseCat, setBrowsePrice, setBrowseSort,
    setBrowseQuery, setActiveTab, setDraft, startRename, onEditTitle, commitRename,
    cancelRename, deleteChat, act, heroSend, onSend, addToCart, toggleFav, changeQty,
    removeItem, toggleGiftWrap, finishCard, submitDelivery, placeOrder, patch,
    checkDelivery, setTrackQuery, trackOrder, openCheckout, closeCheckout, goCheckoutStep,
  }), [
    newChat, selectChat, expandSidebar, collapseSidebar, toggleCart, toggleTheme,
    setLang, openBrowse, openCategory, closeBrowse, setBrowseCat, setBrowsePrice, setBrowseSort,
    setBrowseQuery, setActiveTab, setDraft, startRename, onEditTitle, commitRename,
    cancelRename, deleteChat, act, heroSend, onSend, addToCart, toggleFav, changeQty,
    removeItem, toggleGiftWrap, finishCard, submitDelivery, placeOrder, patch,
    checkDelivery, setTrackQuery, trackOrder, openCheckout, closeCheckout, goCheckoutStep,
  ])

  return { state, actions, messagesRef: messagesRef as React.RefObject<HTMLDivElement> }
}

export type ConciergeActions = ReturnType<typeof useConcierge>['actions']
