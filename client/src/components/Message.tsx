import type { ConciergeActions } from '../useConcierge'
import type { Message as Msg } from '../types'
import { CONFIG } from '../catalog'
import { useT } from '../i18n'
import ProductCard from './ProductCard'
import Carousel from './Carousel'
import Hov from '../Hov'
import { Check, Clock, Sprout, Star5 } from '../icons'

interface Props {
  m: Msg
  favorites: string[]
  cartQty: Record<string, number>
  actions: ConciergeActions
}

export default function Message({ m, favorites, cartQty, actions }: Props) {
  const t = useT()
  if (m.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'kpIn .35s ease both' }}>
        <div style={{ maxWidth: '78%', background: 'var(--primary)', color: 'var(--on-primary)', padding: '12px 16px', borderRadius: '18px 18px 4px 18px', fontSize: 15, lineHeight: 1.45 }}>{m.text}</div>
      </div>
    )
  }

  // assistant
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', animation: 'kpIn .35s ease both' }}>
      <div style={{ flex: 'none', width: 36, height: 36, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
        <Sprout size={20} stroke="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {m.kind === 'text' && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '82%', background: 'var(--surface)', border: '1px solid var(--line)', padding: '12px 16px', borderRadius: '18px 18px 18px 4px', fontSize: 15, lineHeight: 1.55, color: 'var(--ink)' }}><RichText text={m.text ?? ''} /></div>
        )}

        {m.kind === 'products' && (
          <>
            {(m.text ?? '').trim() && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '90%', background: 'var(--surface)', border: '1px solid var(--line)', padding: '12px 16px', borderRadius: '18px 18px 18px 4px', fontSize: 15, lineHeight: 1.55, color: 'var(--ink)' }}><RichText text={m.text ?? ''} /></div>
            )}
            {CONFIG.showLabels && m.label && (
              <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: '.02em', color: 'var(--ink-2)', background: 'var(--soft)', border: '1px solid var(--soft-border)', padding: '5px 11px', borderRadius: 999 }}>
                <Star5 size={13} fill="var(--star)" />
                {t('pickedForYou')}
                {(m.products?.length ?? 0) > 0 && <span style={{ color: 'var(--muted)', fontWeight: 600 }}>· {t('picks', { n: m.products!.length })}</span>}
              </div>
            )}
            <div style={{ alignSelf: 'stretch' }}>
              <Carousel>
                {(m.products || []).map((p) => (
                  <ProductCard key={p.id} p={p}
                    isFav={favorites.includes(p.id)}
                    qty={cartQty[p.id] ?? 0}
                    onAdd={() => actions.addToCart(p)}
                    onInc={() => actions.changeQty(p.id, 1)}
                    onDec={() => actions.changeQty(p.id, -1)}
                    onFav={() => actions.toggleFav(p)} />
                ))}
              </Carousel>
            </div>
          </>
        )}

        {m.kind === 'categories' && (m.categories?.length ?? 0) > 0 && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: '92%' }}>
            {m.categories!.map((c) => (
              <Hov key={c.name} as="button" onClick={() => actions.openCategory(c.name)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)', borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                hoverStyle={{ background: 'var(--soft)', borderColor: 'var(--soft-border)', color: 'var(--primary)' }}>
                {prettyCategory(c.name)}
              </Hov>
            ))}
          </div>
        )}

        {m.kind === 'confirmation' && m.order && (
          <div style={{ alignSelf: 'flex-start', maxWidth: 440, background: 'var(--surface)', border: '1px solid var(--soft-border)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 6px 22px rgba(0,0,0,.12)' }}>
            <div style={{ background: 'var(--grad)', padding: '22px 22px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 'none', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={26} stroke="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.01em' }}>Ready for payment</div>
                <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>{m.text}</div>
              </div>
            </div>
            <div style={{ padding: '18px 22px 20px', display: 'flex', flexDirection: 'column', gap: 13 }}>
              {m.order.orderRef && <Row label="Order reference" value={m.order.orderRef} />}
              <Row label="Delivering to" value={m.order.recipientName} />
              <Row label="Arrives" value={m.order.etaText} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, borderTop: '1px solid var(--line-2)', paddingTop: 13 }}>
                <span style={{ color: 'var(--muted)' }}>Total</span>
                <span style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 15 }}>{m.order.totalText}</span>
              </div>
              {m.order.payUrl ? (
                <Hov as="button" onClick={() => window.open(m.order!.payUrl as string, '_blank', 'noopener')}
                  style={{ background: 'var(--grad-gold)', color: 'var(--on-accent)', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'var(--shadow-gold)' }}
                  hoverStyle={{ filter: 'brightness(1.05)' }}>
                  Pay now on Kapruka →
                </Hov>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--soft)', border: '1px solid var(--soft-border)', borderRadius: 10, padding: '10px 12px', fontSize: 12.5, color: 'var(--muted)' }}>
                  <Clock size={15} stroke="var(--muted)" />A payment link will arrive by email.
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--soft)', border: '1px solid var(--soft-border)', borderRadius: 10, padding: '10px 12px', fontSize: 12.5, color: 'var(--muted)' }}>
                <Clock size={15} stroke="var(--muted)" />After paying, track it from the basket panel using your Kapruka order number.
              </div>
              <Hov as="button" onClick={actions.newChat}
                style={{ marginTop: 2, background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--ink)', borderRadius: 10, padding: '11px 0', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                hoverStyle={{ background: 'var(--line-2)' }}>
                Start a new gift
              </Hov>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function prettyCategory(name: string): string {
  const cleaned = name.replace(/[_-]+/g, ' ').trim()
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
}

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const m = /^\*\*([^*]+)\*\*$/.exec(part)
    return m
      ? <strong key={`${keyBase}-${i}`} style={{ fontWeight: 700 }}>{m[1]}</strong>
      : <span key={`${keyBase}-${i}`}>{part}</span>
  })
}

/** Minimal markdown: **bold**, bullet/numbered lists, and line breaks. */
function RichText({ text }: { text: string }) {
  // Strip placeholder tokens and any raw Kapruka URLs the model may emit
  // (categories/products render as their own UI, not as link dumps).
  const cleaned = text
    .replace(/\{\{\s*products?\s*\}\}/gi, '')
    .replace(/[[<]\s*(products?|cards?|product[_-]?cards?)\s*[\]>]/gi, '')
    .replace(/https?:\/\/(?:www\.)?kapruka\.com\/\S*/gi, '')
    .replace(/^[ \t]*[-*•]?[ \t]*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  const lines = cleaned.split('\n')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {lines.map((ln, i) => {
        const t = ln.trim()
        if (t === '') return <div key={i} style={{ height: 6 }} />
        const bullet = /^([-*•]|\d+[.)])\s+/.exec(t)
        if (bullet) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ color: 'var(--muted-2)', flex: 'none' }}>•</span>
              <span>{renderInline(t.slice(bullet[0].length), String(i))}</span>
            </div>
          )
        }
        return <div key={i}>{renderInline(ln, String(i))}</div>
      })}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{value}</span>
    </div>
  )
}
