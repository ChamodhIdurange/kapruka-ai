import { useEffect, useRef, useState } from 'react'
import type { ConciergeActions } from '../useConcierge'
import type { Chat, CheckoutStep, GiftCard } from '../types'
import { apiGet, type CitiesResponse } from '../api'
import { formatPrice, pricing, deliveryDateISO } from '../derive'
import { tileBg } from '../catalog'
import { useT, type TKey } from '../i18n'
import Hov from '../Hov'
import { CheckLg, Clock, Close, GiftBox, GiftBoxFlat, Pin, ClipboardCheck } from '../icons'

const STEPS: { key: 'gift' | 'delivery' | 'review'; labelKey: TKey }[] = [
  { key: 'gift', labelKey: 'stepGift' },
  { key: 'delivery', labelKey: 'stepDelivery' },
  { key: 'review', labelKey: 'stepReview' },
]

const inputStyle: React.CSSProperties = {
  border: '1px solid var(--line)', background: 'var(--surface-2)', borderRadius: 11, padding: '11px 13px',
  fontSize: 14, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit', width: '100%',
}
const sectionLabel: React.CSSProperties = {
  fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em',
}

export default function CheckoutModal({ chat, actions }: { chat: Chat; actions: ConciergeActions }) {
  const t = useT()
  const step = chat.checkoutStep as CheckoutStep
  const { totalText } = pricing(chat.cart)
  const stepIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <div onClick={actions.closeCheckout}
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(31,26,48,.55)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'kpIn .2s ease both' }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(560px,96vw)', maxHeight: 'min(90vh,760px)', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(31,26,48,.5)' }}>

        {/* header */}
        <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px 16px', borderBottom: '1px solid var(--line-2)' }}>
          <div style={{ flex: 'none', width: 38, height: 38, borderRadius: 11, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {step === 'done' ? <CheckLg size={20} stroke="#fff" strokeWidth={2.4} /> : <Pin size={19} stroke="#fff" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.01em' }}>
              {step === 'done' ? t('orderReady') : t('completeGift')}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              {step === 'gift' && t('subGift')}
              {step === 'delivery' && t('subDelivery')}
              {step === 'review' && t('subReview')}
              {step === 'done' && t('subDone')}
            </div>
          </div>
          <Hov as="button" onClick={actions.closeCheckout} title="Close"
            style={{ flex: 'none', width: 34, height: 34, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            hoverStyle={{ background: 'var(--line-2)' }}>
            <Close size={18} />
          </Hov>
        </div>

        {/* stepper */}
        {step !== 'done' && (
          <div style={{ flex: 'none', display: 'flex', alignItems: 'center', padding: '16px 26px 4px' }}>
            {STEPS.map((s, i) => {
              const done = i < stepIndex
              const active = i === stepIndex
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800,
                      background: done || active ? 'var(--primary)' : 'var(--surface-2)',
                      color: done || active ? 'var(--on-primary)' : 'var(--muted-2)',
                      border: active ? '3px solid var(--soft-border)' : '1px solid var(--line)',
                      transition: 'all .2s ease',
                    }}>
                      {done ? <CheckLg size={15} stroke="var(--on-primary)" strokeWidth={3} /> : i + 1}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: active ? 'var(--ink)' : 'var(--muted-2)', whiteSpace: 'nowrap' }}>{t(s.labelKey)}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, margin: '0 8px', marginBottom: 20, background: done ? 'var(--primary)' : 'var(--line)', borderRadius: 2, transition: 'background .2s ease' }} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* body */}
        <div className="kp-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 22px' }}>
          {step === 'gift' && <GiftStep chat={chat} actions={actions} />}
          {step === 'delivery' && <DeliveryStep chat={chat} actions={actions} />}
          {step === 'review' && <ReviewStep chat={chat} />}
          {step === 'done' && <DoneStep chat={chat} actions={actions} />}
        </div>

        {/* footer */}
        {step !== 'done' && (
          <div style={{ flex: 'none', display: 'flex', gap: 10, padding: '14px 22px 18px', borderTop: '1px solid var(--line-2)' }}>
            {step === 'gift' && (
              <button type="button" onClick={() => actions.finishCard(false)} style={ghostBtn}>{t('skip')}</button>
            )}
            {step === 'delivery' && (
              <button type="button" onClick={() => actions.goCheckoutStep('gift')} style={ghostBtn}>{t('back')}</button>
            )}
            {step === 'review' && (
              <button type="button" onClick={() => actions.goCheckoutStep('delivery')} style={ghostBtn}>{t('back')}</button>
            )}
            <div style={{ flex: 1 }} />
            {step === 'gift' && (
              <Hov as="button" onClick={() => actions.finishCard(true)} style={primaryBtn} hoverStyle={{ background: 'var(--primary-hover)' }}>{t('continueBtn')}</Hov>
            )}
            {step === 'delivery' && (
              <Hov as="button" onClick={actions.submitDelivery} style={primaryBtn} hoverStyle={{ background: 'var(--primary-hover)' }}>{t('continueReview')}</Hov>
            )}
            {step === 'review' && (
              <Hov as="button" onClick={() => { if (!chat.placing) actions.placeOrder() }}
                style={{ ...primaryBtn, background: 'var(--accent)', opacity: chat.placing ? 0.7 : 1, cursor: chat.placing ? 'default' : 'pointer' }}
                hoverStyle={chat.placing ? {} : { background: 'var(--accent-hover)' }}>
                {chat.placing ? t('placing') : t('placeOrder', { total: totalText })}
              </Hov>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Step 1: gift card ── */
function GiftStep({ chat, actions }: { chat: Chat; actions: ConciergeActions }) {
  const t = useT()
  const id = chat.id
  const cards: { key: GiftCard; labelKey: TKey; bg: string; color: string }[] = [
    { key: 'classic', labelKey: 'cardClassic', bg: 'linear-gradient(135deg,#F1ECFB,#E0D6F6)', color: '#343a40' },
    { key: 'floral', labelKey: 'cardFloral', bg: 'linear-gradient(135deg,#F7D6E6,#E29ECB)', color: '#fff' },
    { key: 'modern', labelKey: 'cardModern', bg: 'linear-gradient(135deg,#6E4AE0,#3B1E8F)', color: '#fff' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <GiftBox size={18} stroke="var(--ink)" strokeWidth={1.7} />
        <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)' }}>{t('addGiftCardTitle')}</span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input value={chat.giftTo} onChange={(e) => actions.patch(id, { giftTo: e.target.value })} placeholder={t('toField')} style={{ ...inputStyle, flex: 1 }} />
        <input value={chat.giftFrom} onChange={(e) => actions.patch(id, { giftFrom: e.target.value })} placeholder={t('fromField')} style={{ ...inputStyle, flex: 1 }} />
      </div>
      <textarea value={chat.giftText} onChange={(e) => actions.patch(id, { giftText: e.target.value })}
        placeholder={t('giftMsgPlaceholder')}
        style={{ ...inputStyle, minHeight: 92, resize: 'vertical', lineHeight: 1.5 }} />
      <div style={{ ...sectionLabel, marginTop: 4 }}>{t('chooseCard')}</div>
      <div style={{ display: 'flex', gap: 10 }}>
        {cards.map((c) => {
          const selected = chat.giftCard === c.key
          return (
            <div key={c.key} onClick={() => actions.patch(id, { giftCard: c.key })}
              style={{ flex: 1, height: 60, borderRadius: 12, background: c.bg, border: `2px solid ${selected ? 'var(--primary)' : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 700, color: c.color, cursor: 'pointer', boxShadow: selected ? '0 4px 14px rgba(110,74,224,.25)' : 'none', transition: 'all .15s ease' }}>
              {t(c.labelKey)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Step 2: delivery ── */
function DeliveryStep({ chat, actions }: { chat: Chat; actions: ConciergeActions }) {
  const t = useT()
  const id = chat.id
  const [cities, setCities] = useState<string[]>([])
  const [showCities, setShowCities] = useState(false)
  const debRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const dates: { key: 'today' | 'tomorrow' | 'weekend'; labelKey: TKey }[] = [
    { key: 'today', labelKey: 'dToday' }, { key: 'tomorrow', labelKey: 'dTomorrow' }, { key: 'weekend', labelKey: 'dWeekend' },
  ]

  useEffect(() => {
    const q = chat.dlCity.trim()
    clearTimeout(debRef.current)
    if (q.length < 2) { setCities([]); return }
    debRef.current = setTimeout(() => {
      apiGet<CitiesResponse>(`/api/delivery-cities?query=${encodeURIComponent(q)}&limit=8`)
        .then((r) => setCities(r.cities.map((c) => c.name)))
        .catch(() => setCities([]))
    }, 250)
    return () => clearTimeout(debRef.current)
  }, [chat.dlCity])

  const pickCity = (name: string) => {
    actions.patch(id, { dlCity: name })
    setShowCities(false)
    setTimeout(() => actions.checkDelivery(), 0)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input value={chat.dlName} onChange={(e) => actions.patch(id, { dlName: e.target.value })} placeholder={t('recipientName')} style={inputStyle} />
      <input value={chat.dlPhone} onChange={(e) => actions.patch(id, { dlPhone: e.target.value })} placeholder={t('recipientPhone')} style={inputStyle} />
      <textarea value={chat.dlAddr} onChange={(e) => actions.patch(id, { dlAddr: e.target.value })} placeholder={t('deliveryAddress')} style={{ ...inputStyle, minHeight: 60, resize: 'vertical', lineHeight: 1.5 }} />

      <div style={{ position: 'relative' }}>
        <input value={chat.dlCity}
          onChange={(e) => { actions.patch(id, { dlCity: e.target.value, dlCheck: null }); setShowCities(true) }}
          onFocus={() => setShowCities(true)}
          onBlur={() => setTimeout(() => setShowCities(false), 150)}
          placeholder={t('cityHint')} style={inputStyle} />
        {showCities && cities.length > 0 && (
          <div className="kp-scroll" style={{ position: 'absolute', zIndex: 5, top: 'calc(100% + 4px)', left: 0, right: 0, maxHeight: 180, overflowY: 'auto', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 11, boxShadow: '0 10px 28px rgba(0,0,0,.18)' }}>
            {cities.map((name) => (
              <div key={name} onMouseDown={() => pickCity(name)} style={{ padding: '10px 13px', fontSize: 13.5, color: 'var(--ink)', cursor: 'pointer' }}>{name}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{ ...sectionLabel, marginTop: 4 }}>{t('whenArrive')}</div>
      <div style={{ display: 'flex', gap: 9 }}>
        {dates.map((d) => {
          const selected = chat.dlDate === d.key
          return (
            <div key={d.key} onClick={() => { actions.patch(id, { dlDate: d.key }); setTimeout(() => actions.checkDelivery(), 0) }}
              style={{ flex: 1, borderRadius: 11, border: `2px solid ${selected ? 'var(--primary)' : 'var(--line)'}`, background: selected ? 'var(--soft)' : 'var(--surface-2)', padding: '12px 6px', textAlign: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
              {t(d.labelKey)}
            </div>
          )
        })}
      </div>

      {chat.dlCheck && (
        <div style={{ background: 'var(--soft)', border: '1px solid var(--soft-border)', borderRadius: 11, padding: '10px 13px', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
          {chat.dlCheck.rateText && <div style={{ color: 'var(--ink)', fontWeight: 700 }}>{t('delivery')}: {chat.dlCheck.rateText}</div>}
          {!chat.dlCheck.available && chat.dlCheck.nextAvailableDate && <div>{t('earliestAvailable', { d: chat.dlCheck.nextAvailableDate })}</div>}
          {chat.dlCheck.warning && <div>{chat.dlCheck.warning}</div>}
        </div>
      )}

      <div style={{ ...sectionLabel, marginTop: 4 }}>{t('timeOfDay')}</div>
      <select value={chat.dlSlot} onChange={(e) => actions.patch(id, { dlSlot: e.target.value as Chat['dlSlot'] })}
        style={{ ...inputStyle, cursor: 'pointer' }}>
        <option value="morning">{t('morning')}</option>
        <option value="afternoon">{t('afternoon')}</option>
        <option value="evening">{t('evening')}</option>
      </select>
    </div>
  )
}

/* ── Step 3: review ── */
function ReviewStep({ chat }: { chat: Chat }) {
  const t = useT()
  const { totalText } = pricing(chat.cart)
  const hasGift = (chat.giftText || '').trim().length > 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <ClipboardCheck size={18} stroke="var(--ink)" strokeWidth={1.7} />
        <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)' }}>{t('yourOrder')}</span>
      </div>
      {chat.cart.map((c) => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
          <div style={{ flex: 'none', width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: tileBg(c.id) }}>
            {c.imageUrl && <img src={c.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{c.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>{t('qtyLabel', { n: c.qty })}</div>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{formatPrice(c.priceAmount * c.qty, c.currency)}</div>
        </div>
      ))}
      {hasGift && (
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', background: 'var(--soft)', border: '1px solid var(--soft-border)', borderRadius: 11, padding: '11px 13px', marginTop: 14 }}>
          <GiftBoxFlat size={15} stroke="var(--muted)" style={{ flex: 'none', marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>
            <span style={{ fontWeight: 700, color: 'var(--ink-2)' }}>{t('giftCardIncluded')}</span><br />"{chat.giftText}"
          </div>
        </div>
      )}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line-2)', borderRadius: 11, padding: 13, marginTop: 14, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
        <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{t('deliveringTo', { name: chat.dlName || 'recipient' })}</div>
        {chat.dlAddr ? `${chat.dlAddr}, ` : ''}{chat.dlCity || '—'}<br />
        {deliveryDateISO(chat.dlDate)} · {chat.dlSlot}
        {chat.dlCheck?.rateText && <><br />{t('delivery')}: {chat.dlCheck.rateText}</>}
      </div>

      <div style={{ ...sectionLabel, margin: '16px 0 9px' }}>{t('payment')}</div>
      <PaymentPicker chat={chat} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{t('itemsTotal')}</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{totalText}</span>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 4 }}>
        {t('deliveryFootnote', { rate: chat.dlCheck?.rateText ? `(${chat.dlCheck.rateText}) ` : '' })}
      </div>
    </div>
  )
}

function PaymentPicker({ chat }: { chat: Chat }) {
  const t = useT()
  // Display-only here (the real charge happens on Kapruka's pay page).
  const pays: { key: string; labelKey: TKey }[] = [
    { key: 'card', labelKey: 'payCard' },
    { key: 'cod', labelKey: 'payCod' },
    { key: 'wallet', labelKey: 'payWallet' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {pays.map((p) => {
        const selected = chat.payMethod === p.key
        return (
          <div key={p.key}
            style={{ display: 'flex', alignItems: 'center', gap: 10, border: `2px solid ${selected ? 'var(--primary)' : 'var(--line)'}`, background: selected ? 'var(--soft)' : 'var(--surface-2)', borderRadius: 11, padding: '11px 13px', cursor: 'default' }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', border: selected ? '5px solid var(--primary)' : '2px solid var(--muted-2)' }} />
            <span style={{ fontSize: 13.5, fontWeight: selected ? 700 : 600, color: 'var(--ink)' }}>{t(p.labelKey)}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Step 4: done ── */
function DoneStep({ chat, actions }: { chat: Chat; actions: ConciergeActions }) {
  const t = useT()
  const order = chat.order
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 4px 4px' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, animation: 'kpPop .3s ease' }}>
        <CheckLg size={36} stroke="#fff" strokeWidth={2.4} />
      </div>
      <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>{t('orderReadyPay')}</div>
      <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 380, marginBottom: 18 }}>
        {t('donePaySub')}
      </div>

      <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface-2)', border: '1px solid var(--line-2)', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {order?.orderRef && <Row label={t('orderReference')} value={order.orderRef} />}
        <Row label={t('deliveringToLabel')} value={order?.recipientName ?? '—'} />
        <Row label={t('arrivesLabel')} value={order?.etaText ?? '—'} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          <span style={{ color: 'var(--muted)' }}>{t('total')}</span>
          <span style={{ fontWeight: 800, color: 'var(--ink)' }}>{order?.totalText}</span>
        </div>
      </div>

      {order?.payUrl ? (
        <Hov as="button" onClick={() => window.open(order.payUrl as string, '_blank', 'noopener')}
          style={{ ...primaryBtn, width: '100%', maxWidth: 420, background: 'var(--accent)' }}
          hoverStyle={{ background: 'var(--accent-hover)' }}>{t('payNow')}</Hov>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--soft)', border: '1px solid var(--soft-border)', borderRadius: 11, padding: '11px 14px', fontSize: 12.5, color: 'var(--muted)' }}>
          <Clock size={15} stroke="var(--muted)" />{t('payLinkEmail')}
        </div>
      )}
      <button type="button" onClick={actions.closeCheckout} style={{ ...ghostBtn, width: '100%', maxWidth: 420, marginTop: 10 }}>{t('done')}</button>
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

const primaryBtn: React.CSSProperties = {
  background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: 11,
  padding: '12px 22px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
}
const ghostBtn: React.CSSProperties = {
  background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 11,
  padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
}
