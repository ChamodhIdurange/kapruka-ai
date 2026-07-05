import { useConcierge } from './useConcierge'
import { useIsMobile } from './useIsMobile'
import { pricing } from './derive'
import { LangContext } from './i18n'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Hero from './components/Hero'
import Transcript from './components/Transcript'
import InputDock from './components/InputDock'
import RightPanel from './components/RightPanel'
import BrowseModal from './components/BrowseModal'
import CheckoutModal from './components/CheckoutModal'
import WelcomeModal from './components/WelcomeModal'
import Toast from './components/Toast'

export default function App() {
  const { state, actions, messagesRef } = useConcierge()
  const isMobile = useIsMobile()
  const chat = state.chats[state.activeId]
  const { itemsCount } = pricing(chat.cart)
  const chats = state.chatOrder.map((id) => state.chats[id]).filter(Boolean)
  const saved = state.favorites.map((fid) => state.savedMap[fid]).filter(Boolean)

  return (
    <LangContext.Provider value={state.lang}>
    <div
      data-screen-label="KAI Concierge"
      data-theme={state.theme}
      style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden', display: 'flex', background: 'var(--app-bg)', color: 'var(--ink)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      <Sidebar
        chats={chats}
        activeId={state.activeId}
        expanded={state.sidebarExpanded}
        editingId={state.editingId}
        editTitle={state.editTitle}
        isMobile={isMobile}
        actions={actions}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        <Header lang={state.lang} theme={state.theme} cartCount={itemsCount} isMobile={isMobile} actions={actions} />

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--surface-3)' }}>
            {chat.started ? (
              <Transcript chat={chat} favorites={state.favorites} messagesRef={messagesRef} actions={actions} />
            ) : (
              <Hero actions={actions} />
            )}
            <InputDock
              draft={state.draft}
              suggestions={chat.suggestions}
              quickReplies={chat.quickReplies}
              showChips={chat.started && chat.suggestions.length > 0}
              actions={actions}
            />
          </div>

          {state.cartOpen && (
            <RightPanel chat={chat} activeTab={state.activeTab} saved={saved} isMobile={isMobile} actions={actions} />
          )}
        </div>
      </div>

      {state.browseOpen && (
        <BrowseModal
          chat={chat}
          query={state.browseQuery}
          cat={state.browseCat}
          price={state.browsePrice}
          sort={state.browseSort}
          favorites={state.favorites}
          actions={actions}
        />
      )}

      {chat.checkoutStep && <CheckoutModal chat={chat} actions={actions} />}

      <WelcomeModal />
      <Toast text={state.toast} />
    </div>
    </LangContext.Provider>
  )
}
