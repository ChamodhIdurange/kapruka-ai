import { useEffect, useRef } from 'react'
import type { ConciergeActions } from '../useConcierge'
import type { Chat } from '../types'
import { TONES } from '../catalog'
import { useT, type TFunc } from '../i18n'
import Hov from '../Hov'
import { ChatBubble, ChevronDown, Menu, Pencil, Plus, SidebarToggle, Sprout, Trash } from '../icons'

function chatStatus(ch: Chat, t: TFunc): string {
  if (ch.step === 'done') return t('stOrderPlaced')
  const n = ch.cart.reduce((acc, x) => acc + x.qty, 0)
  if (n > 0) return t('stItemsCount', { n, items: n === 1 ? t('itemSingular') : t('itemPlural') })
  return ch.started ? t('stInProgress') : t('stNewChat')
}

interface Props {
  chats: Chat[]
  activeId: string
  expanded: boolean
  editingId: string | null
  editTitle: string
  isMobile?: boolean
  actions: ConciergeActions
}

export default function Sidebar({ chats, activeId, expanded, editingId, editTitle, isMobile, actions }: Props) {
  const t = useT()

  // On mobile the sidebar is an overlay drawer opened from the header; when
  // collapsed it takes no space at all.
  if (isMobile && !expanded) return null

  // Selecting/creating a chat should dismiss the drawer on mobile.
  const selectChat = (id: string) => { actions.selectChat(id); if (isMobile) actions.collapseSidebar() }
  const newChat = () => { actions.newChat(); if (isMobile) actions.collapseSidebar() }

  if (expanded) {
    const panelStyle: React.CSSProperties = isMobile
      ? { position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(300px,84vw)', zIndex: 91, background: 'var(--surface)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', minHeight: 0, boxShadow: 'var(--shadow-lg)', animation: 'kpDrawer .28s cubic-bezier(.2,.7,.2,1) both' }
      : { flex: 'none', width: 268, background: 'var(--surface)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', minHeight: 0 }
    const panel = (
      <div data-screen-label="Chat sidebar" style={panelStyle}>
        {/* brand + collapse */}
        <div style={{ flex: 'none', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 0 18px', borderBottom: '1px solid var(--line-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 'none', width: 32, height: 32, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sprout size={18} stroke="#fff" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.02em' }}>Kapruka AI</span>
          </div>
          <Hov as="button" onClick={actions.collapseSidebar} title="Collapse"
            style={{ flex: 'none', width: 30, height: 30, borderRadius: 8, border: 'none', background: 'var(--surface-2)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            hoverStyle={{ background: 'var(--line-2)' }}>
            <SidebarToggle size={17} />
          </Hov>
        </div>

        {/* new chat */}
        <div style={{ flex: 'none', padding: '14px 14px 10px' }}>
          <Hov as="button" onClick={newChat}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: 11, padding: '11px 0', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            hoverStyle={{ background: 'var(--primary-hover)' }}>
            <Plus size={16} />{t('newChat')}
          </Hov>
        </div>

        <div style={{ flex: 'none', padding: '6px 18px 8px', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>{t('yourChats')}</div>

        <div className="kp-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 10px 12px' }}>
          {chats.map((ch) => {
            const active = ch.id === activeId
            return (
              <Hov key={ch.id}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: active ? 'var(--soft)' : 'transparent', borderRadius: 11, padding: '10px 11px', marginBottom: 3 }}
                hoverStyle={{ background: 'var(--surface-2)' }}>
                <div onClick={() => selectChat(ch.id)} style={{ flex: 'none', width: 34, height: 34, borderRadius: 9, background: TONES[ch.tone || 0], display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChatBubble size={17} stroke="#fff" />
                </div>
                {ch.id === editingId ? (
                  <RenameInput value={editTitle} actions={actions} />
                ) : (
                  <>
                    <div onClick={() => selectChat(ch.id)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chatStatus(ch, t)}</div>
                    </div>
                    <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Hov as="button" onClick={() => actions.startRename(ch.id)} title="Rename"
                        style={{ width: 26, height: 26, border: 'none', background: 'none', borderRadius: 7, color: 'var(--muted-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        hoverStyle={{ background: 'var(--line-2)', color: 'var(--primary)' }}>
                        <Pencil size={14} />
                      </Hov>
                      <Hov as="button" onClick={() => actions.deleteChat(ch.id)} title="Delete"
                        style={{ width: 26, height: 26, border: 'none', background: 'none', borderRadius: 7, color: 'var(--muted-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        hoverStyle={{ background: 'var(--line-2)', color: 'var(--heart)' }}>
                        <Trash size={14} />
                      </Hov>
                    </div>
                  </>
                )}
              </Hov>
            )
          })}
        </div>

        {/* user footer */}
        <div style={{ flex: 'none', borderTop: '1px solid var(--line-2)', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ flex: 'none', width: 34, height: 34, borderRadius: '50%', background: 'var(--soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--ink-2)' }}>N</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Nimal F.</div>
            <div style={{ fontSize: 11, color: 'var(--muted-2)' }}>{t('member')}</div>
          </div>
          <ChevronDown size={16} stroke="var(--muted-2)" />
        </div>
      </div>
    )

    if (isMobile) {
      return (
        <>
          <div onClick={actions.collapseSidebar} className="kp-glass" style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'var(--scrim)', animation: 'kpIn .2s ease both' }} />
          {panel}
        </>
      )
    }
    return panel
  }

  // ── collapsed rail ──
  return (
    <div data-screen-label="Chat rail" style={{ flex: 'none', width: 62, background: 'var(--surface)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 0 }}>
      <div style={{ flex: 'none', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--line-2)', width: '100%' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sprout size={18} stroke="#fff" />
        </div>
      </div>
      <Hov as="button" onClick={actions.expandSidebar} title="Expand"
        style={{ flex: 'none', width: 38, height: 38, marginTop: 12, borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        hoverStyle={{ background: 'var(--line-2)' }}>
        <Menu size={18} />
      </Hov>
      <Hov as="button" onClick={actions.newChat} title="New chat"
        style={{ flex: 'none', width: 38, height: 38, marginTop: 8, borderRadius: 10, border: 'none', background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        hoverStyle={{ background: 'var(--primary-hover)' }}>
        <Plus size={18} />
      </Hov>
      <div style={{ width: 26, height: 1, background: 'var(--line)', margin: '12px 0' }} />
      <div className="kp-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, paddingBottom: 12, width: '100%' }}>
        {chats.map((ch) => {
          const active = ch.id === activeId
          return (
            <button key={ch.id} type="button" onClick={() => actions.selectChat(ch.id)} title={ch.title}
              style={{ flex: 'none', width: 38, height: 38, borderRadius: 11, background: TONES[ch.tone || 0], border: `2px solid ${active ? 'var(--primary)' : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
              <ChatBubble size={17} stroke="#fff" />
            </button>
          )
        })}
      </div>
      <div style={{ flex: 'none', width: 34, height: 34, borderRadius: '50%', background: 'var(--soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--ink-2)', marginBottom: 14 }}>N</div>
    </div>
  )
}

function RenameInput({ value, actions }: { value: string; actions: ConciergeActions }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  return (
    <input ref={ref} value={value}
      onChange={(e) => actions.onEditTitle(e.target.value)}
      onBlur={actions.commitRename}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); actions.commitRename() }
        else if (e.key === 'Escape') { actions.cancelRename() }
      }}
      style={{ flex: 1, minWidth: 0, border: '1px solid var(--primary)', background: 'var(--surface)', borderRadius: 7, padding: '5px 8px', fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }} />
  )
}
