import { Check } from '../icons'

export default function Toast({ text }: { text: string }) {
  if (!text) return null
  return (
    <div style={{ position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)', background: 'var(--primary)', color: 'var(--on-primary)', padding: '11px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,.28)', zIndex: 200, display: 'flex', gap: 9, alignItems: 'center', animation: 'kpPop .25s ease' }}>
      <Check size={16} stroke="var(--on-primary)" />{text}
    </div>
  )
}
