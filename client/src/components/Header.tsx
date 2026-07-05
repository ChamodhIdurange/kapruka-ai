import type { ConciergeActions } from '../useConcierge'
import type { Lang, Theme } from '../types'
import { useT } from '../i18n'
import Hov from '../Hov'
import { Cart, Menu, Moon, Sun } from '../icons'

interface Props {
  lang: Lang
  theme: Theme
  cartCount: number
  isMobile?: boolean
  actions: ConciergeActions
}

export default function Header({ lang, theme, cartCount, isMobile, actions }: Props) {
  const t = useT()
  const pill = (on: boolean) => (on ? 'var(--primary)' : 'transparent')
  const txt = (on: boolean) => (on ? 'var(--on-primary)' : 'var(--muted)')
  const hasItems = cartCount > 0

  const langBtn = (code: Lang, label: string, weight: number) => (
    <button type="button" onClick={() => actions.setLang(code)}
      style={{ border: 'none', borderRadius: 999, padding: isMobile ? '5px 8px' : '5px 11px', fontSize: 12, fontWeight: weight, cursor: 'pointer', fontFamily: 'inherit', background: pill(lang === code), color: txt(lang === code) }}>
      {label}
    </button>
  )

  return (
    <div className="kp-glass" style={{ flex: 'none', height: 60, borderBottom: '1px solid var(--line)', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 12px' : '0 18px', gap: 8, zIndex: 5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
        {isMobile && (
          <Hov as="button" onClick={actions.expandSidebar} title="Menu"
            style={{ flex: 'none', width: 36, height: 36, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            hoverStyle={{ background: 'var(--line-2)' }}>
            <Menu size={18} />
          </Hov>
        )}
        <span className="kp-grad-text" style={{ fontSize: 16, fontWeight: 800, letterSpacing: '.02em' }}>KAI</span>
        {!isMobile && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--muted)', background: 'var(--soft)', padding: '3px 9px', borderRadius: 999 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#37b24d' }} />{t('conciergeStatus')}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 999, padding: 3, gap: 2 }}>
          {langBtn('en', 'EN', 700)}
          {langBtn('si', 'සිං', 600)}
          {langBtn('ta', 'தமிழ்', 600)}
        </div>
        <Hov as="button" onClick={actions.toggleTheme} title="Toggle theme"
          style={{ flex: 'none', width: 36, height: 36, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          hoverStyle={{ background: 'var(--line-2)' }}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </Hov>
        <Hov as="button" onClick={actions.toggleCart} title="Toggle basket"
          style={{ position: 'relative', flex: 'none', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--ink)', borderRadius: 999, padding: isMobile ? '0' : '7px 14px 7px 12px', width: isMobile ? 36 : undefined, height: isMobile ? 36 : undefined, justifyContent: 'center', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          hoverStyle={{ background: 'var(--line-2)' }}>
          <Cart size={18} />
          {!isMobile && t('basket')}
          {hasItems && (
            <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--primary)', color: 'var(--on-primary)', fontSize: 10.5, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', border: '2px solid var(--surface)' }}>{cartCount}</span>
          )}
        </Hov>
      </div>
    </div>
  )
}
