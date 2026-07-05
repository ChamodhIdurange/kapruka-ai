import type { ReactNode } from 'react'
import type { Category } from './types'
import { Cake, CakeBasket, CakeCard, Choc, Flower, FlowerStem, Hamper, HamperBow } from './icons'

const WHITE = '#fff'
const SOFT_WHITE = 'rgba(255,255,255,.85)'

/** Glyph for the transcript product-card circle (white stroke). */
export function transcriptGlyph(cat: Category): ReactNode {
  switch (cat) {
    case 'cake': return <CakeCard size={30} stroke={WHITE} strokeWidth={1.6} />
    case 'flower': return <FlowerStem size={30} stroke={WHITE} />
    case 'choc': return <Choc size={28} stroke={WHITE} strokeWidth={1.6} />
    case 'hamper': return <HamperBow size={29} stroke={WHITE} />
  }
}

/** Glyph for the browse-modal grid card circle (white stroke). */
export function browseGlyph(cat: Category): ReactNode {
  switch (cat) {
    case 'cake': return <CakeCard size={26} stroke={WHITE} strokeWidth={1.6} />
    case 'flower': return <FlowerStem size={26} stroke={WHITE} />
    case 'choc': return <Choc size={24} stroke={WHITE} strokeWidth={1.6} />
    case 'hamper': return <Hamper size={25} stroke={WHITE} />
  }
}

/** Glyph for the basket-panel item tile (translucent white stroke). */
export function basketGlyph(cat: Category): ReactNode {
  switch (cat) {
    case 'cake': return <CakeBasket size={24} stroke={SOFT_WHITE} strokeWidth={1.6} />
    case 'flower': return <Flower size={24} stroke={SOFT_WHITE} strokeWidth={1.5} />
    case 'choc': return <Choc size={22} stroke={SOFT_WHITE} strokeWidth={1.6} />
    case 'hamper': return <Hamper size={23} stroke={SOFT_WHITE} />
  }
}

/** Hero quick-chip icon. */
export { Cake }
