import type { ReactNode } from 'react'
import type { ConciergeActions } from '../useConcierge'
import { useT } from '../i18n'
import { useIsMobile } from '../useIsMobile'
import Hov from '../Hov'
import { Cake, Flower, GiftBoxFlat, Spark4, Sprout, Wand } from '../icons'

/** Render a translated title that uses \n for line breaks and {hl}…{/hl} for the gradient word. */
function renderTitle(tpl: string): ReactNode {
  return tpl.split('\n').map((line, li) => {
    const parts = line.split(/(\{hl\}.*?\{\/hl\})/g).map((seg, si) => {
      const m = /^\{hl\}(.*?)\{\/hl\}$/.exec(seg)
      return m
        ? <span key={si} className="kp-grad-text">{m[1]}</span>
        : <span key={si}>{seg}</span>
    })
    return <span key={li}>{li > 0 && <br />}{parts}</span>
  })
}

export default function Hero({ actions }: { actions: ConciergeActions }) {
  const t = useT()
  const isMobile = useIsMobile()
  const chip = (onClick: () => void, icon: React.ReactNode, label: string) => (
    <Hov as="button" onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)', borderRadius: 999, padding: '10px 16px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
      hoverStyle={{ borderColor: 'var(--muted-2)' }}>
      {icon}{label}
    </Hov>
  )

  return (
    <div className="kp-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '28px 18px' : '40px 28px' }}>
      <div style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translateX(-50%)', width: '88%', maxWidth: 520, height: 340, background: 'var(--hero-glow)', filter: 'blur(8px)', animation: 'kpGlow 6s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '18%', left: '14%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(34,197,140,.28), transparent)', filter: 'blur(30px)', animation: 'kpBlob1 11s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '14%', right: '12%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(228,178,62,.26), transparent)', filter: 'blur(32px)', animation: 'kpBlob2 13s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 680, width: '100%', textAlign: 'center' }}>
        <div style={{ width: isMobile ? 62 : 78, height: isMobile ? 62 : 78, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: isMobile ? '0 auto 20px' : '0 auto 26px', boxShadow: 'var(--shadow-primary)', animation: 'kpFloat 5s ease-in-out infinite' }}>
          <Sprout size={isMobile ? 30 : 38} stroke="#fff" />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-2)', marginBottom: 14 }}>
          <Spark4 size={14} fill="var(--star)" />
          {t('heroBadge')}
        </div>
        <h1 style={{ margin: '0 0 16px', fontSize: isMobile ? 29 : 42, lineHeight: 1.12, fontWeight: 800, letterSpacing: '-.03em', color: 'var(--ink)' }}>
          {renderTitle(t('heroTitle'))}
        </h1>
        <p style={{ margin: isMobile ? '0 auto 22px' : '0 auto 28px', maxWidth: 520, fontSize: isMobile ? 14.5 : 16, lineHeight: 1.6, color: 'var(--muted)' }}>
          {t('heroSub')}
        </p>
        <Hov as="button" onClick={() => actions.heroSend('Help me choose a gift — what do you need to know?')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'var(--grad)', color: 'var(--on-primary)', border: 'none', borderRadius: 999, padding: '14px 26px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'var(--shadow-primary)', marginBottom: 26 }}
          hoverStyle={{ filter: 'brightness(1.06)', transform: 'translateY(-1px)' }}>
          <Wand size={18} />
          {t('heroChoose')}
        </Hov>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 560, margin: '0 auto' }}>
          {chip(() => actions.heroSend('A chocolate cake for a birthday'), <Cake size={15} stroke="var(--muted)" />, t('chipCake'))}
          {chip(() => actions.heroSend('Red roses for delivery'), <Flower size={15} stroke="var(--muted)" strokeWidth={1.6} />, t('chipRoses'))}
          {chip(() => actions.heroSend('A gift for my mum'), <GiftBoxFlat size={15} stroke="var(--muted)" />, t('chipMum'))}
          {chip(() => actions.heroSend('Something nice under Rs 5,000'), <Spark4 size={15} fill="var(--star)" />, t('chipBudget'))}
        </div>
        <div style={{ marginTop: 22, fontSize: 13.5, color: 'var(--muted-2)' }}>
          {t('or')} <button type="button" onClick={actions.openBrowse} style={{ background: 'none', border: 'none', color: 'var(--ink)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}>{t('browseWholeShop')}</button>
        </div>
      </div>
    </div>
  )
}
