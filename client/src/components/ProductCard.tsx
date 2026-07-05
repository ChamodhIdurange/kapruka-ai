import { useState } from 'react'
import type { Product } from '../types'
import { useT } from '../i18n'
import ProductImage from './ProductImage'
import Hov from '../Hov'
import { Check, Heart, Star5 } from '../icons'

interface Props {
  p: Product
  isFav: boolean
  qty: number
  onAdd: () => void
  onInc: () => void
  onDec: () => void
  onFav: () => void
}

export default function ProductCard({ p, isFav, qty, onAdd, onInc, onDec, onFav }: Props) {
  const t = useT()
  const [pop, setPop] = useState(false)
  const rating = p.rating != null ? p.rating.toFixed(1) : null
  const badge = p.tag === 'Sale' ? 'sale' : p.stockLevel === 'low' ? 'low' : null

  const fav = () => { if (!isFav) { setPop(true); setTimeout(() => setPop(false), 340) } onFav() }

  return (
    <div className="kp-card kp-snap" style={{ flex: 'none', width: 224, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative' }}>
        <ProductImage product={p} height={158} glyphWrap={62} />

        {badge === 'sale' && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 999, boxShadow: '0 2px 6px rgba(0,0,0,.2)' }}>{t('sale')}</div>
        )}
        {badge === 'low' && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(20,18,30,.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FFB020' }} />{t('lowStock')}
          </div>
        )}

        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
          {p.url && (
            <a href={p.url} target="_blank" rel="noopener noreferrer" title="View on Kapruka" className="kp-quick"
              style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.18)', color: '#6c757d' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
            </a>
          )}
          <button type="button" onClick={fav} title={isFav ? 'Remove from wishlist' : 'Save to wishlist'} className={pop ? 'kp-heart-pop' : undefined}
            style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.18)' }}>
            {isFav
              ? <Heart size={16} fill="var(--heart)" stroke="var(--heart)" strokeWidth={1.5} />
              : <Heart size={16} stroke="#6c757d" strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 13px 14px', display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, minHeight: 35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>

        {(rating || p.category) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--muted)' }}>
            {rating && (<><Star5 size={12} fill="var(--star)" /><span style={{ fontWeight: 700, color: 'var(--ink-2)' }}>{rating}</span></>)}
            {p.category && (
              <span style={{ background: 'var(--surface-2)', color: 'var(--muted)', borderRadius: 999, padding: '2px 8px', fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{p.category}</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.01em' }}>{p.priceText}</span>
          {p.compareAtText && <span style={{ fontSize: 11.5, color: 'var(--muted-2)', textDecoration: 'line-through' }}>{p.compareAtText}</span>}
        </div>

        {qty > 0 ? (
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--soft)', border: '1px solid var(--soft-border)', borderRadius: 11, padding: '4px 4px 4px 6px' }}>
            <StepBtn label="−" onClick={onDec} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)' }}>
              <Check size={13} stroke="var(--primary)" />{t('inBasketQty', { n: qty })}
            </span>
            <StepBtn label="+" onClick={onInc} />
          </div>
        ) : (
          <Hov as="button" onClick={onAdd}
            style={{ marginTop: 4, background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: 11, padding: '10px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}
            hoverStyle={{ background: 'var(--primary-hover)' }}>
            {t('addToBasket')}
          </Hov>
        )}
      </div>
    </div>
  )
}

function StepBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Hov as="button" onClick={onClick}
      style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'var(--surface)', color: 'var(--ink)', cursor: 'pointer', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', lineHeight: 1 }}
      hoverStyle={{ background: 'var(--surface-2)' }}>
      {label}
    </Hov>
  )
}
