import type { ConciergeActions } from '../useConcierge'
import type { Suggestion } from '../types'
import { useT } from '../i18n'
import Hov from '../Hov'
import { Grid, Send } from '../icons'

interface Props {
  draft: string
  suggestions: Suggestion[]
  quickReplies: string[]
  showChips: boolean
  actions: ConciergeActions
}

export default function InputDock({ draft, suggestions, quickReplies, showChips, actions }: Props) {
  const t = useT()
  const label = (s: Suggestion) =>
    s.action === 'open-composer' ? t('sgAddGiftCard')
    : s.action === 'checkout' ? t('sgProceedCheckout')
    : s.label
  return (
    <div className="kp-glass" style={{ flex: 'none', borderTop: '1px solid var(--line)', background: 'var(--glass-bg)', padding: '14px 28px 18px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        {quickReplies.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {quickReplies.map((r, i) => (
              <Hov key={i} as="button" onClick={() => actions.heroSend(r)}
                style={{ background: 'var(--soft)', border: '1px solid var(--soft-border)', color: 'var(--primary)', borderRadius: 999, padding: '9px 15px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                hoverStyle={{ background: 'var(--soft-border)' }}>
                {r}
              </Hov>
            ))}
          </div>
        )}
        {showChips && suggestions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {suggestions.map((s, i) => (
              <Hov key={i} as="button" onClick={() => actions.act(s.action)}
                style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)', borderRadius: 999, padding: '9px 15px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                hoverStyle={{ background: 'var(--surface-2)', borderColor: 'var(--muted-2)' }}>
                {label(s)}
              </Hov>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 999, padding: 6, boxShadow: 'var(--shadow-sm)' }}>
          <Hov as="button" onClick={actions.openBrowse} title="Browse the shop"
            style={{ flex: 'none', width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            hoverStyle={{ color: 'var(--primary)', borderColor: 'var(--soft-border)' }}>
            <Grid size={18} />
          </Hov>
          <input value={draft}
            onChange={(e) => actions.setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); actions.onSend() } }}
            placeholder={t('askPlaceholder')}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 15, color: 'var(--ink)', fontFamily: 'inherit', paddingLeft: 4 }} />
          <Hov as="button" onClick={actions.onSend}
            style={{ flex: 'none', width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-primary)' }}
            hoverStyle={{ filter: 'brightness(1.06)' }}>
            <Send size={19} stroke="var(--on-primary)" />
          </Hov>
        </div>
      </div>
    </div>
  )
}
