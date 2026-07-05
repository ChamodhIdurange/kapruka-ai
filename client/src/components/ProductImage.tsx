import { useState } from 'react'
import type { Product } from '../types'
import { tileBg } from '../catalog'
import { transcriptGlyph } from '../glyphs'

interface Props {
  product: Product
  height: number
  glyphWrap?: number
}

/** Real product image with a gradient + category-glyph fallback. */
export default function ProductImage({ product, height, glyphWrap = 60 }: Props) {
  const [broken, setBroken] = useState(false)
  const showImg = product.imageUrl && !broken
  return (
    <div style={{ position: 'relative', height, background: tileBg(product.id), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {showImg ? (
        <img
          className="kp-card-img"
          src={product.imageUrl as string}
          alt={product.name}
          loading="lazy"
          onError={() => setBroken(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{ width: glyphWrap, height: glyphWrap, borderRadius: '50%', background: 'rgba(255,255,255,.24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {transcriptGlyph(product.cat ?? 'hamper')}
        </div>
      )}
    </div>
  )
}
