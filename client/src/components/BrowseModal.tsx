import { useEffect, useMemo, useState } from 'react'
import type { ConciergeActions } from '../useConcierge'
import type { BrowseCat, BrowsePrice, BrowseSort, Chat, Product } from '../types'
import { apiGet, type CategoriesResponse, type SearchResponse } from '../api'
import { useT } from '../i18n'
import { useIsMobile } from '../useIsMobile'
import ProductImage from './ProductImage'
import Hov from '../Hov'
import { Close, Grid, Heart, Search, Star5 } from '../icons'

interface Props {
  chat: Chat
  query: string
  cat: BrowseCat
  price: BrowsePrice
  sort: BrowseSort
  favorites: string[]
  actions: ConciergeActions
}

const PRICE_PARAMS: Record<BrowsePrice, { min?: number; max?: number }> = {
  any: {},
  lt20: { max: 20 },
  mid: { min: 20, max: 40 },
  gt40: { min: 40 },
}

export default function BrowseModal({ chat, query, cat, price, sort, favorites, actions }: Props) {
  const t = useT()
  const isMobile = useIsMobile()
  const cartIds = new Set(chat.cart.map((x) => x.id))
  const [categories, setCategories] = useState<string[]>([])
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    apiGet<CategoriesResponse>('/api/categories')
      .then((r) => setCategories(r.categories.map((c) => c.name)))
      .catch(() => setCategories([]))
  }, [])

  const queryString = useMemo(() => {
    const p = new URLSearchParams()
    p.set('q', query.trim() || 'gifts')
    p.set('limit', '24')
    p.set('currency', 'USD')
    if (cat !== 'all') p.set('category', String(cat))
    if (sort !== 'popular') p.set('sort', sort)
    const { min, max } = PRICE_PARAMS[price]
    if (min != null) p.set('min_price', String(min))
    if (max != null) p.set('max_price', String(max))
    return p.toString()
  }, [query, cat, sort, price])

  useEffect(() => {
    let alive = true
    setLoading(true)
    const t = setTimeout(() => {
      apiGet<SearchResponse>(`/api/search?${queryString}`)
        .then((r) => { if (alive) setResults(r.items) })
        .catch(() => { if (alive) setResults([]) })
        .finally(() => { if (alive) setLoading(false) })
    }, 250)
    return () => { alive = false; clearTimeout(t) }
  }, [queryString])

  const cBg = (k: BrowseCat) => (cat === k ? 'var(--soft)' : 'transparent')
  const pBg = (k: BrowsePrice) => (price === k ? 'var(--soft)' : 'var(--surface)')

  const catRow = (k: BrowseCat, icon: React.ReactNode, label: string) => (
    <Hov key={String(k)} as="button" onClick={() => actions.setBrowseCat(k)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: cBg(k), border: 'none', borderRadius: 10, padding: '9px 10px', marginBottom: 3, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: 'var(--ink)', fontSize: 13.5, fontWeight: 600 }}
      hoverStyle={{ background: 'var(--surface-2)' }}>
      {icon}<span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </Hov>
  )

  const priceChip = (k: BrowsePrice, label: string) => (
    <button type="button" onClick={() => actions.setBrowsePrice(k)}
      style={{ flex: 'none', background: pBg(k), border: '1px solid var(--line)', color: 'var(--ink)', borderRadius: 999, padding: '7px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{label}</button>
  )

  const catChip = (k: BrowseCat, label: string) => (
    <button key={String(k)} type="button" onClick={() => actions.setBrowseCat(k)}
      style={{ flex: 'none', background: cat === k ? 'var(--primary)' : 'var(--surface-2)', border: '1px solid var(--line)', color: cat === k ? 'var(--on-primary)' : 'var(--ink)', borderRadius: 999, padding: '7px 13px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{label}</button>
  )

  return (
    <div onClick={actions.closeBrowse} className="kp-glass" style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? 0 : 28, animation: 'kpIn .2s ease both' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: isMobile ? '100vw' : 'min(1060px,96vw)', height: isMobile ? '100vh' : 'min(86vh,760px)', background: 'var(--surface)', border: isMobile ? 'none' : '1px solid var(--line)', borderRadius: isMobile ? 0 : 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, padding: isMobile ? '12px 12px' : '15px 18px', borderBottom: '1px solid var(--line-2)' }}>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grid size={18} stroke="#fff" />
              </div>
              <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.01em' }}>{t('browseTheShop')}</span>
            </div>
          )}
          <div className="kp-inputbar" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 999, padding: '9px 16px', maxWidth: isMobile ? undefined : 420, margin: isMobile ? 0 : '0 auto' }}>
            <Search size={17} stroke="var(--muted)" />
            <input value={query} className="kp-bare" onChange={(e) => actions.setBrowseQuery(e.target.value)} placeholder={t('searchPlaceholder')}
              style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: 'var(--ink)', fontFamily: 'inherit' }} />
          </div>
          <Hov as="button" onClick={actions.closeBrowse}
            style={{ flex: 'none', width: 36, height: 36, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            hoverStyle={{ background: 'var(--line-2)' }}>
            <Close size={18} />
          </Hov>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: 0 }}>
          {!isMobile && (
            <div className="kp-scroll" style={{ flex: 'none', width: 212, borderRight: '1px solid var(--line-2)', padding: '16px 12px', overflowY: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted-2)', padding: '0 8px 8px' }}>{t('categories')}</div>
              {catRow('all', <Grid size={16} stroke="var(--muted)" strokeWidth={1.7} />, t('allGifts'))}
              {categories.map((name) => catRow(name, <Grid size={16} stroke="var(--muted)" strokeWidth={1.5} />, name))}
              <div style={{ height: 1, background: 'var(--line-2)', margin: '14px 6px' }} />
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted-2)', padding: '0 8px 8px' }}>{t('priceUSD')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '0 4px' }}>
                {priceChip('any', t('pAny'))}
                {priceChip('lt20', t('pUnder20'))}
                {priceChip('mid', t('pMid'))}
                {priceChip('gt40', t('pOver40'))}
              </div>
            </div>
          )}

          {isMobile && (
            <div style={{ flex: 'none', borderBottom: '1px solid var(--line-2)', padding: '10px 0 12px' }}>
              <div className="kp-carousel" style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '0 12px 8px' }}>
                {catChip('all', t('allGifts'))}
                {categories.map((name) => catChip(name, name))}
              </div>
              <div style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '0 12px' }} className="kp-carousel">
                {priceChip('any', t('pAny'))}
                {priceChip('lt20', t('pUnder20'))}
                {priceChip('mid', t('pMid'))}
                {priceChip('gt40', t('pOver40'))}
              </div>
            </div>
          )}

          <div className="kp-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: isMobile ? '14px 12px' : '18px 20px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{loading ? t('searchingDots') : t('results', { n: results.length })}</span>
              <select value={sort} onChange={(e) => actions.setBrowseSort(e.target.value as BrowseSort)}
                style={{ border: '1px solid var(--line)', background: 'var(--surface-2)', borderRadius: 9, padding: '8px 11px', fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                <option value="popular">{t('sortPopular')}</option>
                <option value="price-asc">{t('sortPriceAsc')}</option>
                <option value="price-desc">{t('sortPriceDesc')}</option>
                <option value="rating">{t('sortRating')}</option>
              </select>
            </div>
            {results.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,minmax(0,1fr))' : 'repeat(auto-fill,minmax(184px,1fr))', gap: isMobile ? 10 : 14 }}>
                {results.map((p) => (
                  <BrowseCard key={p.id} p={p} isFav={favorites.includes(p.id)} inCart={cartIds.has(p.id)}
                    onAdd={() => actions.addToCart(p)} onFav={() => actions.toggleFav(p)} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '50px 24px', color: 'var(--muted)' }}>
                <Search size={40} stroke="var(--muted-2)" strokeWidth={1.5} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{loading ? t('searchingKapruka') : t('noMatches')}</div>
                <div style={{ fontSize: 13 }}>{t('noMatchesSub')}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BrowseCard({ p, isFav, inCart, onAdd, onFav }: { p: Product; isFav: boolean; inCart: boolean; onAdd: () => void; onFav: () => void }) {
  const meta = p.rating != null ? p.rating.toFixed(1) : null
  return (
    <div className="kp-card" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative' }}>
        <ProductImage product={p} height={108} glyphWrap={52} />
        {p.tag && (
          <div style={{ position: 'absolute', top: 9, left: 9, background: '#0F2A1F', color: '#fff', fontSize: 9.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', padding: '3px 7px', borderRadius: 999 }}>{p.tag}</div>
        )}
        <button type="button" onClick={onFav} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.16)' }}>
          {isFav
            ? <Heart size={15} fill="var(--heart)" stroke="var(--heart)" strokeWidth={1.5} />
            : <Heart size={15} stroke="#8A82A6" strokeWidth={1.8} />}
        </button>
      </div>
      <div style={{ padding: '11px 12px 13px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, minHeight: 34, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--muted)', minHeight: 15 }}>
          {meta != null && <Star5 size={12} fill="var(--star)" />}{meta}
          {p.category && <span style={{ color: 'var(--muted-2)' }}>{meta ? ' · ' : ''}{p.category}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)' }}>{p.priceText}</span>
          {p.compareAtText && <span style={{ fontSize: 11, color: 'var(--muted-2)', textDecoration: 'line-through' }}>{p.compareAtText}</span>}
        </div>
        {inCart ? (
          <div style={{ marginTop: 2, background: 'var(--soft)', color: 'var(--primary)', border: '1px solid var(--soft-border)', borderRadius: 9, padding: '8px 0', fontSize: 12.5, fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <CheckSmall />In basket
          </div>
        ) : (
          <Hov as="button" onClick={onAdd}
            style={{ marginTop: 2, background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: 9, padding: '9px 0', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}
            hoverStyle={{ background: 'var(--primary-hover)' }}>Add to basket</Hov>
        )}
      </div>
    </div>
  )
}

function CheckSmall() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
}
