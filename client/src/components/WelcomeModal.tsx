import { useState } from 'react'
import { useT } from '../i18n'
import Hov from '../Hov'
import { Check } from '../icons'

const NEVER_KEY = 'kai-demo-notice-dismissed-v2' // localStorage — permanent opt-out

/** Heads-up that KAI runs on a free Google AI Studio key (rate limits can occur).
 *  Shows on every load unless the user ticks "Don't show this again". */
export default function WelcomeModal() {
  const t = useT()
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(NEVER_KEY) !== '1'
    } catch {
      return true
    }
  })
  const [dontShow, setDontShow] = useState(false)
  if (!open) return null

  const dismiss = () => {
    try {
      if (dontShow) localStorage.setItem(NEVER_KEY, '1')
    } catch {
      /* ignore storage errors (private mode) */
    }
    setOpen(false)
  }

  return (
    <div className="kp-glass" onClick={dismiss}
      style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'kpIn .2s ease both' }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(460px,94vw)', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 22, overflow: 'hidden', boxShadow: 'var(--shadow-lg)', animation: 'kpPop .3s ease' }}>
        <div style={{ background: 'var(--grad)', padding: '22px 24px', color: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 'none', width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.3 3.3a2 2 0 0 1 3.4 0l8 13.4A2 2 0 0 1 20 20H4a2 2 0 0 1-1.7-3L10.3 3.3z" />
              <path d="M12 9v4" /><path d="M12 17h.01" />
            </svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.01em' }}>{t('noticeTitle')}</div>
        </div>
        <div style={{ padding: '20px 24px 22px' }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>{t('noticeBody')}</p>

          <div onClick={() => setDontShow((v) => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, cursor: 'pointer', userSelect: 'none' }}>
            {dontShow ? (
              <span style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={13} stroke="var(--on-primary)" strokeWidth={2.6} />
              </span>
            ) : (
              <span style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid var(--muted-2)' }} />
            )}
            <span style={{ fontSize: 13, color: 'var(--ink)' }}>{t('noticeDontShow')}</span>
          </div>

          <Hov as="button" onClick={dismiss}
            style={{ marginTop: 18, width: '100%', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
            hoverStyle={{ background: 'var(--primary-hover)' }}>
            {t('noticeGotIt')}
          </Hov>
        </div>
      </div>
    </div>
  )
}
