import { useState, type CSSProperties, type ReactNode } from 'react'

type Tag = 'div' | 'button'

interface HovProps {
  as?: Tag
  style?: CSSProperties
  hoverStyle?: CSSProperties
  onClick?: (e: React.MouseEvent) => void
  title?: string
  className?: string
  children?: ReactNode
}

/**
 * Reproduces the prototype's `style-hover` attribute: merges `hoverStyle`
 * over `style` while the pointer is over the element.
 */
export default function Hov({ as = 'div', style, hoverStyle, onClick, title, className, children }: HovProps) {
  const [hover, setHover] = useState(false)
  const merged = hover && hoverStyle ? { ...style, ...hoverStyle } : style
  const common = {
    style: merged,
    onClick,
    title,
    className,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  }
  return as === 'button'
    ? <button type="button" {...common}>{children}</button>
    : <div {...common}>{children}</div>
}
