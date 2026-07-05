import type { RefObject } from 'react'
import type { ConciergeActions } from '../useConcierge'
import type { Chat } from '../types'
import Message from './Message'
import { Sprout } from '../icons'

interface Props {
  chat: Chat
  favorites: string[]
  messagesRef: RefObject<HTMLDivElement>
  actions: ConciergeActions
}

export default function Transcript({ chat, favorites, messagesRef, actions }: Props) {
  const cartQty: Record<string, number> = {}
  for (const x of chat.cart) cartQty[x.id] = x.qty
  return (
    <div ref={messagesRef} className="kp-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '28px 28px 8px' }}>
      <div style={{ maxWidth: 780, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {chat.messages.map((m) => (
          <Message key={m.id} m={m} favorites={favorites} cartQty={cartQty} actions={actions} />
        ))}

        {chat.typing && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', animation: 'kpIn .25s ease both' }}>
            <div style={{ flex: 'none', width: 36, height: 36, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sprout size={20} stroke="#fff" />
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px 18px 18px 4px', padding: '15px 17px', display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted-2)', animation: 'kpDots 1.2s infinite' }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted-2)', animation: 'kpDots 1.2s infinite .2s' }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted-2)', animation: 'kpDots 1.2s infinite .4s' }} />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
