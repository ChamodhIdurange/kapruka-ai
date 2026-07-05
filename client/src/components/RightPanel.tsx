import type { ConciergeActions } from '../useConcierge'
import type { Chat, Product, Tab } from '../types'
import { formatPrice, pricing, TRACK_STAGES } from '../derive'
import { tileBg } from '../catalog'
import { useT } from '../i18n'
import Hov from '../Hov'
import { Cart, CheckLg, Close, GiftBoxFlat, Heart } from '../icons'

interface Props {
  chat: Chat
  activeTab: Tab
  saved: Product[]
  actions: ConciergeActions
}

function Thumb({ imageUrl, id, size, radius }: { imageUrl: string | null; id: string; size: number; radius: number }) {
  return (
    <div style={{ flex: 'none', width: size, height: size, borderRadius: radius, overflow: 'hidden', background: tileBg(id) }}>
      {imageUrl && <img src={imageUrl} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    </div>
  )
}

export default function RightPanel({ chat, activeTab, saved, actions }: Props) {
  const t = useT()
  const isTracking = chat.step === 'done'
  const { totalText, itemsCount } = pricing(chat.cart)
  const hasItems = chat.cart.length > 0

  return (
    <div style={{ flex: 'none', width: 384, borderLeft: '1px solid var(--line)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px 0 18px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>{t('thisGift')}</span>
        <Hov as="button" onClick={actions.toggleCart} title="Hide basket"
          style={{ flex: 'none', width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--surface-2)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          hoverStyle={{ background: 'var(--line-2)' }}>
          <ChevronRightSmall />
        </Hov>
      </div>

      {!isTracking ? (
        <>
          <div style={{ flex: 'none', display: 'flex', padding: '10px 18px 0', gap: 20, borderBottom: '1px solid var(--line-2)' }}>
            <TabButton active={activeTab === 'basket'} onClick={() => actions.setActiveTab('basket')} label={t('basket')} badge={itemsCount} badgeFilled />
            <TabButton active={activeTab === 'saved'} onClick={() => actions.setActiveTab('saved')} label={t('saved')} badge={saved.length} />
          </div>

          {activeTab === 'basket' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="kp-scroll" style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
                {hasItems ? (
                  <>
                    {chat.cart.map((c) => (
                      <div key={c.id} style={{ display: 'flex', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--line-2)' }}>
                        <Thumb imageUrl={c.imageUrl} id={c.id} size={56} radius={11} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{c.name}</div>
                            <Hov as="button" onClick={() => actions.removeItem(c.id)}
                              style={{ flex: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)', padding: 0 }}
                              hoverStyle={{ color: 'var(--heart)' }}>
                              <Close size={15} strokeWidth={2} />
                            </Hov>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
                              <button type="button" onClick={() => actions.changeQty(c.id, -1)} style={qtyBtn}>−</button>
                              <span style={{ width: 30, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{c.qty}</span>
                              <button type="button" onClick={() => actions.changeQty(c.id, 1)} style={qtyBtn}>+</button>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>{formatPrice(c.priceAmount * c.qty, c.currency)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(chat.giftText || '').trim().length > 0 && (
                      <div style={{ display: 'flex', gap: 9, alignItems: 'center', background: 'var(--soft)', border: '1px solid var(--soft-border)', borderRadius: 10, padding: '10px 12px', marginTop: 13 }}>
                        <GiftBoxFlat size={15} stroke="var(--muted)" style={{ flex: 'none' }} />
                        <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>{t('giftCardAddedTag')}</span>
                      </div>
                    )}
                    <div onClick={actions.toggleGiftWrap} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 13, cursor: 'pointer' }}>
                      {chat.giftWrap ? (
                        <span style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckLg size={13} stroke="var(--on-primary)" strokeWidth={2.6} />
                        </span>
                      ) : (
                        <span style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid var(--muted-2)' }} />
                      )}
                      <span style={{ fontSize: 13, color: 'var(--ink)' }}>{t('giftWrap')} <span style={{ color: 'var(--muted-2)' }}>· {t('free')}</span></span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ width: 74, height: 74, borderRadius: '50%', background: 'var(--soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Cart size={34} stroke="var(--muted)" strokeWidth={1.5} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 5 }}>{t('basketEmptyTitle')}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{t('basketEmptySub')}</div>
                  </div>
                )}
              </div>
              {hasItems && (
                <div style={{ flex: 'none', borderTop: '1px solid var(--line)', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 11 }}>
                    <span>{t('itemsSubtotal')}</span><span style={{ fontWeight: 600, color: 'var(--ink)' }}>{totalText}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--line-2)', paddingTop: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>{t('total')}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{totalText}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-2)', marginBottom: 13 }}>{t('plusDelivery')}</div>
                  <Hov as="button" onClick={() => actions.act('checkout')}
                    style={{ width: '100%', background: 'var(--grad)', color: 'var(--on-primary)', border: 'none', borderRadius: 11, padding: '13px 0', fontSize: 14.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'var(--shadow-primary)' }}
                    hoverStyle={{ filter: 'brightness(1.06)' }}>{t('proceedToCheckout')}</Hov>
                </div>
              )}
            </div>
          ) : (
            <div className="kp-scroll" style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
              {saved.length > 0 ? (
                saved.map((p) => (
                  <div key={p.id} style={{ display: 'flex', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--line-2)', alignItems: 'center' }}>
                    <Thumb imageUrl={p.imageUrl} id={p.id} size={56} radius={11} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{p.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginTop: 3 }}>{p.priceText}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <Hov as="button" onClick={() => actions.addToCart(p)}
                        style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                        hoverStyle={{ background: 'var(--primary-hover)' }}>{t('add')}</Hov>
                      <button type="button" onClick={() => actions.toggleFav(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--heart)', padding: 0 }}>
                        <Heart size={16} fill="var(--heart)" stroke="var(--heart)" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ width: 74, height: 74, borderRadius: '50%', background: 'var(--soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Heart size={32} stroke="var(--heart)" strokeWidth={1.6} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 5 }}>{t('noSavedTitle')}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{t('noSavedSub')}</div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <Tracking chat={chat} actions={actions} />
      )}
    </div>
  )
}

function Tracking({ chat, actions }: { chat: Chat; actions: ConciergeActions }) {
  const t = useT()
  const order = chat.order
  const track = chat.track
  const stages = track && track.stages.length
    ? track.stages
    : TRACK_STAGES.map((s) => ({ label: s.label, note: s.note, timestamp: null, done: false }))

  return (
    <div className="kp-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 'none', width: 46, height: 46, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckLg size={24} stroke="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{t('orderReady')}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{order?.orderRef ?? t('awaitingPayment')}</div>
        </div>
      </div>

      {order?.payUrl && (
        <Hov as="button" onClick={() => window.open(order.payUrl as string, '_blank', 'noopener')}
          style={{ width: '100%', background: 'var(--grad-gold)', color: 'var(--on-accent)', border: 'none', borderRadius: 10, padding: '11px 0', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16, boxShadow: 'var(--shadow-gold)' }}
          hoverStyle={{ filter: 'brightness(1.05)' }}>{t('payNow')}</Hov>
      )}

      {/* Live tracking by Kapruka order number */}
      <div style={{ ...labelStyle, marginBottom: 8 }}>{t('trackPaid')}</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <input value={chat.trackQuery} onChange={(e) => actions.setTrackQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') actions.trackOrder() }}
          placeholder={t('trackPlaceholder')}
          style={{ flex: 1, border: '1px solid var(--line)', background: 'var(--surface-2)', borderRadius: 9, padding: '9px 11px', fontSize: 13, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }} />
        <Hov as="button" onClick={actions.trackOrder}
          style={{ flex: 'none', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: 9, padding: '0 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          hoverStyle={{ background: 'var(--primary-hover)' }}>{t('track')}</Hov>
      </div>
      {chat.trackError && <div style={{ fontSize: 12, color: 'var(--heart)', marginBottom: 12 }}>{chat.trackError}</div>}

      {track && (
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: '12px 0 10px' }}>
          {t('statusLabel')}: {track.status ?? '—'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: track ? 0 : 12 }}>
        {stages.map((st, i) => {
          const notLast = i < stages.length - 1
          return (
            <div key={i} style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {st.done ? (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckLg size={14} stroke="var(--on-primary)" strokeWidth={3} />
                  </div>
                ) : (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--line)' }} />
                )}
                {notLast && <span style={{ width: 2, flex: 1, minHeight: 28, background: 'var(--line)', margin: '3px 0' }} />}
              </div>
              <div style={{ paddingBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{st.label}</div>
                {st.note && <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 2 }}>{st.note}</div>}
                {st.timestamp && <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 2 }}>{st.timestamp}</div>}
              </div>
            </div>
          )
        })}
      </div>

      {order && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line-2)', borderRadius: 11, padding: 14, marginTop: 6 }}>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{t('deliveringTo', { name: order.recipientName })}</span><br />
            {t('arrivesItems', { eta: order.etaText, n: order.itemsCount })}
          </div>
        </div>
      )}
      <Hov as="button" onClick={actions.newChat}
        style={{ width: '100%', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: 11, padding: '12px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', marginTop: 14 }}
        hoverStyle={{ background: 'var(--primary-hover)' }}>{t('sendAnother')}</Hov>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted-2)',
}

function TabButton({ active, onClick, label, badge, badgeFilled }: { active: boolean; onClick: () => void; label: string; badge: number; badgeFilled?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      style={{ position: 'relative', background: 'none', border: 'none', padding: '0 0 13px', fontSize: 14.5, fontWeight: 700, color: 'var(--ink)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7 }}>
      {label}
      <span style={{ background: badgeFilled ? 'var(--primary)' : 'var(--soft)', color: badgeFilled ? 'var(--on-primary)' : 'var(--muted)', fontSize: 11, fontWeight: 700, minWidth: 19, height: 19, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{badge}</span>
      {active && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 3, background: 'var(--primary)', borderRadius: '3px 3px 0 0' }} />}
    </button>
  )
}

const qtyBtn: React.CSSProperties = {
  width: 26, height: 26, border: 'none', background: 'var(--surface-2)', color: 'var(--ink)', cursor: 'pointer',
  fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
}

function ChevronRightSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
  )
}
