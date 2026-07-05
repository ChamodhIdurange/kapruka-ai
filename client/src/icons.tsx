import type { CSSProperties, ReactNode } from 'react'

interface SvgProps {
  size?: number
  stroke?: string
  strokeWidth?: number
  fill?: string
  style?: CSSProperties
  children?: ReactNode
}

/** Stroke-style icon base (no fill, rounded caps/joins). */
function Stroke({ size = 24, stroke = 'currentColor', strokeWidth = 1.7, style, children }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  )
}

/** Filled icon base. */
function Fill({ size = 24, fill = 'currentColor', stroke, strokeWidth, style, children }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} style={style}>
      {children}
    </svg>
  )
}

export const Sprout = (p: SvgProps) => (
  <Stroke {...p}><path d="M12 21v-8" /><path d="M12 13c-4 0-7-2.6-7-7 0 0 3.6-1 6.2 1.6" /><path d="M12 13c0-4 2.6-7 7-7 0 0 1 3.6-1.6 6.2" /></Stroke>
)
export const SidebarToggle = (p: SvgProps) => (
  <Stroke strokeWidth={1.8} {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></Stroke>
)
export const Plus = (p: SvgProps) => (
  <Stroke strokeWidth={2} {...p}><path d="M12 5v14M5 12h14" /></Stroke>
)
export const ChatBubble = (p: SvgProps) => (
  <Stroke {...p}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.8L3 20l1-3.6A8.4 8.4 0 1 1 21 11.5z" /></Stroke>
)
export const Pencil = (p: SvgProps) => (
  <Stroke strokeWidth={1.8} {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></Stroke>
)
export const Trash = (p: SvgProps) => (
  <Stroke strokeWidth={1.8} {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></Stroke>
)
export const ChevronDown = (p: SvgProps) => (
  <Stroke strokeWidth={1.8} {...p}><path d="M6 9l6 6 6-6" /></Stroke>
)
export const Menu = (p: SvgProps) => (
  <Stroke strokeWidth={1.9} {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Stroke>
)
export const ChevronRight = (p: SvgProps) => (
  <Stroke strokeWidth={2} {...p}><path d="M9 6l6 6-6 6" /></Stroke>
)
export const Moon = (p: SvgProps) => (
  <Stroke strokeWidth={1.8} {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></Stroke>
)
export const Sun = (p: SvgProps) => (
  <Stroke strokeWidth={1.8} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Stroke>
)
export const Cart = (p: SvgProps) => (
  <Stroke {...p}><path d="M6 6h15l-1.6 9h-12z" /><path d="M6 6L5 2H2" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></Stroke>
)
/** 4-point sparkle, used filled with --star. */
export const Spark4 = (p: SvgProps) => (
  <Fill {...p}><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z" /></Fill>
)
/** 5-point star, used filled with --star (ratings, badges). */
export const Star5 = (p: SvgProps) => (
  <Fill {...p}><path d="M12 2l2.4 5 5.6.6-4.2 3.8 1.2 5.5L12 19.7 6.9 17l1.2-5.5L4 7.6l5.6-.6z" /></Fill>
)
export const Wand = (p: SvgProps) => (
  <Stroke strokeWidth={1.8} {...p}><path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" /></Stroke>
)
export const Cake = (p: SvgProps) => (
  <Stroke {...p}><path d="M4 21h16M5 21v-7h14v7" /><path d="M4 14c2 0 2-1.6 4-1.6s2 1.6 4 1.6 2-1.6 4-1.6 2 1.6 4 1.6" /></Stroke>
)
export const CakeCard = (p: SvgProps) => (
  <Stroke {...p}><path d="M4 21h16M5 21v-8h14v8" /><path d="M3 13c2 0 2-1.8 4-1.8s2 1.8 4 1.8 2-1.8 4-1.8 2 1.8 4 1.8" /><path d="M12 5v3" /></Stroke>
)
export const CakeBasket = (p: SvgProps) => (
  <Stroke {...p}><path d="M4 21h16M5 21v-8h14v8" /><path d="M3 13c2 0 2-1.8 4-1.8s2 1.8 4 1.8 2-1.8 4-1.8 2 1.8 4 1.8" /></Stroke>
)
export const Flower = (p: SvgProps) => (
  <Stroke {...p}><circle cx="12" cy="8" r="2.2" /><ellipse cx="12" cy="3.7" rx="1.6" ry="2.4" /><ellipse cx="12" cy="12.3" rx="1.6" ry="2.4" /><ellipse cx="7.8" cy="8" rx="2.4" ry="1.6" /><ellipse cx="16.2" cy="8" rx="2.4" ry="1.6" /></Stroke>
)
export const FlowerStem = (p: SvgProps) => (
  <Stroke strokeWidth={1.5} {...p}><circle cx="12" cy="8" r="2.2" /><ellipse cx="12" cy="3.7" rx="1.7" ry="2.5" /><ellipse cx="12" cy="12.3" rx="1.7" ry="2.5" /><ellipse cx="7.7" cy="8" rx="2.5" ry="1.7" /><ellipse cx="16.3" cy="8" rx="2.5" ry="1.7" /><path d="M12 14v7" /></Stroke>
)
export const Choc = (p: SvgProps) => (
  <Stroke {...p}><rect x="4" y="4" width="16" height="16" rx="2.5" /><path d="M4 12h16M12 4v16" /></Stroke>
)
export const Hamper = (p: SvgProps) => (
  <Stroke strokeWidth={1.5} {...p}><rect x="4" y="9.5" width="16" height="10.5" rx="1.4" /><path d="M3 9.5h18v3H3z" /><path d="M12 9.5V20" /></Stroke>
)
export const HamperBow = (p: SvgProps) => (
  <Stroke strokeWidth={1.5} {...p}><rect x="4" y="9.5" width="16" height="10.5" rx="1.4" /><path d="M3 9.5h18v3H3z" /><path d="M12 9.5V20" /><path d="M12 9.5S10 5 8.2 6.3 10 9.5 12 9.5zM12 9.5s2-4.5 3.8-3.2S14 9.5 12 9.5z" /></Stroke>
)
export const Heart = (p: SvgProps) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill={p.fill ?? 'none'} stroke={p.stroke} strokeWidth={p.strokeWidth ?? 1.8} style={p.style}>
    <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.5 0 5 3.5 3.5 6.5C19 16.5 12 21 12 21z" />
  </svg>
)
export const HeartCart = (p: SvgProps) => (
  <Stroke strokeWidth={1.5} {...p}><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></Stroke>
)
export const Check = (p: SvgProps) => (
  <Stroke strokeWidth={2.4} {...p}><path d="M20 6L9 17l-5-5" /></Stroke>
)
export const Clock = (p: SvgProps) => (
  <Stroke strokeWidth={1.8} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v4l2.5 1.5" /></Stroke>
)
export const Pin = (p: SvgProps) => (
  <Stroke strokeWidth={1.7} {...p}><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></Stroke>
)
export const ClipboardCheck = (p: SvgProps) => (
  <Stroke {...p}><path d="M9 11l3 3 8-8" /><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" /></Stroke>
)
export const GiftBox = (p: SvgProps) => (
  <Stroke {...p}><rect x="4" y="9.5" width="16" height="10.5" rx="1.4" /><path d="M3 9.5h18v3H3z" /><path d="M12 9.5V20" /><path d="M12 9.5S10 5 8.2 6.3 10 9.5 12 9.5zM12 9.5s2-4.5 3.8-3.2S14 9.5 12 9.5z" /></Stroke>
)
export const GiftBoxFlat = (p: SvgProps) => (
  <Stroke strokeWidth={1.8} {...p}><rect x="4" y="9.5" width="16" height="10.5" rx="1.4" /><path d="M3 9.5h18v3H3zM12 9.5V20" /></Stroke>
)
export const Search = (p: SvgProps) => (
  <Stroke strokeWidth={1.8} {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Stroke>
)
export const Grid = (p: SvgProps) => (
  <Stroke strokeWidth={1.8} {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Stroke>
)
export const Close = (p: SvgProps) => (
  <Stroke strokeWidth={2} {...p}><path d="M18 6L6 18M6 6l12 12" /></Stroke>
)
export const Send = (p: SvgProps) => (
  <Stroke strokeWidth={1.9} {...p}><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></Stroke>
)
export const CheckLg = (p: SvgProps) => (
  <Stroke strokeWidth={2.2} {...p}><path d="M5 13l4 4L19 7" /></Stroke>
)
