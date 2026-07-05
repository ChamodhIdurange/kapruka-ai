import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/** Horizontal scroll-snap carousel with hover arrow controls and hidden scrollbar. */
export default function Carousel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    update()
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [update, children])

  const scroll = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <div style={{ position: 'relative' }}>
      {canLeft && <Arrow dir="left" onClick={() => scroll(-1)} />}
      {canRight && <Arrow dir="right" onClick={() => scroll(1)} />}
      <div ref={ref} className="kp-carousel" onScroll={update}
        style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '2px 2px 14px' }}>
        {children}
      </div>
    </div>
  )
}

function Arrow({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={dir === 'left' ? 'Scroll left' : 'Scroll right'}
      style={{
        position: 'absolute', top: 78, [dir]: -8, zIndex: 6, width: 38, height: 38, borderRadius: '50%',
        border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(31,26,48,.18)',
      } as React.CSSProperties}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {dir === 'left' ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  )
}
